"use client";

import { PlusIcon, RocketIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Header } from "@/components/header";
import { LaunchCard } from "@/components/launch-card";
import { rpc } from "@/lib/rpc/client";

interface Launch {
  id: string;
  name: string;
  symbol: string;
  status: "pending" | "active" | "migrated" | "failed";
  curvePreset: "community" | "standard" | "scarce";
  charityName: string | null;
  createdAt: Date;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div className="h-24 animate-pulse bg-muted" key={i} />
      ))}
    </div>
  );
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="border border-destructive/20 bg-destructive/5 p-6">
      <p className="text-destructive text-sm">{error.message}</p>
    </div>
  );
}

function LaunchesContent({
  isLoading,
  error,
  launches,
}: {
  isLoading: boolean;
  error: Error | null;
  launches: Launch[];
}) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  return <LaunchList launches={launches} />;
}

function LaunchList({ launches }: { launches: Launch[] }) {
  if (launches.length === 0) {
    return (
      <div className="border border-border bg-card p-12 text-center">
        <RocketIcon
          className="mx-auto size-12 text-muted-foreground"
          weight="duotone"
        />
        <p className="mt-4 font-medium">No launches yet</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Create your first token launch.
        </p>
        <Link
          className="mt-6 inline-flex h-10 items-center gap-2 bg-primary px-4 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
          href="/create"
        >
          <PlusIcon className="size-4" weight="bold" />
          Create Launch
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {launches.map((launch) => (
        <LaunchCard key={launch.id} launch={launch} />
      ))}
    </div>
  );
}

export default function LaunchesPage() {
  const {
    data: launches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["launches"],
    queryFn: () => rpc.launch.list(),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-medium text-2xl">Your Launches</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your token launches.
            </p>
          </div>
          <Link
            className="flex h-10 items-center gap-2 bg-primary px-4 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
            href="/create"
          >
            <PlusIcon className="size-4" weight="bold" />
            New Launch
          </Link>
        </div>

        <LaunchesContent
          error={error as Error | null}
          isLoading={isLoading}
          launches={(launches ?? []) as Launch[]}
        />
      </main>
    </div>
  );
}
