import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { getConnection } from "@/lib/solana";
import { lamportsToSol } from "@/lib/solana-utils";
import { publicProcedure } from "../procedures";

export const chainRouter = {
  status: publicProcedure.handler(async () => {
    const connection = getConnection();
    const [slot, blockHeight, epochInfo, version] = await Promise.all([
      connection.getSlot(),
      connection.getBlockHeight(),
      connection.getEpochInfo(),
      connection.getVersion(),
    ]);

    return {
      slot,
      blockHeight,
      epoch: epochInfo.epoch,
      slotIndex: epochInfo.slotIndex,
      slotsInEpoch: epochInfo.slotsInEpoch,
      epochProgress: (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100,
      solanaVersion: version["solana-core"],
    };
  }),

  supply: publicProcedure.handler(async () => {
    const connection = getConnection();
    const supply = await connection.getSupply();

    return {
      total: lamportsToSol(supply.value.total),
      circulating: lamportsToSol(supply.value.circulating),
      nonCirculating: lamportsToSol(supply.value.nonCirculating),
    };
  }),

  balance: publicProcedure
    .input(z.object({ address: z.string() }))
    .handler(async ({ input }) => {
      const connection = getConnection();
      const pubkey = new PublicKey(input.address);
      const balance = await connection.getBalance(pubkey);

      return {
        address: input.address,
        lamports: balance,
        sol: lamportsToSol(balance),
      };
    }),
};
