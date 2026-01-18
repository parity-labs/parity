import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { Router } from "./router";

const link = new RPCLink({
  url: "/api/rpc",
});

export const rpc = createORPCClient<Router>(link);
