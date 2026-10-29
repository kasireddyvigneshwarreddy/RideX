"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFareForCategory = calculateFareForCategory;
exports.calculateAllFares = calculateAllFares;
const prisma_js_1 = require("../prisma.js");
async function calculateFareForCategory(category, distanceKm, durationMinutes, couponCode) {
    const rule = await prisma_js_1.prisma.fareRule.findUnique({
        where: { category },
    });
    if (!rule || !rule.isActive) {
        throw new Error(`Fare rule for category "${category}" not found or inactive`);
    }
    // 1. Distance fare in paise
    const distanceFarePaise = Math.round(distanceKm * rule.perKmRatePaise);
    // 2. Base + Distance + waiting fare
    const waitingFarePaise = 0; // Default 0 for new quote
    const rawBaseSubtotal = rule.baseFarePaise + distanceFarePaise + waitingFarePaise;
    // 3. Apply minimum fare threshold
    const fareWithMinThreshold = Math.max(rule.minFarePaise, rawBaseSubtotal);
    // 4. Apply surge multiplier
    const subtotalPaise = Math.round(fareWithMinThreshold * rule.surgeMultiplier);
    // 5. Apply coupon discount if provided
    let discountPaise = 0;
    let couponAppliedInfo = undefined;
    if (couponCode) {
        const coupon = await prisma_js_1.prisma.coupon.findUnique({
            where: { code: couponCode.trim().toUpperCase() },
        });
        if (coupon &&
            coupon.isActive &&
            new Date() <= coupon.validUntil &&
            subtotalPaise >= coupon.minOrderPaise &&
            coupon.timesUsed < coupon.usageLimit) {
            if (coupon.discountType === 'PERCENTAGE') {
                const calculatedDiscount = Math.round((subtotalPaise * coupon.discountValue) / 100);
                discountPaise = coupon.maxDiscountPaise
                    ? Math.min(coupon.maxDiscountPaise, calculatedDiscount)
                    : calculatedDiscount;
            }
            else {
                // FLAT discount
                discountPaise = Math.min(subtotalPaise, coupon.discountValue);
            }
            couponAppliedInfo = {
                code: coupon.code,
                description: coupon.description,
                discountRupees: parseFloat((discountPaise / 100).toFixed(2)),
            };
        }
    }
    const totalFarePaise = Math.max(0, subtotalPaise - discountPaise);
    return {
        category: rule.category,
        displayName: rule.displayName,
        description: rule.description,
        capacity: rule.capacity,
        iconName: rule.iconName,
        distanceKm,
        durationMinutes,
        baseFarePaise: rule.baseFarePaise,
        distanceFarePaise,
        waitingFarePaise,
        surgeMultiplier: rule.surgeMultiplier,
        subtotalPaise,
        discountPaise,
        totalFarePaise,
        baseFareRupees: parseFloat((rule.baseFarePaise / 100).toFixed(2)),
        totalFareRupees: parseFloat((totalFarePaise / 100).toFixed(2)),
        savingsRupees: parseFloat((discountPaise / 100).toFixed(2)),
        couponApplied: couponAppliedInfo,
    };
}
async function calculateAllFares(distanceKm, durationMinutes, couponCode) {
    const rules = await prisma_js_1.prisma.fareRule.findMany({
        where: { isActive: true },
        orderBy: { baseFarePaise: 'asc' },
    });
    const estimates = await Promise.all(rules.map((rule) => calculateFareForCategory(rule.category, distanceKm, durationMinutes, couponCode)));
    return estimates;
}
