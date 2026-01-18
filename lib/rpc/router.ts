import { os } from "@orpc/server";
import { chainRouter } from "./routes/chain";
import { configRouter } from "./routes/config";
import { launchRouter } from "./routes/launch";
import { poolRouter } from "./routes/pool";

export const router = os.router({
  chain: os.router(chainRouter),
  config: os.router(configRouter),
  launch: os.router(launchRouter),
  pool: os.router(poolRouter),
});

export type Router = typeof router;
