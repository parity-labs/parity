import { z } from "zod";
import { getOHLCVData } from "@/lib/geckoterminal";
import {
  buildSwapTransaction,
  getPoolPriceData,
  getSwapQuote,
} from "@/lib/meteora";
import { publicProcedure } from "../procedures";

const solanaAddressSchema = z.string().min(32).max(44);

export const poolRouter = {
  /** Get current price data for a pool */
  price: publicProcedure
    .input(z.object({ poolAddress: solanaAddressSchema }))
    .handler(async ({ input }) => {
      const data = await getPoolPriceData(input.poolAddress);
      if (!data) {
        throw new Error("Pool not found or failed to fetch price data");
      }
      return data;
    }),

  /** Get price data for multiple pools at once */
  prices: publicProcedure
    .input(z.object({ poolAddresses: z.array(solanaAddressSchema).max(20) }))
    .handler(async ({ input }) => {
      const results = await Promise.all(
        input.poolAddresses.map(async (addr) => {
          const data = await getPoolPriceData(addr);
          return { poolAddress: addr, data };
        })
      );
      return results;
    }),

  /** Get a quote for buying or selling tokens */
  quote: publicProcedure
    .input(
      z.object({
        poolAddress: solanaAddressSchema,
        amount: z.string(), // Amount as string to handle big numbers
        swapType: z.enum(["buy", "sell"]),
      })
    )
    .handler(async ({ input }) => {
      const quote = await getSwapQuote(
        input.poolAddress,
        BigInt(input.amount),
        input.swapType
      );
      if (!quote) {
        throw new Error("Failed to get swap quote");
      }
      return quote;
    }),

  /** Build a swap transaction for the user to sign */
  buildSwap: publicProcedure
    .input(
      z.object({
        poolAddress: solanaAddressSchema,
        userWallet: solanaAddressSchema,
        amount: z.string(), // Amount in lamports (for buy) or base tokens (for sell)
        swapType: z.enum(["buy", "sell"]),
        slippageBps: z.number().min(1).max(5000).default(100), // Default 1% slippage
      })
    )
    .handler(async ({ input }) => {
      const result = await buildSwapTransaction({
        poolAddress: input.poolAddress,
        userPublicKey: input.userWallet,
        inAmount: BigInt(input.amount),
        swapType: input.swapType,
        slippageBps: input.slippageBps,
      });
      return result;
    }),

  /** Get OHLCV candlestick data from GeckoTerminal */
  ohlcv: publicProcedure
    .input(
      z.object({
        poolAddress: solanaAddressSchema,
        timeframe: z.enum(["minute", "hour", "day"]).default("hour"),
        aggregate: z.number().min(1).max(60).default(1),
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .handler(async ({ input }) => {
      const data = await getOHLCVData(
        input.poolAddress,
        input.timeframe,
        input.aggregate,
        input.limit
      );
      return { candles: data };
    }),
};
