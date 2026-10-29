"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReceiptNumber = generateReceiptNumber;
exports.createPaymentOrder = createPaymentOrder;
exports.verifyPayment = verifyPayment;
const crypto_1 = __importDefault(require("crypto"));
const prisma_js_1 = require("../prisma.js");
function generateReceiptNumber(rideBookingCode) {
    return `RCPT-${rideBookingCode}-${Date.now().toString().slice(-4)}`;
}
async function createPaymentOrder(params) {
    const { rideId, amountPaise, currency = 'INR', provider } = params;
    const ride = await prisma_js_1.prisma.ride.findUnique({
        where: { id: rideId },
    });
    if (!ride) {
        throw new Error('Ride not found');
    }
    const receiptNumber = generateReceiptNumber(ride.bookingCode);
    if (provider === 'CASH') {
        const payment = await prisma_js_1.prisma.payment.create({
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
    const isDemo = provider === 'RAZORPAY_DEMO' ||
        !process.env.RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID.includes('demo');
    const orderId = `order_${isDemo ? 'demo_' : ''}${crypto_1.default.randomBytes(8).toString('hex')}`;
    const payment = await prisma_js_1.prisma.payment.create({
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
async function verifyPayment(params) {
    const { rideId, orderId, paymentId, signature, provider } = params;
    const ride = await prisma_js_1.prisma.ride.findUnique({
        where: { id: rideId },
    });
    if (!ride) {
        throw new Error('Ride not found');
    }
    // Find payment record
    const payment = await prisma_js_1.prisma.payment.findFirst({
        where: { rideId, ...(orderId ? { orderId } : {}) },
    });
    const transactionId = paymentId || `txn_${crypto_1.default.randomBytes(8).toString('hex')}`;
    // Update payment record to SUCCESS
    if (payment) {
        await prisma_js_1.prisma.payment.update({
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
    await prisma_js_1.prisma.ride.update({
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
