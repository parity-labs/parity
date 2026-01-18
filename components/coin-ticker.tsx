"use client";

import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc/client";

function CoinItem({
  symbol,
  price,
  liquiditySol,
}: {
  symbol: string;
  price: number;
  liquiditySol: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-4">
      <span className="font-medium font-mono text-sm">${symbol}</span>
      <span className="font-mono text-muted-foreground text-xs">
        {price.toFixed(6)} SOL
      </span>
      <span className="font-mono text-muted-foreground/60 text-xs">
        {liquiditySol.toFixed(2)} SOL liq
      </span>
    </div>
  );
}

function TickerContent({
  coins,
}: {
  coins: Array<{ symbol: string; price: number; liquiditySol: number }>;
}) {
  if (coins.length === 0) {
    return (
      <div className="flex items-center px-4 text-muted-foreground text-sm">
        No active launches yet
      </div>
    );
  }

  return (
    <div className="flex animate-marquee">
      {coins.map((coin, i) => (
        <CoinItem key={`${coin.symbol}-${i}`} {...coin} />
      ))}
      {coins.map((coin, i) => (
        <CoinItem key={`${coin.symbol}-dup-${i}`} {...coin} />
      ))}
    </div>
  );
}

export function CoinTicker() {
  const { data: coins, isLoading } = useQuery({
    queryKey: ["ticker"],
    queryFn: () => rpc.launch.ticker({ limit: 20 }),
    refetchInterval: 30_000, // Refresh every 30 seconds
    staleTime: 10_000,
  });

  return (
    <div className="border-border border-b bg-card/50">
      <div className="relative flex h-10 items-center overflow-hidden">
        {isLoading ? (
          <div className="flex items-center px-4 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : (
          <TickerContent coins={coins ?? []} />
        )}
      </div>
    </div>
  );
}
