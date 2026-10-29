import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { estimateFareSchema, createRideSchema, cancelRideSchema, rateRideSchema } from '../validators/schemas.js';
import { getRouteEstimate } from '../services/routingService.js';
import { calculateFareForCategory, calculateAllFares } from '../services/fareService.js';
import { createPaymentOrder } from '../services/paymentService.js';
import { broadcastRideStatusUpdate, notifyDriverNewRideRequest } from '../services/socketService.js';

export async function estimateFare(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pickupLat, pickupLng, destLat, destLng, category, couponCode } =
      estimateFareSchema.parse(req.body);

    const route = await getRouteEstimate(pickupLat, pickupLng, destLat, destLng);

    if (category) {
      const fare = await calculateFareForCategory(category, route.distanceKm, route.durationMinutes, couponCode);
      res.json({
        success: true,
        route,
        fare,
      });
      return;
    }

    const fares = await calculateAllFares(route.distanceKm, route.durationMinutes, couponCode);
    res.json({
      success: true,
      route,
      fares,
    });
  } catch (error) {
    next(error);
  }
}

export async function createRide(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to book a ride' });
      return;
    }

    const data = createRideSchema.parse(req.body);

    // 1. Calculate route on server side
    const route = await getRouteEstimate(data.pickupLat, data.pickupLng, data.destLat, data.destLng);

    // 2. Calculate fare on server side (never trust client amounts)
    const fare = await calculateFareForCategory(
      data.category,
      route.distanceKm,
      route.durationMinutes,
      data.couponCode
    );

    // 3. Generate unique booking code and 4-digit OTP
    const bookingCode = `RX-${Math.floor(100000 + Math.random() * 900000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 4. Find available online driver matching vehicle category
    const availableDriver = await prisma.driverProfile.findFirst({
      where: {
        isOnline: true,
        isAvailable: true,
        isVerified: true,
        vehicle: {
          category: data.category,
        },
      },
      include: {
        user: true,
        vehicle: true,
      },
    });

    // 5. Create Ride record in transaction
    const ride = await prisma.$transaction(async (tx) => {
      const newRide = await tx.ride.create({
        data: {
          bookingCode,
          customerId: req.user!.id,
          driverId: availableDriver ? availableDriver.id : null,
          pickupAddress: data.pickupAddress,
          pickupLat: data.pickupLat,
          pickupLng: data.pickupLng,
          destAddress: data.destAddress,
          destLat: data.destLat,
          destLng: data.destLng,
          category: data.category,
          distanceKm: route.distanceKm,
          durationMinutes: route.durationMinutes,
          baseFarePaise: fare.baseFarePaise,
          distanceFarePaise: fare.distanceFarePaise,
          waitingFarePaise: 0,
          surgeMultiplier: fare.surgeMultiplier,
          discountPaise: fare.discountPaise,
          totalFarePaise: fare.totalFarePaise,
          status: availableDriver ? 'DRIVER_ASSIGNED' : 'SEARCHING',
          paymentMethod: data.paymentMethod,
          paymentStatus: 'PENDING',
          otp,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          statusEvents: {
            create: [
              {
                status: 'REQUESTED',
                note: 'Ride requested by customer',
              },
              ...(availableDriver
                ? [
                    {
                      status: 'DRIVER_ASSIGNED',
                      note: `Captain ${availableDriver.user.name} assigned`,
                      lat: availableDriver.currentLat,
                      lng: availableDriver.currentLng,
                    },
                  ]
                : [
                    {
                      status: 'SEARCHING',
                      note: 'Searching for nearby captains',
                    },
                  ]),
            ],
          },
        },
        include: {
          customer: {
            select: { id: true, name: true, phone: true, avatar: true },
          },
          driver: {
            include: {
              user: { select: { id: true, name: true, phone: true, avatar: true } },
              vehicle: true,
            },
          },
        },
      });

      // If coupon used, increment coupon timesUsed
      if (data.couponCode && fare.discountPaise > 0) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode.toUpperCase() },
        });
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { timesUsed: { increment: 1 } },
          });
          await tx.couponRedemption.create({
            data: {
              couponId: coupon.id,
              userId: req.user!.id,
              rideId: newRide.id,
              discountPaise: fare.discountPaise,
            },
          });
        }
      }

      // If driver assigned, set driver isAvailable = false
      if (availableDriver) {
        await tx.driverProfile.update({
          where: { id: availableDriver.id },
          data: { isAvailable: false },
        });
      }

      return newRide;
    });

    // 6. Handle payment initialization
    const paymentOrder = await createPaymentOrder({
      rideId: ride.id,
      amountPaise: ride.totalFarePaise,
      provider: data.paymentMethod,
    });

    // 7. Activity Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'RIDE_BOOKED',
        entityType: 'RIDE',
        entityId: ride.id,
        metadata: JSON.stringify({ bookingCode, category: data.category }),
      },
    });

    // 8. Real-time notifications
    if (availableDriver) {
      notifyDriverNewRideRequest(availableDriver.id, {
        rideId: ride.id,
        bookingCode: ride.bookingCode,
        category: ride.category,
        pickupAddress: ride.pickupAddress,
        destAddress: ride.destAddress,
        fareRupees: (ride.totalFarePaise / 100).toFixed(2),
      });
      broadcastRideStatusUpdate(ride.id, 'DRIVER_ASSIGNED', {
        driver: ride.driver,
        status: 'DRIVER_ASSIGNED',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully',
      ride,
      paymentOrder,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRides(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { status, limit = '20', page = '1' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      customerId: req.user.id,
    };

    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          driver: {
            include: {
              user: { select: { id: true, name: true, phone: true, avatar: true } },
              vehicle: true,
            },
          },
          rating: true,
          payments: true,
        },
      }),
      prisma.ride.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      rides,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRideById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatar: true } },
            vehicle: true,
          },
        },
        statusEvents: {
          orderBy: { createdAt: 'asc' },
        },
        payments: true,
        rating: true,
      },
    });

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    // Role ownership check
    if (
      req.user &&
      req.user.role !== 'ADMIN' &&
      ride.customerId !== req.user.id &&
      ride.driverId !== req.user.driverProfileId
    ) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this ride details' });
      return;
    }

    res.json({
      success: true,
      ride,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelRide(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { reason } = cancelRideSchema.parse(req.body);

    const ride = await prisma.ride.findUnique({
      where: { id },
    });

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    if (['COMPLETED', 'CANCELLED'].includes(ride.status)) {
      res.status(400).json({ success: false, message: `Cannot cancel a ride that is already ${ride.status.toLowerCase()}` });
      return;
    }

    const updatedRide = await prisma.$transaction(async (tx) => {
      const updated = await tx.ride.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelReason: reason,
          cancelledBy: req.user!.role,
        },
        include: {
          driver: true,
        },
      });

      await tx.rideStatusEvent.create({
        data: {
          rideId: id,
          status: 'CANCELLED',
          note: `Cancelled by ${req.user!.role}: ${reason}`,
        },
      });

      // Free driver if assigned
      if (ride.driverId) {
        await tx.driverProfile.update({
          where: { id: ride.driverId },
          data: { isAvailable: true },
        });
      }

      return updated;
    });

    broadcastRideStatusUpdate(id, 'CANCELLED', { reason, cancelledBy: req.user.role });

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      ride: updatedRide,
    });
  } catch (error) {
    next(error);
  }
}

export async function rateRide(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { score, feedback, tags } = rateRideSchema.parse(req.body);

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: { rating: true },
    });

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    if (ride.customerId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Only the customer can rate this ride' });
      return;
    }

    if (ride.status !== 'COMPLETED') {
      res.status(400).json({ success: false, message: 'You can only rate completed rides' });
      return;
    }

    if (ride.rating) {
      res.status(400).json({ success: false, message: 'This ride has already been rated' });
      return;
    }

    if (!ride.driverId) {
      res.status(400).json({ success: false, message: 'No driver associated with this ride' });
      return;
    }

    const rating = await prisma.$transaction(async (tx) => {
      const newRating = await tx.rating.create({
        data: {
          rideId: id,
          customerId: req.user!.id,
          driverId: ride.driverId!,
          score,
          feedback,
          tags,
        },
      });

      // Recalculate driver average rating
      const allDriverRatings = await tx.rating.findMany({
        where: { driverId: ride.driverId! },
        select: { score: true },
      });

      const avgScore =
        allDriverRatings.reduce((sum, r) => sum + r.score, 0) / allDriverRatings.length;

      await tx.driverProfile.update({
        where: { id: ride.driverId! },
        data: { rating: parseFloat(avgScore.toFixed(2)) },
      });

      return newRating;
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for rating your ride!',
      rating,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRideReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        customer: true,
        driver: {
          include: {
            user: true,
            vehicle: true,
          },
        },
        payments: true,
      },
    });

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    const payment = ride.payments[0];

    const receipt = {
      receiptNumber: payment?.receiptNumber || `RCPT-${ride.bookingCode}`,
      bookingCode: ride.bookingCode,
      date: ride.createdAt,
      customerName: ride.customer.name,
      customerPhone: ride.customer.phone,
      driverName: ride.driver?.user.name || 'Assigned Captain',
      vehicleDetails: ride.driver?.vehicle
        ? `${ride.driver.vehicle.make} ${ride.driver.vehicle.model} (${ride.driver.vehicle.plateNumber})`
        : 'RideX Fleet Vehicle',
      rideCategory: ride.category,
      pickupAddress: ride.pickupAddress,
      destAddress: ride.destAddress,
      distanceKm: ride.distanceKm,
      durationMinutes: ride.durationMinutes,
      fareBreakdown: {
        baseFareRupees: (ride.baseFarePaise / 100).toFixed(2),
        distanceFareRupees: (ride.distanceFarePaise / 100).toFixed(2),
        waitingFareRupees: (ride.waitingFarePaise / 100).toFixed(2),
        surgeMultiplier: ride.surgeMultiplier,
        discountRupees: (ride.discountPaise / 100).toFixed(2),
        totalFareRupees: (ride.totalFarePaise / 100).toFixed(2),
      },
      paymentMethod: ride.paymentMethod,
      paymentStatus: ride.paymentStatus,
      taxIncluded: true,
    };

    res.json({
      success: true,
      receipt,
    });
  } catch (error) {
    next(error);
  }
}
