export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export type RideCategory = 'BIKE' | 'AUTO' | 'CAB_ECONOMY' | 'CAB_PREMIUM';

export type RideStatus =
  | 'REQUESTED'
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'RAZORPAY_DEMO' | 'RAZORPAY_LIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  referralCode?: string;
  driverProfile?: DriverProfile;
}

export interface Vehicle {
  id: string;
  category: RideCategory;
  make: string;
  model: string;
  color: string;
  plateNumber: string;
  year: number;
}

export interface DriverProfile {
  id: string;
  licenseNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  totalRides: number;
  totalEarningsPaise: number;
  currentLat: number;
  currentLng: number;
  vehicle?: Vehicle;
  user?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
}

export interface RideStatusEvent {
  id: string;
  status: RideStatus;
  note?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
}

export interface Ride {
  id: string;
  bookingCode: string;
  customerId: string;
  driverId?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destAddress: string;
  destLat: number;
  destLng: number;
  category: RideCategory;
  distanceKm: number;
  durationMinutes: number;
  baseFarePaise: number;
  distanceFarePaise: number;
  waitingFarePaise: number;
  surgeMultiplier: number;
  discountPaise: number;
  totalFarePaise: number;
  status: RideStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  otp: string;
  cancelReason?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  driver?: DriverProfile;
  statusEvents?: RideStatusEvent[];
  rating?: {
    score: number;
    feedback?: string;
    tags?: string;
  };
}

export interface FareEstimate {
  category: RideCategory;
  displayName: string;
  description: string;
  capacity: number;
  iconName: string;
  distanceKm: number;
  durationMinutes: number;
  baseFarePaise: number;
  distanceFarePaise: number;
  waitingFarePaise: number;
  surgeMultiplier: number;
  subtotalPaise: number;
  discountPaise: number;
  totalFarePaise: number;
  baseFareRupees: number;
  totalFareRupees: number;
  savingsRupees: number;
  couponApplied?: {
    code: string;
    description: string;
    discountRupees: number;
  };
}

export interface RouteEstimate {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][];
  isDemoOrFallback: boolean;
  provider: string;
}

export interface SavedAddress {
  id: string;
  label: 'HOME' | 'WORK' | 'GYM' | 'OTHER';
  title: string;
  address: string;
  lat: number;
  lng: number;
  isFavorite: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderRupees: string;
  maxDiscountRupees: string | null;
  validUntil: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
