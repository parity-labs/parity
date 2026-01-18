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

// Preset curve configurations for Parity
// These are safe defaults that prevent rug-style curves

export const CURVE_PRESETS = {
  // Gentle curve for community tokens
  community: {
    name: "Community",
    description: "Gentle price curve. Good for community tokens.",
    basePrice: 0.0001,
    priceSlope: 0.000_000_1,
    virtualLiquidity: 50_000,
    buyFeeBps: 50, // 0.5%
    sellFeeBps: 50,
    maxSupply: 1_000_000_000,
  },

  // Standard curve similar to pump.fun
  standard: {
    name: "Standard",
    description: "Balanced curve. Similar to pump.fun dynamics.",
    basePrice: 0.0001,
    priceSlope: 0.000_000_5,
    virtualLiquidity: 10_000,
    buyFeeBps: 100, // 1%
    sellFeeBps: 100,
    maxSupply: 1_000_000_000,
  },

  // Steeper curve for limited supply tokens
  scarce: {
    name: "Scarce",
    description: "Steeper curve for limited editions.",
    basePrice: 0.001,
    priceSlope: 0.000_005,
    virtualLiquidity: 5000,
    buyFeeBps: 100,
    sellFeeBps: 100,
    maxSupply: 100_000_000,
  },
} as const;

export type CurvePreset = keyof typeof CURVE_PRESETS;

// Fee distribution for Parity platform (from our fee structure)
export const FEE_DISTRIBUTION = {
  platform: 15, // 15% to platform (hard-capped)
  meteora: 30, // 30% to Meteora infrastructure
  creator: 25, // 25% to creator
  charity: 30, // 30% to charity
} as const;
