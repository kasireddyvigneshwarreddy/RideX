import crypto from 'crypto';
import { prisma } from '../prisma.js';

interface CreateOrderParams {
  rideId: string;
  amountPaise: number;
  currency?: string;
  provider: 'CASH' | 'RAZORPAY_DEMO' | 'RAZORPAY_LIVE';
}

interface PaymentVerifyParams {
  rideId: string;
  orderId?: string;
  paymentId?: string;
  signature?: string;
  provider: 'CASH' | 'RAZORPAY_DEMO' | 'RAZORPAY_LIVE';
}

export function generateReceiptNumber(rideBookingCode: string): string {
  return `RCPT-${rideBookingCode}-${Date.now().toString().slice(-4)}`;
}

export async function createPaymentOrder(params: CreateOrderParams) {
  const { rideId, amountPaise, currency = 'INR', provider } = params;

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  const receiptNumber = generateReceiptNumber(ride.bookingCode);

  if (provider === 'CASH') {
    const payment = await prisma.payment.create({
      data: {
        rideId,
        amountPaise,
        currency,
        provider: 'CASH',
        receiptNumber,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      provider: 'CASH',
      paymentId: payment.id,
      receiptNumber,
      message: 'Pay cash to captain upon ride completion.',
      isDemo: false,
    };
  }

  // Razorpay Demo or Live
  const isDemo =
    provider === 'RAZORPAY_DEMO' ||
    !process.env.RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID.includes('demo');

  const orderId = `order_${isDemo ? 'demo_' : ''}${crypto.randomBytes(8).toString('hex')}`;

  const payment = await prisma.payment.create({
    data: {
      rideId,
      amountPaise,
      currency,
      provider: isDemo ? 'RAZORPAY_DEMO' : 'RAZORPAY_LIVE',
      orderId,
      receiptNumber,
      status: 'PENDING',
    },
  });

  return {
    success: true,
    provider: isDemo ? 'RAZORPAY_DEMO' : 'RAZORPAY_LIVE',
    isDemo,
    orderId,
    amountPaise,
    amountRupees: (amountPaise / 100).toFixed(2),
    currency,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_ridex_demo_key',
    receiptNumber,
    paymentRecordId: payment.id,
  };
}

export async function verifyPayment(params: PaymentVerifyParams) {
  const { rideId, orderId, paymentId, signature, provider } = params;

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  // Find payment record
  const payment = await prisma.payment.findFirst({
    where: { rideId, ...(orderId ? { orderId } : {}) },
  });

  const transactionId = paymentId || `txn_${crypto.randomBytes(8).toString('hex')}`;

  // Update payment record to SUCCESS
  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        transactionId,
        rawResponse: JSON.stringify({
          provider,
          verifiedAt: new Date().toISOString(),
          simulated: provider === 'RAZORPAY_DEMO',
        }),
      },
    });
  }

  // Update ride status
  await prisma.ride.update({
    where: { id: rideId },
    data: {
      paymentStatus: 'COMPLETED',
    },
  });

  return {
    success: true,
    status: 'SUCCESS',
    transactionId,
    receiptNumber: payment?.receiptNumber || generateReceiptNumber(ride.bookingCode),
    amountRupees: (ride.totalFarePaise / 100).toFixed(2),
  };
}
