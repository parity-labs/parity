"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { rpc } from "@/lib/rpc/client";

function CoinItem({
  symbol,
  image,
  price,
  liquiditySol,
}: {
  symbol: string;
  image: string | null;
  price: number;
  liquiditySol: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 px-4">
      {image ? (
        <div className="relative size-5 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image alt={symbol} className="object-cover" fill src={image} />
        </div>
      ) : (
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
          <span className="font-mono text-[10px] text-muted-foreground">
            {symbol.slice(0, 1)}
          </span>
        </div>
      )}
      <span className="font-medium font-mono text-sm">${symbol}</span>
      <span className="font-mono text-muted-foreground text-xs">
        {price.toFixed(6)} SOL
      </span>
      <span className="font-mono text-muted-foreground/60 text-xs">
        {liquiditySol.toFixed(2)} liq
      </span>
    </div>
  );
}

export function CoinTicker() {
  const { data: coins = [], isLoading } = useQuery({
    queryKey: ["ticker"],
    queryFn: () => rpc.launch.ticker({ limit: 20 }),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  if (isLoading) {
    return (
      <div className="border-border border-b bg-card/50">
        <div className="flex h-10 items-center px-4 text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="border-border border-b bg-card/50">
        <div className="flex h-10 items-center px-4 text-muted-foreground text-sm">
          No active launches yet
        </div>
      </div>
    );
  }

  return (
    <div className="border-border border-b bg-card/50">
      <div className="relative flex h-10 items-center overflow-hidden">
        <div className="flex animate-marquee">
          {coins.map((c, i) => (
            <CoinItem
              image={c.image}
              key={`${c.symbol}-${i}`}
              liquiditySol={c.liquiditySol}
              price={c.price}
              symbol={c.symbol}
            />
          ))}
          {coins.map((c, i) => (
            <CoinItem
              image={c.image}
              key={`${c.symbol}-dup-${i}`}
              liquiditySol={c.liquiditySol}
              price={c.price}
              symbol={c.symbol}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
