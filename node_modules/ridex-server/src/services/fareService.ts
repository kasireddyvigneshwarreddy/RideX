import { prisma } from '../prisma.js';

export interface FareCalculationResult {
  category: string;
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

export async function calculateFareForCategory(
  category: string,
  distanceKm: number,
  durationMinutes: number,
  couponCode?: string
): Promise<FareCalculationResult> {
  const rule = await prisma.fareRule.findUnique({
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
  let couponAppliedInfo: FareCalculationResult['couponApplied'] = undefined;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    });

    if (
      coupon &&
      coupon.isActive &&
      new Date() <= coupon.validUntil &&
      subtotalPaise >= coupon.minOrderPaise &&
      coupon.timesUsed < coupon.usageLimit
    ) {
      if (coupon.discountType === 'PERCENTAGE') {
        const calculatedDiscount = Math.round((subtotalPaise * coupon.discountValue) / 100);
        discountPaise = coupon.maxDiscountPaise
          ? Math.min(coupon.maxDiscountPaise, calculatedDiscount)
          : calculatedDiscount;
      } else {
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

export async function calculateAllFares(
  distanceKm: number,
  durationMinutes: number,
  couponCode?: string
): Promise<FareCalculationResult[]> {
  const rules = await prisma.fareRule.findMany({
    where: { isActive: true },
    orderBy: { baseFarePaise: 'asc' },
  });

  const estimates = await Promise.all(
    rules.map((rule) =>
      calculateFareForCategory(rule.category, distanceKm, durationMinutes, couponCode)
    )
  );

  return estimates;
}
