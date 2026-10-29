"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportTicketSchema = exports.couponCreateSchema = exports.couponValidateSchema = exports.savedAddressSchema = exports.updateRideStatusSchema = exports.driverAvailabilitySchema = exports.rateRideSchema = exports.cancelRideSchema = exports.createRideSchema = exports.estimateFareSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address format'),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number. Include country code e.g. +919876543210'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['CUSTOMER', 'DRIVER']).default('CUSTOMER'),
    // Driver specific optional fields
    licenseNumber: zod_1.z.string().optional(),
    vehicleCategory: zod_1.z.enum(['BIKE', 'AUTO', 'CAB_ECONOMY', 'CAB_PREMIUM']).optional(),
    vehicleMake: zod_1.z.string().optional(),
    vehicleModel: zod_1.z.string().optional(),
    vehicleColor: zod_1.z.string().optional(),
    vehiclePlateNumber: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().min(3, 'Email or phone is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
    avatar: zod_1.z.string().url().optional(),
});
exports.estimateFareSchema = zod_1.z.object({
    pickupLat: zod_1.z.number().min(-90).max(90),
    pickupLng: zod_1.z.number().min(-180).max(180),
    destLat: zod_1.z.number().min(-90).max(90),
    destLng: zod_1.z.number().min(-180).max(180),
    category: zod_1.z.enum(['BIKE', 'AUTO', 'CAB_ECONOMY', 'CAB_PREMIUM']).optional(),
    couponCode: zod_1.z.string().optional(),
});
exports.createRideSchema = zod_1.z.object({
    pickupAddress: zod_1.z.string().min(3, 'Pickup address is required'),
    pickupLat: zod_1.z.number().min(-90).max(90),
    pickupLng: zod_1.z.number().min(-180).max(180),
    destAddress: zod_1.z.string().min(3, 'Destination address is required'),
    destLat: zod_1.z.number().min(-90).max(90),
    destLng: zod_1.z.number().min(-180).max(180),
    category: zod_1.z.enum(['BIKE', 'AUTO', 'CAB_ECONOMY', 'CAB_PREMIUM']),
    paymentMethod: zod_1.z.enum(['CASH', 'RAZORPAY_DEMO', 'RAZORPAY_LIVE']).default('CASH'),
    couponCode: zod_1.z.string().optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
});
exports.cancelRideSchema = zod_1.z.object({
    reason: zod_1.z.string().min(3, 'Cancellation reason is required'),
});
exports.rateRideSchema = zod_1.z.object({
    score: zod_1.z.number().int().min(1).max(5),
    feedback: zod_1.z.string().max(500).optional(),
    tags: zod_1.z.string().optional(),
});
exports.driverAvailabilitySchema = zod_1.z.object({
    isOnline: zod_1.z.boolean().optional(),
    isAvailable: zod_1.z.boolean().optional(),
    currentLat: zod_1.z.number().optional(),
    currentLng: zod_1.z.number().optional(),
});
exports.updateRideStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'REQUESTED',
        'SEARCHING',
        'DRIVER_ASSIGNED',
        'DRIVER_ARRIVING',
        'ARRIVED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
    ]),
    otp: zod_1.z.string().length(4).optional(),
    note: zod_1.z.string().optional(),
});
exports.savedAddressSchema = zod_1.z.object({
    label: zod_1.z.enum(['HOME', 'WORK', 'GYM', 'OTHER']),
    title: zod_1.z.string().min(1, 'Title is required'),
    address: zod_1.z.string().min(3, 'Address is required'),
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
    isFavorite: zod_1.z.boolean().default(false),
});
exports.couponValidateSchema = zod_1.z.object({
    code: zod_1.z.string().min(2),
    rideAmountPaise: zod_1.z.number().int().positive(),
    category: zod_1.z.string().optional(),
});
exports.couponCreateSchema = zod_1.z.object({
    code: zod_1.z.string().min(3).toUpperCase(),
    description: zod_1.z.string().min(3),
    discountType: zod_1.z.enum(['PERCENTAGE', 'FLAT']),
    discountValue: zod_1.z.number().positive(),
    minOrderPaise: zod_1.z.number().int().nonnegative().default(0),
    maxDiscountPaise: zod_1.z.number().int().positive().optional(),
    usageLimit: zod_1.z.number().int().positive().default(1000),
    validUntil: zod_1.z.string().datetime(),
    isActive: zod_1.z.boolean().default(true),
});
exports.supportTicketSchema = zod_1.z.object({
    rideId: zod_1.z.string().optional(),
    category: zod_1.z.enum(['BILLING', 'SAFETY', 'DRIVER_BEHAVIOR', 'APP_ISSUE', 'LOST_ITEM', 'OTHER']),
    subject: zod_1.z.string().min(3),
    message: zod_1.z.string().min(10),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});
