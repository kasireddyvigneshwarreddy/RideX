import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number. Include country code e.g. +919876543210'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'DRIVER']).default('CUSTOMER'),
  // Driver specific optional fields
  licenseNumber: z.string().optional(),
  vehicleCategory: z.enum(['BIKE', 'AUTO', 'CAB_ECONOMY', 'CAB_PREMIUM']).optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleColor: z.string().optional(),
  vehiclePlateNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(3, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  avatar: z.string().url().optional(),
});

export const estimateFareSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
  category: z.enum(['BIKE', 'AUTO', 'CAB_ECONOMY', 'CAB_PREMIUM']).optional(),
  couponCode: z.string().optional(),
});

export const createRideSchema = z.object({
  pickupAddress: z.string().min(3, 'Pickup address is required'),
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  destAddress: z.string().min(3, 'Destination address is required'),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
  category: z.enum(['BIKE', 'AUTO', 'CAB_ECONOMY', 'CAB_PREMIUM']),
  paymentMethod: z.enum(['CASH', 'RAZORPAY_DEMO', 'RAZORPAY_LIVE']).default('CASH'),
  couponCode: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const cancelRideSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});

export const rateRideSchema = z.object({
  score: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional(),
  tags: z.string().optional(),
});

export const driverAvailabilitySchema = z.object({
  isOnline: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  currentLat: z.number().optional(),
  currentLng: z.number().optional(),
});

export const updateRideStatusSchema = z.object({
  status: z.enum([
    'REQUESTED',
    'SEARCHING',
    'DRIVER_ASSIGNED',
    'DRIVER_ARRIVING',
    'ARRIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ]),
  otp: z.string().length(4).optional(),
  note: z.string().optional(),
});

export const savedAddressSchema = z.object({
  label: z.enum(['HOME', 'WORK', 'GYM', 'OTHER']),
  title: z.string().min(1, 'Title is required'),
  address: z.string().min(3, 'Address is required'),
  lat: z.number(),
  lng: z.number(),
  isFavorite: z.boolean().default(false),
});

export const couponValidateSchema = z.object({
  code: z.string().min(2),
  rideAmountPaise: z.number().int().positive(),
  category: z.string().optional(),
});

export const couponCreateSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().min(3),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().positive(),
  minOrderPaise: z.number().int().nonnegative().default(0),
  maxDiscountPaise: z.number().int().positive().optional(),
  usageLimit: z.number().int().positive().default(1000),
  validUntil: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export const supportTicketSchema = z.object({
  rideId: z.string().optional(),
  category: z.enum(['BILLING', 'SAFETY', 'DRIVER_BEHAVIOR', 'APP_ISSUE', 'LOST_ITEM', 'OTHER']),
  subject: z.string().min(3),
  message: z.string().min(10),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});
