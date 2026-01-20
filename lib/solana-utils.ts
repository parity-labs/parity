import { LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Converts SOL to Lamports accurately by using string manipulation
 * to avoid floating point precision issues.
 */
export function solToLamports(sol: number | string): bigint {
  const s = typeof sol === "number" ? sol.toFixed(9) : sol;
  const [integral, fractional = ""] = s.split(".");
  const paddedFractional = fractional.padEnd(9, "0").slice(0, 9);
  return BigInt(integral) * BigInt(LAMPORTS_PER_SOL) + BigInt(paddedFractional);
}

/**
 * Converts Lamports to SOL.
 */
export function lamportsToSol(
  lamports: bigint | number | string | { toString(): string }
): number {
  return Number(lamports.toString()) / LAMPORTS_PER_SOL;
}

/**
 * Formats SOL amount for display.
 */
export function formatSol(sol: number): string {
  if (sol < 1) {
    return `${sol.toFixed(4)} SOL`;
  }
  if (sol < 100) {
    return `${sol.toFixed(2)} SOL`;
  }
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 0 })} SOL`;
}

/**
 * Formats price in USD or SOL.
 */
export function formatPrice(price: number): string {
  if (price === 0) {
    return "$0.00";
  }
  if (price < 0.000_001) {
    return `$${price.toExponential(2)}`;
  }
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(2)}`;
}
