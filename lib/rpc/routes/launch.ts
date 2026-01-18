import { PublicKey } from "@solana/web3.js";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { launch } from "@/lib/db/auth-schema";
import {
  buildCreatePoolTransaction,
  getPoolPriceData,
  verifyPoolCreated,
} from "@/lib/meteora";
import { authedProcedure, publicProcedure } from "../procedures";

const curvePresetSchema = z.enum(["community", "standard", "scarce"]);

const solanaAddressSchema = z.string().refine(
  (val) => {
    try {
      new PublicKey(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid Solana address" }
);

async function getLaunchByOwner(id: string, creatorId: string) {
  const result = await db
    .select()
    .from(launch)
    .where(and(eq(launch.id, id), eq(launch.creatorId, creatorId)))
    .limit(1);
  return result[0] ?? null;
}

export const launchRouter = {
  /** Get top active launches with real-time prices for the ticker */
  ticker: publicProcedure
    .input(
      z.object({ limit: z.number().min(1).max(20).default(20) }).optional()
    )
    .handler(async ({ input }) => {
      const limit = input?.limit ?? 20;

      // Get active launches that have pool addresses
      const activeLaunches = await db
        .select({
          id: launch.id,
          name: launch.name,
          symbol: launch.symbol,
          poolAddress: launch.poolAddress,
          createdAt: launch.createdAt,
        })
        .from(launch)
        .where(and(eq(launch.status, "active"), isNotNull(launch.poolAddress)))
        .orderBy(desc(launch.createdAt))
        .limit(limit);

      // Fetch prices for all pools in parallel
      const tickerData = await Promise.all(
        activeLaunches.map(async (l) => {
          const priceData = l.poolAddress
            ? await getPoolPriceData(l.poolAddress)
            : null;

          return {
            id: l.id,
            symbol: l.symbol,
            name: l.name,
            poolAddress: l.poolAddress,
            price: priceData?.spotPrice ?? 0,
            liquiditySol: priceData?.poolLiquiditySol ?? 0,
          };
        })
      );

      return tickerData;
    }),

  list: authedProcedure.handler(async ({ context }) => {
    return await db
      .select()
      .from(launch)
      .where(eq(launch.creatorId, context.user.id))
      .orderBy(desc(launch.createdAt));
  }),

  get: authedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await getLaunchByOwner(input.id, context.user.id);
      if (!result) {
        throw new Error("Launch not found");
      }
      return result;
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        symbol: z.string().min(1).max(10).toUpperCase(),
        description: z.string().max(500).optional(),
        image: z.url().optional(),
        curvePreset: curvePresetSchema,
        charityWallet: solanaAddressSchema,
        charityName: z.string().max(100).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const id = crypto.randomUUID();
      await db.insert(launch).values({
        id,
        creatorId: context.user.id,
        name: input.name,
        symbol: input.symbol,
        description: input.description,
        image: input.image,
        curvePreset: input.curvePreset,
        charityWallet: input.charityWallet,
        charityName: input.charityName,
        status: "pending",
      });
      return { id };
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        symbol: z.string().min(1).max(10).toUpperCase().optional(),
        description: z.string().max(500).optional(),
        image: z.string().url().optional(),
        curvePreset: curvePresetSchema.optional(),
        charityWallet: solanaAddressSchema.optional(),
        charityName: z.string().max(100).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { id, ...updates } = input;
      const existing = await getLaunchByOwner(id, context.user.id);

      if (!existing) {
        throw new Error("Launch not found");
      }
      if (existing.status !== "pending") {
        throw new Error("Cannot update deployed launch");
      }

      await db.update(launch).set(updates).where(eq(launch.id, id));
      return { success: true };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const existing = await getLaunchByOwner(input.id, context.user.id);

      if (!existing) {
        throw new Error("Launch not found");
      }
      if (existing.status !== "pending") {
        throw new Error("Cannot delete deployed launch");
      }

      await db.delete(launch).where(eq(launch.id, input.id));
      return { success: true };
    }),

  prepareDeploy: authedProcedure
    .input(
      z.object({
        id: z.string(),
        creatorWallet: solanaAddressSchema,
      })
    )
    .handler(async ({ input, context }) => {
      const existing = await getLaunchByOwner(input.id, context.user.id);

      if (!existing) {
        throw new Error("Launch not found");
      }
      if (existing.status !== "pending") {
        throw new Error("Launch already deployed");
      }

      const metadataUri =
        existing.image || `https://parity.app/api/metadata/${existing.id}.json`;

      const result = await buildCreatePoolTransaction({
        name: existing.name,
        symbol: existing.symbol,
        uri: metadataUri,
        curvePreset: existing.curvePreset,
        creatorPublicKey: input.creatorWallet,
      });

      return {
        transaction: result.transaction,
        baseMint: result.baseMint,
        poolAddress: result.poolAddress,
        launchId: input.id,
      };
    }),

  confirmDeploy: authedProcedure
    .input(
      z.object({
        id: z.string(),
        poolAddress: solanaAddressSchema,
        tokenMint: solanaAddressSchema,
        signature: z.string().min(64).max(128),
      })
    )
    .handler(async ({ input, context }) => {
      const existing = await getLaunchByOwner(input.id, context.user.id);

      if (!existing) {
        throw new Error("Launch not found");
      }
      if (existing.status !== "pending") {
        throw new Error("Launch already deployed");
      }

      const poolExists = await verifyPoolCreated(input.poolAddress);
      if (!poolExists) {
        throw new Error("Pool not found on-chain");
      }

      await db
        .update(launch)
        .set({
          poolAddress: input.poolAddress,
          tokenMint: input.tokenMint,
          status: "active",
        })
        .where(eq(launch.id, input.id));

      return {
        success: true,
        poolAddress: input.poolAddress,
        tokenMint: input.tokenMint,
      };
    }),
};
