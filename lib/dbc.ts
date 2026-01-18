import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { getConnection } from "./solana";

let dbcClient: DynamicBondingCurveClient | null = null;

export function getDbcClient() {
  if (!dbcClient) {
    const connection = getConnection();
    dbcClient = new DynamicBondingCurveClient(connection, "confirmed");
  }
  return dbcClient;
}

// Standard curve configuration for all Parity launches
export const CURVE_CONFIG = {
  name: "Standard",
  description: "Balanced curve with dynamic creator fees.",
  basePrice: 0.0001,
  priceSlope: 0.000_000_5,
  virtualLiquidity: 10_000,
  maxSupply: 1_000_000_000,
} as const;

// Legacy type for database compatibility
export type CurvePreset = "community" | "standard" | "scarce";

/**
 * Dynamic creator fee calculation based on market cap.
 *
 * pump.fun-style dynamic fee: starts higher for low-cap tokens to reward
 * early hype and effort, then drops as the token grows to avoid punishing
 * successful projects with high fees that could kill volume.
 *
 * Fee ranges from 0.95% (95 bps) at low cap to 0.05% (5 bps) at high cap.
 *
 * @param marketCapSol - Current market cap in SOL
 * @returns Fee in basis points (1 bps = 0.01%)
 */
export function getCreatorFeeBps(marketCapSol: number): number {
  const MIN_FEE_BPS = 5; // 0.05% floor
  const MAX_FEE_BPS = 95; // 0.95% ceiling
  const LOW_CAP_THRESHOLD = 10; // Full fee below 10 SOL
  const HIGH_CAP_THRESHOLD = 1000; // Minimum fee above 1000 SOL

  if (marketCapSol <= LOW_CAP_THRESHOLD) {
    return MAX_FEE_BPS;
  }

  if (marketCapSol >= HIGH_CAP_THRESHOLD) {
    return MIN_FEE_BPS;
  }

  // Logarithmic decay between thresholds for smooth transition
  const logLow = Math.log(LOW_CAP_THRESHOLD);
  const logHigh = Math.log(HIGH_CAP_THRESHOLD);
  const logCap = Math.log(marketCapSol);

  const ratio = (logCap - logLow) / (logHigh - logLow);
  const fee = MAX_FEE_BPS - ratio * (MAX_FEE_BPS - MIN_FEE_BPS);

  return Math.round(fee);
}

/**
 * Get fee breakdown for display purposes.
 *
 * @param marketCapSol - Current market cap in SOL
 * @returns Fee information with percentage and description
 */
export function getCreatorFeeInfo(marketCapSol: number): {
  feeBps: number;
  feePercent: string;
  tier: "low" | "medium" | "high";
} {
  const feeBps = getCreatorFeeBps(marketCapSol);
  const feePercent = (feeBps / 100).toFixed(2);

  let tier: "low" | "medium" | "high";
  if (marketCapSol < 50) {
    tier = "low";
  } else if (marketCapSol < 500) {
    tier = "medium";
  } else {
    tier = "high";
  }

  return { feeBps, feePercent, tier };
}

// Fee distribution for Parity platform (from our fee structure)
export const FEE_DISTRIBUTION = {
  platform: 15, // 15% to platform (hard-capped)
  meteora: 30, // 30% to Meteora infrastructure
  creator: 25, // 25% to creator
  charity: 30, // 30% to charity
} as const;
