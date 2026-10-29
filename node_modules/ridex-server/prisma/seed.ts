import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting RideX Database Seeding...');

  // 1. Clear existing records safely
  await prisma.activityLog.deleteMany();
  await prisma.supportTickets.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rideStatusEvent.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.referralReward.deleteMany();
  await prisma.referralCode.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.driverDocument.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.savedAddress.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.fareRule.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Fare Rules
  console.log('🛵 Seeding Fare Rules...');
  await prisma.fareRule.createMany({
    data: [
      {
        category: 'BIKE',
        displayName: 'RideX Bike Taxi',
        description: 'Zip through Bangalore traffic on a 2-wheeler. Fastest and most affordable.',
        baseFarePaise: 2500, // ₹25
        perKmRatePaise: 800,  // ₹8/km
        minFarePaise: 3000,   // ₹30
        waitingChargePaise: 100, // ₹1/min
        surgeMultiplier: 1.0,
        capacity: 1,
        iconName: 'Bike',
        isActive: true,
      },
      {
        category: 'AUTO',
        displayName: 'RideX Auto',
        description: 'No meter haggling. Guaranteed doorstep pickup with standard rates.',
        baseFarePaise: 3500, // ₹35
        perKmRatePaise: 1200, // ₹12/km
        minFarePaise: 4000,   // ₹40
        waitingChargePaise: 150, // ₹1.5/min
        surgeMultiplier: 1.0,
        capacity: 3,
        iconName: 'Zap',
        isActive: true,
      },
      {
        category: 'CAB_ECONOMY',
        displayName: 'RideX Cab Mini',
        description: 'Compact AC hatchbacks for pocket-friendly, comfortable city commutes.',
        baseFarePaise: 6000, // ₹60
        perKmRatePaise: 1500, // ₹15/km
        minFarePaise: 8000,   // ₹80
        waitingChargePaise: 200, // ₹2/min
        surgeMultiplier: 1.0,
        capacity: 4,
        iconName: 'Car',
        isActive: true,
      },
      {
        category: 'CAB_PREMIUM',
        displayName: 'RideX Cab Prime Sedan',
        description: 'Top-rated captains in premium sedans with extra legroom and quiet rides.',
        baseFarePaise: 10000, // ₹100
        perKmRatePaise: 2200,  // ₹22/km
        minFarePaise: 14000,   // ₹140
        waitingChargePaise: 300,  // ₹3/min
        surgeMultiplier: 1.0,
        capacity: 4,
        iconName: 'ShieldCheck',
        isActive: true,
      },
    ],
  });

  // 3. Password Hashes
  const customerPassword = await bcrypt.hash('Password123!', 10);
  const driverPassword = await bcrypt.hash('Password123!', 10);
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);

  // 4. Seed Users
  console.log('👤 Seeding Users & Drivers...');
  const customer = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'customer@ridex.in',
      phone: '+919876543210',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const driver1 = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'driver@ridex.in',
      phone: '+919876543211',
      passwordHash: driverPassword,
      role: 'DRIVER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      name: 'Suresh Gowda',
      email: 'auto.driver@ridex.in',
      phone: '+919876543212',
      passwordHash: driverPassword,
      role: 'DRIVER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const driverUnverified = await prisma.user.create({
    data: {
      name: 'Vikram Singh',
      email: 'vikram.cab@ridex.in',
      phone: '+919876543213',
      passwordHash: driverPassword,
      role: 'DRIVER',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'RideX Ops Admin',
      email: 'admin@ridex.in',
      phone: '+919876543299',
      passwordHash: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
  });

  // 5. Seed Driver Profiles & Vehicles
  const driverProfile1 = await prisma.driverProfile.create({
    data: {
      userId: driver1.id,
      licenseNumber: 'KA-01-2019-0098712',
      isOnline: true,
      isAvailable: true,
      isVerified: true,
      rating: 4.92,
      totalRides: 384,
      totalEarningsPaise: 4256000, // ₹42,560
      currentLat: 12.9716, // MG Road, Bangalore
      currentLng: 77.5946,
      vehicle: {
        create: {
          category: 'BIKE',
          make: 'Honda',
          model: 'Activa 6G Yellow',
          color: 'Electric Yellow / Black',
          plateNumber: 'KA-01-EQ-4421',
          year: 2023,
        },
      },
      documents: {
        create: [
          {
            docType: 'DRIVING_LICENSE',
            fileUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400',
            status: 'APPROVED',
            verifiedAt: new Date(),
          },
          {
            docType: 'RC_BOOK',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
            status: 'APPROVED',
            verifiedAt: new Date(),
          },
        ],
      },
    },
  });

  const driverProfile2 = await prisma.driverProfile.create({
    data: {
      userId: driver2.id,
      licenseNumber: 'KA-03-2020-0043129',
      isOnline: true,
      isAvailable: true,
      isVerified: true,
      rating: 4.88,
      totalRides: 512,
      totalEarningsPaise: 6890000, // ₹68,900
      currentLat: 12.9352, // Koramangala
      currentLng: 77.6245,
      vehicle: {
        create: {
          category: 'AUTO',
          make: 'Bajaj',
          model: 'RE Compact 4S',
          color: 'Yellow & Green',
          plateNumber: 'KA-03-AA-9988',
          year: 2022,
        },
      },
      documents: {
        create: [
          {
            docType: 'DRIVING_LICENSE',
            fileUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400',
            status: 'APPROVED',
            verifiedAt: new Date(),
          },
        ],
      },
    },
  });

  // Unverified driver for admin verification testing
  await prisma.driverProfile.create({
    data: {
      userId: driverUnverified.id,
      licenseNumber: 'KA-05-2022-0011223',
      isOnline: false,
      isAvailable: false,
      isVerified: false,
      rating: 5.0,
      totalRides: 0,
      totalEarningsPaise: 0,
      currentLat: 12.9784,
      currentLng: 77.6408,
      vehicle: {
        create: {
          category: 'CAB_ECONOMY',
          make: 'Maruti Suzuki',
          model: 'WagonR CNG',
          color: 'Silver White',
          plateNumber: 'KA-05-MM-7711',
          year: 2024,
        },
      },
      documents: {
        create: [
          {
            docType: 'DRIVING_LICENSE',
            fileUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400',
            status: 'PENDING',
            notes: 'Awaiting admin verification of Commercial Badge',
          },
          {
            docType: 'AADHAAR',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
            status: 'PENDING',
          },
        ],
      },
    },
  });

  // 6. Seed Saved Addresses
  console.log('📍 Seeding Saved Addresses...');
  await prisma.savedAddress.createMany({
    data: [
      {
        userId: customer.id,
        label: 'HOME',
        title: 'Home (Brigade Gateway)',
        address: 'Brigade Gateway, 26/1 Dr Rajkumar Rd, Malleshwaram, Bengaluru, Karnataka 560055',
        lat: 13.0112,
        lng: 77.5548,
        isFavorite: true,
      },
      {
        userId: customer.id,
        label: 'WORK',
        title: 'Office (TechVillage Bellandur)',
        address: 'Embassy TechVillage, Outer Ring Road, Devarabisanahalli, Bellandur, Bengaluru, Karnataka 560103',
        lat: 12.9260,
        lng: 77.6897,
        isFavorite: true,
      },
      {
        userId: customer.id,
        label: 'OTHER',
        title: 'Cult.fit Indiranagar Gym',
        address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
        lat: 12.9719,
        lng: 77.6412,
        isFavorite: false,
      },
    ],
  });

  // 7. Seed Coupons
  console.log('🎟️ Seeding Coupons & Referrals...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'RIDEX50',
        description: '50% OFF up to ₹50 on any RideX Bike or Auto',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minOrderPaise: 3000, // ₹30 min
        maxDiscountPaise: 5000, // ₹50 max
        usageLimit: 10000,
        timesUsed: 142,
        validUntil: new Date('2028-12-31'),
        isActive: true,
      },
      {
        code: 'FIRSTFREE',
        description: 'Flat ₹60 OFF on your first city commute',
        discountType: 'FLAT',
        discountValue: 6000, // ₹60
        minOrderPaise: 6000,
        maxDiscountPaise: 6000,
        usageLimit: 5000,
        timesUsed: 67,
        validUntil: new Date('2028-12-31'),
        isActive: true,
      },
      {
        code: 'RAPIDPASS',
        description: '20% OFF on Prime Sedan rides for office hours',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderPaise: 10000,
        maxDiscountPaise: 10000, // ₹100
        usageLimit: 2000,
        timesUsed: 31,
        validUntil: new Date('2028-12-31'),
        isActive: true,
      },
      {
        code: 'WEEKEND30',
        description: 'Flat ₹30 OFF on all Auto rides on weekends',
        discountType: 'FLAT',
        discountValue: 3000,
        minOrderPaise: 5000,
        maxDiscountPaise: 3000,
        usageLimit: 5000,
        timesUsed: 18,
        validUntil: new Date('2028-12-31'),
        isActive: true,
      },
    ],
  });

  // 8. Seed Referral Code
  await prisma.referralCode.create({
    data: {
      userId: customer.id,
      code: 'AARAV99',
      timesReferred: 3,
      totalRewardsPaise: 15000, // ₹150
    },
  });

  // 9. Seed Past Ride History
  console.log('🚗 Seeding Past Rides & Ratings...');
  const pastRide = await prisma.ride.create({
    data: {
      bookingCode: 'RX-884219',
      customerId: customer.id,
      driverId: driverProfile1.id,
      pickupAddress: 'Brigade Gateway, Malleshwaram, Bengaluru',
      pickupLat: 13.0112,
      pickupLng: 77.5548,
      destAddress: 'MG Road Metro Station, Bengaluru',
      destLat: 12.9756,
      destLng: 77.6066,
      category: 'BIKE',
      distanceKm: 7.4,
      durationMinutes: 22,
      baseFarePaise: 2500,
      distanceFarePaise: 5920,
      waitingFarePaise: 0,
      surgeMultiplier: 1.0,
      discountPaise: 3000,
      totalFarePaise: 5420, // ₹54.20
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      otp: '7821',
      startedAt: new Date(Date.now() - 3600000 * 24),
      completedAt: new Date(Date.now() - 3600000 * 23),
      statusEvents: {
        create: [
          { status: 'REQUESTED', note: 'Ride requested by Aarav' },
          { status: 'DRIVER_ASSIGNED', note: 'Rajesh Kumar accepted' },
          { status: 'ARRIVED', note: 'Captain arrived at pickup' },
          { status: 'IN_PROGRESS', note: 'Ride started with OTP verified' },
          { status: 'COMPLETED', note: 'Ride completed successfully' },
        ],
      },
      payments: {
        create: {
          amountPaise: 5420,
          currency: 'INR',
          provider: 'CASH',
          receiptNumber: 'RCPT-RX-884219',
          status: 'SUCCESS',
        },
      },
      rating: {
        create: {
          customerId: customer.id,
          driverId: driverProfile1.id,
          score: 5,
          feedback: 'Very prompt pickup and smooth ride in peak traffic! Gave a sanitized helmet.',
          tags: 'On-time,Clean Helmet,Smooth Ride',
        },
      },
    },
  });

  // 10. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        title: 'Welcome to RideX India! 🎉',
        message: 'Get 50% OFF on your first 3 bike taxi rides with code RIDEX50. Have a safe commute!',
        type: 'PROMO',
        isRead: false,
      },
      {
        userId: customer.id,
        title: 'Ride Completed • RX-884219',
        message: 'Your ride with Captain Rajesh Kumar was completed. Receipt of ₹54.20 is ready.',
        type: 'RIDE_UPDATE',
        isRead: true,
      },
      {
        userId: customer.id,
        title: 'Safety Tip: Always verify OTP & Helmet',
        message: 'For your security, never board without matching the vehicle number and wearing a helmet.',
        type: 'SAFETY',
        isRead: false,
      },
    ],
  });

  // 11. Seed Support Tickets
  await prisma.supportTickets.create({
    data: {
      userId: customer.id,
      rideId: pastRide.id,
      category: 'BILLING',
      subject: 'Inquiry regarding coupon discount applied',
      message: 'Hello RideX team, I wanted to confirm if the ₹30 discount from coupon WEEKEND30 was applied properly.',
      status: 'RESOLVED',
      priority: 'LOW',
      adminNotes: 'Verified billing ledger. ₹30 coupon discount was deducted accurately.',
    },
  });

  // 12. Seed Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'SYSTEM_INITIALIZED',
        entityType: 'SYSTEM',
        ipAddress: '127.0.0.1',
        metadata: JSON.stringify({ message: 'Database seeded with default Indian mobility catalog' }),
      },
      {
        userId: customer.id,
        action: 'RIDE_COMPLETED',
        entityType: 'RIDE',
        entityId: pastRide.id,
        ipAddress: '127.0.0.1',
      },
    ],
  });

  console.log('✅ RideX Database Seeding Completed Successfully!');
  console.log('------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('• Customer: customer@ridex.in / Password123!');
  console.log('• Driver (Bike): driver@ridex.in / Password123!');
  console.log('• Driver (Auto): auto.driver@ridex.in / Password123!');
  console.log('• Admin: admin@ridex.in / AdminPass123!');
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
