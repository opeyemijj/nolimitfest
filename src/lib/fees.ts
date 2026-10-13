// =============================================================================
// NO LIMIT FEST — CHECKOUT FEES
// =============================================================================
// Pure client & server safe helpers so the storefront total and the Stripe
// charge are always computed the same way.
// =============================================================================

export const SERVICE_FEE_RATE = 0.05;
export const SERVICE_FEE_LABEL = "Service Fee (5%)";

/**
 * Service fee on the amount being paid now, rounded to 2 decimals (fils/cents).
 */
export function calculateServiceFee(amount: number): number {
  return Math.round(amount * SERVICE_FEE_RATE * 100) / 100;
}
