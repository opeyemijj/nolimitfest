// =============================================================================
// NO LIMIT FEST — CHECKOUT FEES
// =============================================================================
// Pure client & server safe helpers so the storefront total and the Stripe
// charge are always computed the same way.
// =============================================================================

export const SERVICE_FEE_RATE = 0.05;
export const SERVICE_FEE_LABEL = "Service Fee (5%)";
export const TAX_RATE = 0.05;
export const TAX_LABEL = "5% VAT / Tax";

/**
 * Service fee on the amount being paid now, rounded to 2 decimals (fils/cents).
 */
export function calculateServiceFee(amount: number): number {
  return Math.round(amount * SERVICE_FEE_RATE * 100) / 100;
}

/**
 * Calculates the 5% tax/fee on a remaining door balance.
 */
export function calculateBalanceTax(baseBalance: number): number {
  return Math.round(baseBalance * TAX_RATE * 100) / 100;
}

/**
 * Calculates the total door balance due including 5% tax.
 * e.g. For a base balance of 4,800:
 * baseBalance: 4800, taxAmount: 240, totalDue: 5040
 */
export function calculateTotalBalanceDue(baseBalance: number): {
  baseBalance: number;
  taxAmount: number;
  totalDue: number;
} {
  const base = Math.max(0, baseBalance || 0);
  const taxAmount = calculateBalanceTax(base);
  return {
    baseBalance: base,
    taxAmount,
    totalDue: Math.round((base + taxAmount) * 100) / 100,
  };
}
