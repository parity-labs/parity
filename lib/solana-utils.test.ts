import { describe, expect, it } from "bun:test";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  formatPrice,
  formatSol,
  lamportsToSol,
  solToLamports,
} from "./solana-utils";

describe("solana-utils", () => {
  describe("solToLamports", () => {
    it("should convert 1 SOL to 1,000,000,000 lamports", () => {
      expect(solToLamports(1)).toBe(BigInt(LAMPORTS_PER_SOL));
    });

    it("should convert 0.1 SOL to 100,000,000 lamports", () => {
      expect(solToLamports(0.1)).toBe(BigInt(100_000_000));
    });

    it("should handle string input", () => {
      expect(solToLamports("0.1")).toBe(BigInt(100_000_000));
    });

    it("should handle many decimals accurately", () => {
      // 0.123456789 SOL is 123,456,789 lamports
      expect(solToLamports(0.123_456_789)).toBe(BigInt(123_456_789));
    });

    it("should truncate decimals beyond 9", () => {
      // 0.123456789123 -> 0.123456789
      expect(solToLamports(0.123_456_789_123)).toBe(BigInt(123_456_789));
    });

    it("should handle small values", () => {
      expect(solToLamports(0.000_000_001)).toBe(BigInt(1));
    });
  });

  describe("lamportsToSol", () => {
    it("should convert 1,000,000,000 lamports to 1 SOL", () => {
      expect(lamportsToSol(1_000_000_000)).toBe(1);
    });

    it("should convert 1 lamport to 0.000000001 SOL", () => {
      expect(lamportsToSol(1)).toBe(0.000_000_001);
    });

    it("should handle BigInt input", () => {
      expect(lamportsToSol(BigInt(1_000_000_000))).toBe(1);
    });
  });

  describe("formatSol", () => {
    it("should format large SOL amounts", () => {
      expect(formatSol(123.456)).toBe("123 SOL");
    });

    it("should format medium SOL amounts", () => {
      expect(formatSol(12.3456)).toBe("12.35 SOL");
    });

    it("should format small SOL amounts", () => {
      expect(formatSol(0.123_456)).toBe("0.1235 SOL");
    });
  });

  describe("formatPrice", () => {
    it("should format normal prices", () => {
      expect(formatPrice(1.2345)).toBe("$1.23");
    });

    it("should format small prices", () => {
      expect(formatPrice(0.123_45)).toBe("$0.1235");
    });

    it("should format very small prices", () => {
      expect(formatPrice(0.000_123_45)).toBe("$0.000123");
    });

    it("should format extremely small prices with exponential notation", () => {
      expect(formatPrice(0.000_000_123_45)).toBe("$1.23e-7");
    });
  });
});
