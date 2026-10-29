import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { couponCreateSchema } from '../validators/schemas.js';

export async function getAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalUsers,
      totalDrivers,
      verifiedDrivers,
      totalRides,
      completedRides,
      cancelledRides,
      ridesByCategory,
      allCompletedRides,
      recentActivityLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.driverProfile.count(),
      prisma.driverProfile.count({ where: { isVerified: true } }),
      prisma.ride.count(),
      prisma.ride.count({ where: { status: 'COMPLETED' } }),
      prisma.ride.count({ where: { status: 'CANCELLED' } }),
      prisma.ride.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      prisma.ride.findMany({
        where: { status: 'COMPLETED' },
        select: { totalFarePaise: true, createdAt: true },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, role: true } } },
      }),
    ]);

    const totalGrossRevenuePaise = allCompletedRides.reduce((sum, r) => sum + r.totalFarePaise, 0);
    const platformCommissionPaise = Math.round(totalGrossRevenuePaise * 0.15); // 15% platform fee
    const driverPayoutPaise = totalGrossRevenuePaise - platformCommissionPaise;

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalDrivers,
        verifiedDrivers,
        totalRides,
        completedRides,
        cancelledRides,
        totalRevenueRupees: (totalGrossRevenuePaise / 100).toFixed(2),
        platformCommissionRupees: (platformCommissionPaise / 100).toFixed(2),
        driverPayoutRupees: (driverPayoutPaise / 100).toFixed(2),
      },
      categoryBreakdown: ridesByCategory.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      recentActivityLogs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role && typeof role === 'string') {
      where.role = role;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { ridesAsCustomer: true },
          },
          driverProfile: {
            include: { vehicle: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        totalRides: u._count.ridesAsCustomer,
        driverProfile: u.driverProfile,
      })),
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

export async function getDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const drivers = await prisma.driverProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        vehicle: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      drivers,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { isVerified, notes } = req.body;

    const driver = await prisma.driverProfile.update({
      where: { id },
      data: {
        isVerified: Boolean(isVerified),
        documents: {
          updateMany: {
            where: { driverProfileId: id },
            data: {
              status: isVerified ? 'APPROVED' : 'REJECTED',
              notes: notes || (isVerified ? 'Verified by Admin' : 'Rejected due to incomplete documents'),
              verifiedAt: new Date(),
            },
          },
        },
      },
      include: {
        user: true,
        documents: true,
      },
    });

    // Notify driver
    await prisma.notification.create({
      data: {
        userId: driver.userId,
        title: isVerified ? 'Driver Account Verified! 🚀' : 'Document Verification Update',
        message: isVerified
          ? 'Congratulations! Your RideX captain profile has been verified. You can now accept rides.'
          : `Verification notice: ${notes || 'Please resubmit your documents.'}`,
        type: 'SYSTEM',
      },
    });

    res.json({
      success: true,
      message: `Driver profile ${isVerified ? 'verified' : 'rejected'} successfully`,
      driver,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFareRules(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rules = await prisma.fareRule.findMany({
      orderBy: { baseFarePaise: 'asc' },
    });
    res.json({ success: true, rules });
  } catch (error) {
    next(error);
  }
}

export async function updateFareRule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { baseFarePaise, perKmRatePaise, minFarePaise, surgeMultiplier, isActive } = req.body;

    const updated = await prisma.fareRule.update({
      where: { id },
      data: {
        ...(typeof baseFarePaise === 'number' ? { baseFarePaise } : {}),
        ...(typeof perKmRatePaise === 'number' ? { perKmRatePaise } : {}),
        ...(typeof minFarePaise === 'number' ? { minFarePaise } : {}),
        ...(typeof surgeMultiplier === 'number' ? { surgeMultiplier } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
    });

    res.json({
      success: true,
      message: `Fare rule for ${updated.displayName} updated successfully`,
      rule: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = couponCreateSchema.parse(req.body);

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderPaise: data.minOrderPaise,
        maxDiscountPaise: data.maxDiscountPaise,
        usageLimit: data.usageLimit,
        validUntil: new Date(data.validUntil),
        isActive: data.isActive,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSupportTickets(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tickets = await prisma.supportTickets.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        ride: { select: { id: true, bookingCode: true, category: true } },
      },
    });

    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
}

export async function updateSupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const ticket = await prisma.supportTickets.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes ? { adminNotes } : {}),
      },
      include: { user: true },
    });

    res.json({
      success: true,
      message: 'Support ticket updated',
      ticket,
    });
  } catch (error) {
    next(error);
  }
}
