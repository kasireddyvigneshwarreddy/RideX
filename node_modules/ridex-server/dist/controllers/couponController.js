"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoupons = getCoupons;
exports.validateCoupon = validateCoupon;
const prisma_js_1 = require("../prisma.js");
const schemas_js_1 = require("../validators/schemas.js");
async function getCoupons(_req, res, next) {
    try {
        const coupons = await prisma_js_1.prisma.coupon.findMany({
            where: {
                isActive: true,
                validUntil: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            coupons: coupons.map((c) => ({
                id: c.id,
                code: c.code,
                description: c.description,
                discountType: c.discountType,
                discountValue: c.discountValue,
                minOrderRupees: (c.minOrderPaise / 100).toFixed(0),
                maxDiscountRupees: c.maxDiscountPaise ? (c.maxDiscountPaise / 100).toFixed(0) : null,
                validUntil: c.validUntil,
            })),
        });
    }
    catch (error) {
        next(error);
    }
}
async function validateCoupon(req, res, next) {
    try {
        const { code, rideAmountPaise } = schemas_js_1.couponValidateSchema.parse(req.body);
        const coupon = await prisma_js_1.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!coupon || !coupon.isActive) {
            res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
            return;
        }
        if (new Date() > coupon.validUntil) {
            res.status(400).json({ success: false, message: 'This coupon has expired' });
            return;
        }
        if (coupon.timesUsed >= coupon.usageLimit) {
            res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
            return;
        }
        if (rideAmountPaise < coupon.minOrderPaise) {
            const minOrderRupees = (coupon.minOrderPaise / 100).toFixed(0);
            res.status(400).json({
                success: false,
                message: `Minimum ride fare of ₹${minOrderRupees} is required for this coupon`,
            });
            return;
        }
        let discountPaise = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            const rawDiscount = Math.round((rideAmountPaise * coupon.discountValue) / 100);
            discountPaise = coupon.maxDiscountPaise
                ? Math.min(coupon.maxDiscountPaise, rawDiscount)
                : rawDiscount;
        }
        else {
            discountPaise = Math.min(rideAmountPaise, coupon.discountValue);
        }
        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountPaise,
                discountRupees: parseFloat((discountPaise / 100).toFixed(2)),
            },
        });
    }
    catch (error) {
        next(error);
    }
}
