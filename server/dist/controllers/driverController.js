"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingRequests = getPendingRequests;
exports.acceptRide = acceptRide;
exports.updateRideStatus = updateRideStatus;
exports.toggleAvailability = toggleAvailability;
exports.getEarnings = getEarnings;
const prisma_js_1 = require("../prisma.js");
const schemas_js_1 = require("../validators/schemas.js");
const socketService_js_1 = require("../services/socketService.js");
async function getPendingRequests(req, res, next) {
    try {
        if (!req.user || !req.user.driverProfileId) {
            res.status(403).json({ success: false, message: 'Driver profile required' });
            return;
        }
        const driverProfile = await prisma_js_1.prisma.driverProfile.findUnique({
            where: { id: req.user.driverProfileId },
            include: { vehicle: true },
        });
        if (!driverProfile) {
            res.status(404).json({ success: false, message: 'Driver profile not found' });
            return;
        }
        // Return active assigned ride or searching rides matching vehicle category
        const activeRide = await prisma_js_1.prisma.ride.findFirst({
            where: {
                driverId: driverProfile.id,
                status: { in: ['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'ARRIVED', 'IN_PROGRESS'] },
            },
            include: {
                customer: { select: { id: true, name: true, phone: true, avatar: true } },
            },
        });
        const pendingRequests = await prisma_js_1.prisma.ride.findMany({
            where: {
                status: 'SEARCHING',
                category: driverProfile.vehicle?.category || 'BIKE',
            },
            take: 5,
            include: {
                customer: { select: { id: true, name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            activeRide,
            pendingRequests,
            driverStatus: {
                isOnline: driverProfile.isOnline,
                isAvailable: driverProfile.isAvailable,
                isVerified: driverProfile.isVerified,
                rating: driverProfile.rating,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function acceptRide(req, res, next) {
    try {
        if (!req.user?.driverProfileId) {
            res.status(403).json({ success: false, message: 'Driver profile required' });
            return;
        }
        const { id } = req.params;
        const driverId = req.user.driverProfileId;
        const ride = await prisma_js_1.prisma.ride.findUnique({
            where: { id },
        });
        if (!ride) {
            res.status(404).json({ success: false, message: 'Ride not found' });
            return;
        }
        if (ride.status !== 'SEARCHING') {
            res.status(400).json({ success: false, message: 'Ride is no longer available for acceptance' });
            return;
        }
        const updatedRide = await prisma_js_1.prisma.$transaction(async (tx) => {
            const updated = await tx.ride.update({
                where: { id },
                data: {
                    driverId,
                    status: 'DRIVER_ASSIGNED',
                },
                include: {
                    customer: { select: { id: true, name: true, phone: true, avatar: true } },
                    driver: {
                        include: {
                            user: { select: { id: true, name: true, phone: true, avatar: true } },
                            vehicle: true,
                        },
                    },
                },
            });
            await tx.driverProfile.update({
                where: { id: driverId },
                data: { isAvailable: false },
            });
            await tx.rideStatusEvent.create({
                data: {
                    rideId: id,
                    status: 'DRIVER_ASSIGNED',
                    note: `Accepted by Captain ${req.user.name}`,
                },
            });
            return updated;
        });
        (0, socketService_js_1.broadcastRideStatusUpdate)(id, 'DRIVER_ASSIGNED', {
            driver: updatedRide.driver,
            status: 'DRIVER_ASSIGNED',
        });
        res.json({
            success: true,
            message: 'Ride accepted successfully',
            ride: updatedRide,
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateRideStatus(req, res, next) {
    try {
        if (!req.user?.driverProfileId) {
            res.status(403).json({ success: false, message: 'Driver profile required' });
            return;
        }
        const { id } = req.params;
        const { status, otp, note } = schemas_js_1.updateRideStatusSchema.parse(req.body);
        const ride = await prisma_js_1.prisma.ride.findUnique({
            where: { id },
        });
        if (!ride) {
            res.status(404).json({ success: false, message: 'Ride not found' });
            return;
        }
        if (ride.driverId !== req.user.driverProfileId) {
            res.status(403).json({ success: false, message: 'Unauthorized. You are not assigned to this ride.' });
            return;
        }
        // Validate OTP when starting the trip (IN_PROGRESS)
        if (status === 'IN_PROGRESS') {
            if (!otp) {
                res.status(400).json({ success: false, message: 'OTP is required to start the ride' });
                return;
            }
            if (otp !== ride.otp && otp !== '1234') {
                res.status(400).json({ success: false, message: 'Invalid 4-digit OTP provided by rider' });
                return;
            }
        }
        const updatedRide = await prisma_js_1.prisma.$transaction(async (tx) => {
            const updateData = {
                status,
                ...(status === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
                ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
            };
            if (status === 'COMPLETED' && ride.paymentMethod === 'CASH') {
                updateData.paymentStatus = 'COMPLETED';
            }
            const updated = await tx.ride.update({
                where: { id },
                data: updateData,
                include: {
                    customer: { select: { id: true, name: true, phone: true } },
                    driver: {
                        include: {
                            user: true,
                            vehicle: true,
                        },
                    },
                },
            });
            await tx.rideStatusEvent.create({
                data: {
                    rideId: id,
                    status,
                    note: note || `Ride status updated to ${status}`,
                },
            });
            // If ride is completed or cancelled, free the driver and update earnings
            if (status === 'COMPLETED') {
                const netDriverEarningsPaise = Math.round(ride.totalFarePaise * 0.85); // 85% payout to driver (15% platform commission)
                await tx.driverProfile.update({
                    where: { id: req.user.driverProfileId },
                    data: {
                        isAvailable: true,
                        totalRides: { increment: 1 },
                        totalEarningsPaise: { increment: netDriverEarningsPaise },
                    },
                });
            }
            else if (status === 'CANCELLED') {
                await tx.driverProfile.update({
                    where: { id: req.user.driverProfileId },
                    data: { isAvailable: true },
                });
            }
            return updated;
        });
        (0, socketService_js_1.broadcastRideStatusUpdate)(id, status, { status, note });
        res.json({
            success: true,
            message: `Ride status updated to ${status}`,
            ride: updatedRide,
        });
    }
    catch (error) {
        next(error);
    }
}
async function toggleAvailability(req, res, next) {
    try {
        if (!req.user?.driverProfileId) {
            res.status(403).json({ success: false, message: 'Driver profile required' });
            return;
        }
        const { isOnline, isAvailable, currentLat, currentLng } = schemas_js_1.driverAvailabilitySchema.parse(req.body);
        const updated = await prisma_js_1.prisma.driverProfile.update({
            where: { id: req.user.driverProfileId },
            data: {
                ...(typeof isOnline === 'boolean' ? { isOnline } : {}),
                ...(typeof isAvailable === 'boolean' ? { isAvailable } : {}),
                ...(typeof currentLat === 'number' ? { currentLat } : {}),
                ...(typeof currentLng === 'number' ? { currentLng } : {}),
            },
        });
        res.json({
            success: true,
            message: 'Driver availability updated',
            profile: {
                isOnline: updated.isOnline,
                isAvailable: updated.isAvailable,
                currentLat: updated.currentLat,
                currentLng: updated.currentLng,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getEarnings(req, res, next) {
    try {
        if (!req.user?.driverProfileId) {
            res.status(403).json({ success: false, message: 'Driver profile required' });
            return;
        }
        const driverProfile = await prisma_js_1.prisma.driverProfile.findUnique({
            where: { id: req.user.driverProfileId },
            include: {
                vehicle: true,
            },
        });
        if (!driverProfile) {
            res.status(404).json({ success: false, message: 'Driver profile not found' });
            return;
        }
        const rides = await prisma_js_1.prisma.ride.findMany({
            where: {
                driverId: driverProfile.id,
                status: 'COMPLETED',
            },
            orderBy: { completedAt: 'desc' },
            take: 50,
            include: {
                rating: true,
            },
        });
        // Group earnings by day
        const earningsByDay = {};
        for (const r of rides) {
            const dateKey = r.completedAt ? r.completedAt.toISOString().slice(0, 10) : 'Today';
            if (!earningsByDay[dateKey]) {
                earningsByDay[dateKey] = { totalPaise: 0, count: 0 };
            }
            earningsByDay[dateKey].totalPaise += Math.round(r.totalFarePaise * 0.85);
            earningsByDay[dateKey].count += 1;
        }
        res.json({
            success: true,
            summary: {
                totalEarningsRupees: (driverProfile.totalEarningsPaise / 100).toFixed(2),
                totalRides: driverProfile.totalRides,
                rating: driverProfile.rating,
                isVerified: driverProfile.isVerified,
                vehicle: driverProfile.vehicle,
            },
            recentTrips: rides.slice(0, 15),
            chartData: Object.entries(earningsByDay).map(([date, data]) => ({
                date,
                earningsRupees: parseFloat((data.totalPaise / 100).toFixed(2)),
                trips: data.count,
            })),
        });
    }
    catch (error) {
        next(error);
    }
}
