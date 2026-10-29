"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = getAnalytics;
exports.getUsers = getUsers;
exports.getDrivers = getDrivers;
exports.verifyDriver = verifyDriver;
exports.getFareRules = getFareRules;
exports.updateFareRule = updateFareRule;
exports.createCoupon = createCoupon;
exports.getSupportTickets = getSupportTickets;
exports.updateSupportTicket = updateSupportTicket;
const prisma_js_1 = require("../prisma.js");
const schemas_js_1 = require("../validators/schemas.js");
async function getAnalytics(_req, res, next) {
    try {
        const [totalUsers, totalDrivers, verifiedDrivers, totalRides, completedRides, cancelledRides, ridesByCategory, allCompletedRides, recentActivityLogs,] = await Promise.all([
            prisma_js_1.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma_js_1.prisma.driverProfile.count(),
            prisma_js_1.prisma.driverProfile.count({ where: { isVerified: true } }),
            prisma_js_1.prisma.ride.count(),
            prisma_js_1.prisma.ride.count({ where: { status: 'COMPLETED' } }),
            prisma_js_1.prisma.ride.count({ where: { status: 'CANCELLED' } }),
            prisma_js_1.prisma.ride.groupBy({
                by: ['category'],
                _count: { id: true },
            }),
            prisma_js_1.prisma.ride.findMany({
                where: { status: 'COMPLETED' },
                select: { totalFarePaise: true, createdAt: true },
            }),
            prisma_js_1.prisma.activityLog.findMany({
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
    }
    catch (error) {
        next(error);
    }
}
async function getUsers(req, res, next) {
    try {
        const { role, search, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
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
            prisma_js_1.prisma.user.findMany({
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
            prisma_js_1.prisma.user.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
}
async function getDrivers(req, res, next) {
    try {
        const drivers = await prisma_js_1.prisma.driverProfile.findMany({
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
    }
    catch (error) {
        next(error);
    }
}
async function verifyDriver(req, res, next) {
    try {
        const { id } = req.params;
        const { isVerified, notes } = req.body;
        const driver = await prisma_js_1.prisma.driverProfile.update({
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
        await prisma_js_1.prisma.notification.create({
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
    }
    catch (error) {
        next(error);
    }
}
async function getFareRules(_req, res, next) {
    try {
        const rules = await prisma_js_1.prisma.fareRule.findMany({
            orderBy: { baseFarePaise: 'asc' },
        });
        res.json({ success: true, rules });
    }
    catch (error) {
        next(error);
    }
}
async function updateFareRule(req, res, next) {
    try {
        const { id } = req.params;
        const { baseFarePaise, perKmRatePaise, minFarePaise, surgeMultiplier, isActive } = req.body;
        const updated = await prisma_js_1.prisma.fareRule.update({
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
    }
    catch (error) {
        next(error);
    }
}
async function createCoupon(req, res, next) {
    try {
        const data = schemas_js_1.couponCreateSchema.parse(req.body);
        const coupon = await prisma_js_1.prisma.coupon.create({
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
    }
    catch (error) {
        next(error);
    }
}
async function getSupportTickets(_req, res, next) {
    try {
        const tickets = await prisma_js_1.prisma.supportTickets.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                ride: { select: { id: true, bookingCode: true, category: true } },
            },
        });
        res.json({ success: true, tickets });
    }
    catch (error) {
        next(error);
    }
}
async function updateSupportTicket(req, res, next) {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const ticket = await prisma_js_1.prisma.supportTickets.update({
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
    }
    catch (error) {
        next(error);
    }
}
