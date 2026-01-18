import { z } from "zod";
import { getPoolPriceData, getSwapQuote } from "@/lib/meteora";
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
};
