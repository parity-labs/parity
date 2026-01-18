import { os } from "@orpc/server";
import { chainRouter } from "./routes/chain";
import { launchRouter } from "./routes/launch";
import { poolRouter } from "./routes/pool";

export const router = os.router({
  chain: os.router(chainRouter),
  launch: os.router(launchRouter),
  pool: os.router(poolRouter),
});

export type Router = typeof router;
