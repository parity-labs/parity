import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { Router } from "./router";

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.");
    }
    return `${window.location.origin}/api/rpc`;
  },
  headers: async () => {
    if (typeof window !== "undefined") {
      return {};
    }
    const { headers } = await import("next/headers");
    return await headers();
  },
});

export const rpc: RouterClient<Router> = createORPCClient(link);
