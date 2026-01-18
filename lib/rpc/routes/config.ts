import { os } from "@orpc/server";
import { CURVE_PRESETS, FEE_DISTRIBUTION } from "@/lib/dbc";

export const configRouter = os.router({
  curvePresets: os.handler(() => {
    return Object.entries(CURVE_PRESETS).map(([key, preset]) => ({
      id: key,
      ...preset,
    }));
  }),

  feeDistribution: os.handler(() => {
    return FEE_DISTRIBUTION;
  }),
});
