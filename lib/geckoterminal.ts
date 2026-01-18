const GECKOTERMINAL_API = "https://api.geckoterminal.com/api/v2";

export interface OHLCVCandle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OHLCVResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      ohlcv_list: [number, number, number, number, number, number][]; // [timestamp, open, high, low, close, volume]
    };
  };
}

export type Timeframe = "minute" | "hour" | "day";

/**
 * Fetch OHLCV candlestick data from GeckoTerminal
 * @param poolAddress - The Solana pool address
 * @param timeframe - minute, hour, or day
 * @param aggregate - Number of time units per candle (e.g., 1, 5, 15 for minutes)
 * @param limit - Number of candles to return (max ~1000)
 */
export async function getOHLCVData(
  poolAddress: string,
  timeframe: Timeframe = "hour",
  aggregate = 1,
  limit = 100
): Promise<OHLCVCandle[]> {
  try {
    const url = `${GECKOTERMINAL_API}/networks/solana/pools/${poolAddress}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}&currency=usd&token=base`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error(
        `GeckoTerminal API error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data: OHLCVResponse = await response.json();

    if (!data.data?.attributes?.ohlcv_list) {
      return [];
    }

    // Transform the array format to our interface
    // GeckoTerminal returns: [timestamp, open, high, low, close, volume]
    return data.data.attributes.ohlcv_list
      .map(([timestamp, open, high, low, close, volume]) => ({
        time: Math.floor(timestamp), // Already in seconds
        open,
        high,
        low,
        close,
        volume,
      }))
      .sort((a, b) => a.time - b.time); // Ensure chronological order
  } catch (error) {
    console.error("Failed to fetch OHLCV data:", error);
    return [];
  }
}
