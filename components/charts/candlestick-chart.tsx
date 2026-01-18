"use client";

import type { UTCTimestamp } from "lightweight-charts";
import { CandlestickSeries, ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

export interface CandlestickData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  close: number;
  low: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  height?: number;
}

export function CandlestickChart({
  data,
  height = 300,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) {
      return;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa", // zinc-400
      },
      grid: {
        vertLines: { color: "rgba(63, 63, 70, 0.5)" }, // zinc-700/50
        horzLines: { color: "rgba(63, 63, 70, 0.5)" },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      rightPriceScale: {
        borderColor: "#3f3f46", // zinc-700
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "#3f3f46",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: "rgba(161, 161, 170, 0.3)",
          labelBackgroundColor: "#18181b", // zinc-900
        },
        horzLine: {
          color: "rgba(161, 161, 170, 0.3)",
          labelBackgroundColor: "#18181b",
        },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    candlestickSeries.setData(
      data.map((d) => ({
        time: d.time as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center text-muted-foreground text-sm"
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={chartContainerRef} />
    </div>
  );
}

// Generate mock OHLC data for demo purposes
export function generateMockCandlestickData(
  basePrice: number,
  points = 30
): CandlestickData[] {
  const data: CandlestickData[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = points - 1; i >= 0; i--) {
    const time = now - i * 3600; // 1 hour intervals

    const volatility = basePrice * 0.05;
    const open = price;
    const change1 = (Math.random() - 0.48) * volatility;
    const change2 = (Math.random() - 0.48) * volatility;
    const change3 = (Math.random() - 0.48) * volatility;

    const close = open + change1;
    const high = Math.max(open, close) + Math.abs(change2) * 0.5;
    const low = Math.min(open, close) - Math.abs(change3) * 0.5;

    data.push({
      time,
      open: Math.max(0.000_001, open),
      high: Math.max(0.000_001, high),
      low: Math.max(0.000_001, low),
      close: Math.max(0.000_001, close),
    });

    price = close;
  }

  return data;
}
