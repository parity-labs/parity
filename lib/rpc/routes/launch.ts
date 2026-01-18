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

const curvePreset = z.enum(["community", "standard", "scarce"]);

const solanaAddress = z.string().refine(
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
  const [result] = await db
    .select()
    .from(launch)
    .where(and(eq(launch.id, id), eq(launch.creatorId, creatorId)))
    .limit(1);
  return result ?? null;
}

export const launchRouter = {
  ticker: publicProcedure
    .input(
      z.object({ limit: z.number().min(1).max(20).default(20) }).optional()
    )
    .handler(async ({ input }) => {
      const activeLaunches = await db
        .select({
          id: launch.id,
          name: launch.name,
          symbol: launch.symbol,
          poolAddress: launch.poolAddress,
        })
        .from(launch)
        .where(and(eq(launch.status, "active"), isNotNull(launch.poolAddress)))
        .orderBy(desc(launch.createdAt))
        .limit(input?.limit ?? 20);

      return Promise.all(
        activeLaunches.map(async (l) => {
          const price = l.poolAddress
            ? await getPoolPriceData(l.poolAddress)
            : null;
          return {
            id: l.id,
            symbol: l.symbol,
            name: l.name,
            poolAddress: l.poolAddress,
            price: price?.spotPrice ?? 0,
            liquiditySol: price?.poolLiquiditySol ?? 0,
          };
        })
      );
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
        curvePreset,
        charityWallet: solanaAddress,
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
        curvePreset: curvePreset.optional(),
        charityWallet: solanaAddress.optional(),
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
        throw new Error("Cannot update active launch");
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
        throw new Error("Cannot delete active launch");
      }

      await db.delete(launch).where(eq(launch.id, input.id));
      return { success: true };
    }),

  prepareDeploy: authedProcedure
    .input(z.object({ id: z.string(), creatorWallet: solanaAddress }))
    .handler(async ({ input, context }) => {
      const existing = await getLaunchByOwner(input.id, context.user.id);
      if (!existing) {
        throw new Error("Launch not found");
      }
      if (existing.status !== "pending") {
        throw new Error("Already deployed");
      }

      if (existing.poolAddress && existing.tokenMint) {
        const exists = await verifyPoolCreated(existing.poolAddress, 3, 1000);
        if (exists) {
          await db
            .update(launch)
            .set({ status: "active" })
            .where(eq(launch.id, input.id));
          return {
            transaction: "",
            baseMint: existing.tokenMint,
            poolAddress: existing.poolAddress,
            launchId: input.id,
            alreadyDeployed: true,
          };
        }
      }

      const uri =
        existing.image || `https://parity.app/api/metadata/${existing.id}.json`;
      const result = await buildCreatePoolTransaction({
        name: existing.name,
        symbol: existing.symbol,
        uri,
        curvePreset: existing.curvePreset,
        creatorPublicKey: input.creatorWallet,
      });

      await db
        .update(launch)
        .set({ poolAddress: result.poolAddress, tokenMint: result.baseMint })
        .where(eq(launch.id, input.id));

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
        poolAddress: solanaAddress,
        tokenMint: solanaAddress,
        signature: z.string().min(1).max(128),
      })
    )
    .handler(async ({ input, context }) => {
      const existing = await getLaunchByOwner(input.id, context.user.id);
      if (!existing) {
        throw new Error("Launch not found");
      }
      if (existing.status !== "pending") {
        throw new Error("Already deployed");
      }

      const exists = await verifyPoolCreated(input.poolAddress);
      if (!exists) {
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

      return { success: true, poolAddress: input.poolAddress };
    }),

  recoverDeploy: authedProcedure
    .input(
      z.object({
        id: z.string(),
        poolAddress: solanaAddress,
        tokenMint: solanaAddress,
      })
    )
    .handler(async ({ input, context }) => {
      const existing = await getLaunchByOwner(input.id, context.user.id);
      if (!existing) {
        throw new Error("Launch not found");
      }
      if (existing.status !== "pending") {
        return { success: true, alreadyActive: true };
      }

      const exists = await verifyPoolCreated(input.poolAddress, 3, 1000);
      if (!exists) {
        return { success: false };
      }

      await db
        .update(launch)
        .set({
          poolAddress: input.poolAddress,
          tokenMint: input.tokenMint,
          status: "active",
        })
        .where(eq(launch.id, input.id));

      return { success: true, recovered: true };
    }),
};
