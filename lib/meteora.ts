import {
  DynamicBondingCurveClient,
  getCurrentPoint,
  getPriceFromSqrtPrice,
  swapQuote,
  TokenDecimal,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";
import BN from "bn.js";
import type { CurvePreset } from "./dbc";
import { getConnection } from "./solana";

const PARITY_CONFIG_ADDRESS = process.env.METEORA_CONFIG_ADDRESS;

let dbcClient: DynamicBondingCurveClient | null = null;

export function getDbcClient(): DynamicBondingCurveClient {
  if (!dbcClient) {
    dbcClient = new DynamicBondingCurveClient(getConnection(), "confirmed");
  }
  return dbcClient;
}

export interface CreatePoolParams {
  name: string;
  symbol: string;
  uri: string;
  curvePreset: CurvePreset;
  creatorPublicKey: string;
}

export interface CreatePoolResult {
  transaction: string;
  baseMint: string;
  poolAddress: string;
}

export async function buildCreatePoolTransaction(
  params: CreatePoolParams
): Promise<CreatePoolResult> {
  if (!PARITY_CONFIG_ADDRESS) {
    throw new Error(
      "METEORA_CONFIG_ADDRESS not set. Create a config at app.meteora.ag/launchpad and add the address to .env"
    );
  }

  const configPubkey = new PublicKey(PARITY_CONFIG_ADDRESS);
  const client = getDbcClient();
  const connection = getConnection();

  // Verify config exists on-chain
  const configExists = await verifyConfigExists(configPubkey);
  if (!configExists) {
    throw new Error(
      `Meteora config ${PARITY_CONFIG_ADDRESS} not found on-chain. Create it first.`
    );
  }

  const baseMintKeypair = Keypair.generate();
  const creatorPubkey = new PublicKey(params.creatorPublicKey);

  const [poolAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("pool"),
      configPubkey.toBuffer(),
      baseMintKeypair.publicKey.toBuffer(),
    ],
    client.pool.getProgram().programId
  );

  const tx = await client.pool.createPool({
    baseMint: baseMintKeypair.publicKey,
    config: configPubkey,
    name: params.name,
    symbol: params.symbol,
    uri: params.uri,
    payer: creatorPubkey,
    poolCreator: creatorPubkey,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  let serializedTx: string;

  if (tx instanceof VersionedTransaction) {
    tx.message.recentBlockhash = blockhash;
    tx.sign([baseMintKeypair]);
    serializedTx = Buffer.from(tx.serialize()).toString("base64");
  } else {
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = creatorPubkey;
    tx.partialSign(baseMintKeypair);
    serializedTx = tx
      .serialize({ requireAllSignatures: false })
      .toString("base64");
  }

  return {
    transaction: serializedTx,
    baseMint: baseMintKeypair.publicKey.toBase58(),
    poolAddress: poolAddress.toBase58(),
  };
}

async function verifyConfigExists(configAddress: PublicKey): Promise<boolean> {
  try {
    const config = await getDbcClient().state.getPoolConfig(configAddress);
    return config !== null;
  } catch {
    return false;
  }
}

export async function verifyPoolCreated(
  poolAddress: string,
  maxRetries = 5,
  delayMs = 2000
): Promise<boolean> {
  const poolPubkey = new PublicKey(poolAddress);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const pool = await getDbcClient().state.getPool(poolPubkey);
      if (pool !== null) {
        return true;
      }
    } catch {
      // Pool not found yet, will retry
    }

    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return false;
}

export function getPoolInfo(poolAddress: string) {
  return getDbcClient().state.getPool(new PublicKey(poolAddress));
}

export interface PoolPriceData {
  poolAddress: string;
  baseMint: string;
  baseReserve: string;
  quoteReserve: string;
  /** Current spot price in SOL per token */
  spotPrice: number;
  /** Pool liquidity in SOL */
  poolLiquiditySol: number;
}

export async function getPoolPriceData(
  poolAddress: string
): Promise<PoolPriceData | null> {
  try {
    const client = getDbcClient();
    const poolPubkey = new PublicKey(poolAddress);
    const pool = await client.state.getPool(poolPubkey);

    if (!pool) {
      return null;
    }

    // Get the pool config to access token decimals
    const config = await client.state.getPoolConfig(pool.config);
    if (!config) {
      return null;
    }

    // Use SDK helper to get price from sqrt price
    const baseDecimal = config.tokenDecimal as TokenDecimal;
    const quoteDecimal = TokenDecimal.NINE; // SOL has 9 decimals
    const price = getPriceFromSqrtPrice(
      pool.sqrtPrice,
      baseDecimal,
      quoteDecimal
    );

    const quoteReserve = Number(pool.quoteReserve);
    const poolLiquiditySol = quoteReserve / 1e9; // Convert lamports to SOL

    return {
      poolAddress,
      baseMint: pool.baseMint.toBase58(),
      baseReserve: pool.baseReserve.toString(),
      quoteReserve: pool.quoteReserve.toString(),
      spotPrice: price.toNumber(),
      poolLiquiditySol,
    };
  } catch (error) {
    console.error("Failed to fetch pool price data:", error);
    return null;
  }
}

export interface SwapQuoteResult {
  inAmount: string;
  outAmount: string;
  minOutAmount: string;
}

export async function getSwapQuote(
  poolAddress: string,
  inAmount: bigint,
  swapType: "buy" | "sell"
): Promise<SwapQuoteResult | null> {
  try {
    const client = getDbcClient();
    const poolPubkey = new PublicKey(poolAddress);
    const pool = await client.state.getPool(poolPubkey);

    if (!pool) {
      return null;
    }

    const config = await client.state.getPoolConfig(pool.config);
    if (!config) {
      return null;
    }

    // swapBaseForQuote: true = sell tokens for SOL, false = buy tokens with SOL
    const swapBaseForQuote = swapType === "sell";
    const connection = getConnection();
    const currentPoint = await getCurrentPoint(
      connection,
      config.activationType
    );

    const quote = swapQuote(
      pool,
      config,
      swapBaseForQuote,
      new BN(inAmount.toString()),
      100, // 1% slippage
      false, // no referral
      currentPoint
    );

    return {
      inAmount: inAmount.toString(),
      outAmount: quote.outputAmount.toString(),
      minOutAmount: quote.minimumAmountOut.toString(),
    };
  } catch (error) {
    console.error("Failed to get swap quote:", error);
    return null;
  }
}
