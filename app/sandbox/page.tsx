import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { CURVE_PRESETS, FEE_DISTRIBUTION } from "@/lib/dbc";
import { getConnection, getRpcProviderName } from "@/lib/solana";

async function getChainData() {
  const rpcUrl = process.env.RPC_URL || clusterApiUrl("mainnet-beta");

  try {
    const connection = getConnection();

    const [slot, blockHeight, epochInfo, version, supply] = await Promise.all([
      connection.getSlot(),
      connection.getBlockHeight(),
      connection.getEpochInfo(),
      connection.getVersion(),
      connection.getSupply(),
    ]);

    return {
      success: true,
      rpcEndpoint: getRpcProviderName(rpcUrl),
      data: {
        slot,
        blockHeight,
        epoch: epochInfo.epoch,
        slotIndex: epochInfo.slotIndex,
        slotsInEpoch: epochInfo.slotsInEpoch,
        solanaVersion: version["solana-core"],
        totalSupply: (
          Number(supply.value.total) / LAMPORTS_PER_SOL
        ).toLocaleString(),
        circulatingSupply: (
          Number(supply.value.circulating) / LAMPORTS_PER_SOL
        ).toLocaleString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      rpcEndpoint: getRpcProviderName(rpcUrl),
    };
  }
}

export default async function SandboxPage() {
  const result = await getChainData();

  return (
    <div className="min-h-screen bg-background p-8 font-sans text-foreground">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 font-semibold text-2xl tracking-tight">
          Parity Sandbox
        </h1>
        <p className="mb-8 text-muted-foreground">
          Testing Solana RPC and Meteora DBC SDK integration.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - RPC Status */}
          <div>
            {/* Connection Status */}
            <div className="mb-6 border border-border p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  RPC Connection
                </span>
                {result.success ? (
                  <span className="font-mono text-primary text-sm">
                    Connected
                  </span>
                ) : (
                  <span className="font-mono text-destructive text-sm">
                    Failed
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Provider</span>
                <span className="font-mono text-sm">{result.rpcEndpoint}</span>
              </div>
            </div>

            {result.success && result.data ? (
              <>
                {/* Chain State */}
                <div className="mb-6 border border-border">
                  <div className="border-border border-b p-4">
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">
                      Chain State
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="flex items-center justify-between p-4">
                      <span className="text-muted-foreground text-sm">
                        Slot
                      </span>
                      <span className="font-mono text-sm">
                        {result.data.slot.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-muted-foreground text-sm">
                        Block Height
                      </span>
                      <span className="font-mono text-sm">
                        {result.data.blockHeight.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-muted-foreground text-sm">
                        Epoch
                      </span>
                      <span className="font-mono text-sm">
                        {result.data.epoch}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-muted-foreground text-sm">
                        Solana
                      </span>
                      <span className="font-mono text-sm">
                        v{result.data.solanaVersion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Epoch Progress */}
                <div className="border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Epoch Progress
                    </span>
                    <span className="font-mono text-sm">
                      {(
                        (result.data.slotIndex / result.data.slotsInEpoch) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(result.data.slotIndex / result.data.slotsInEpoch) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="border border-destructive/50 bg-destructive/10 p-6">
                <div className="mb-2 font-medium text-destructive text-sm">
                  Connection Error
                </div>
                <p className="font-mono text-muted-foreground text-xs">
                  {result.error}
                </p>
                <div className="mt-4 border-destructive/20 border-t pt-4">
                  <p className="mb-2 text-muted-foreground text-sm">
                    Add to .env:
                  </p>
                  <code className="block bg-muted/50 p-2 font-mono text-xs">
                    RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - DBC SDK */}
          <div>
            {/* DBC SDK Status */}
            <div className="mb-6 border border-border p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Meteora DBC SDK
                </span>
                <span className="font-mono text-primary text-sm">Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Version</span>
                <span className="font-mono text-sm">1.5.1</span>
              </div>
            </div>

            {/* Curve Presets */}
            <div className="mb-6 border border-border">
              <div className="border-border border-b p-4">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">
                  Curve Presets
                </span>
              </div>
              <div className="divide-y divide-border">
                {Object.entries(CURVE_PRESETS).map(([key, preset]) => (
                  <div className="p-4" key={key}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-sm">{preset.name}</span>
                      <span className="font-mono text-muted-foreground text-xs">
                        {preset.buyFeeBps / 100}% fee
                      </span>
                    </div>
                    <p className="mb-3 text-muted-foreground text-xs">
                      {preset.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base</span>
                        <span className="font-mono">{preset.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slope</span>
                        <span className="font-mono">{preset.priceSlope}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Virtual Liq
                        </span>
                        <span className="font-mono">
                          {preset.virtualLiquidity.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max</span>
                        <span className="font-mono">
                          {(preset.maxSupply / 1_000_000).toLocaleString()}M
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Distribution */}
            <div className="border border-border">
              <div className="border-border border-b p-4">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">
                  Fee Distribution
                </span>
              </div>
              <div className="p-4">
                <div className="mb-3 flex h-3 overflow-hidden">
                  <div
                    className="bg-primary"
                    style={{ width: `${FEE_DISTRIBUTION.platform}%` }}
                    title="Platform"
                  />
                  <div
                    className="bg-primary/70"
                    style={{ width: `${FEE_DISTRIBUTION.meteora}%` }}
                    title="Meteora"
                  />
                  <div
                    className="bg-primary/50"
                    style={{ width: `${FEE_DISTRIBUTION.creator}%` }}
                    title="Creator"
                  />
                  <div
                    className="bg-primary/30"
                    style={{ width: `${FEE_DISTRIBUTION.charity}%` }}
                    title="Charity"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform</span>
                    <span className="font-mono">
                      {FEE_DISTRIBUTION.platform}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meteora</span>
                    <span className="font-mono">
                      {FEE_DISTRIBUTION.meteora}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator</span>
                    <span className="font-mono">
                      {FEE_DISTRIBUTION.creator}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charity</span>
                    <span className="font-mono">
                      {FEE_DISTRIBUTION.charity}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SDK Code Example */}
        <div className="mt-8 border border-border">
          <div className="border-border border-b p-4">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">
              SDK Usage
            </span>
          </div>
          <div className="overflow-x-auto bg-muted/30 p-4">
            <pre className="font-mono text-xs leading-relaxed">
              <code>{`import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const connection = new Connection(process.env.RPC_URL!, "confirmed");
const dbc = new DynamicBondingCurveClient(connection);

// Create curve config with preset
const tx = await dbc.createConfig({
  payer: authority.publicKey,
  authority: authority.publicKey,
  curveType: "linear",
  basePrice: 0.0001,
  priceSlope: 0.0000005,
  buyFeeBps: 100,
  sellFeeBps: 100,
  virtualLiquidity: 10_000,
  maxSupply: 1_000_000_000
});`}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-border border-t pt-6">
          <p className="text-muted-foreground text-xs">
            Server-rendered at {new Date().toISOString()}
          </p>
        </div>
      </div>
    </div>
  );
}
