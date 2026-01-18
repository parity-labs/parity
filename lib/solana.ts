import { Connection, clusterApiUrl } from "@solana/web3.js";

export function getConnection() {
  const rpcUrl = process.env.RPC_URL || clusterApiUrl("mainnet-beta");
  return new Connection(rpcUrl, "confirmed");
}

export function getRpcProviderName(url: string) {
  if (url.includes("helius")) {
    return "Helius";
  }
  if (url.includes("quicknode")) {
    return "QuickNode";
  }
  if (url.includes("genesysgo")) {
    return "GenesysGo";
  }
  if (url.includes("triton")) {
    return "Triton";
  }
  return "Public RPC";
}
