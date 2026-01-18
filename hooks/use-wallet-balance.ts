import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useWalletBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["walletBalance", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) {
        return null;
      }
      const lamports = await connection.getBalance(publicKey);
      return {
        lamports,
        sol: lamports / LAMPORTS_PER_SOL,
      };
    },
    enabled: !!publicKey,
    refetchInterval: 30_000,
  });
}
