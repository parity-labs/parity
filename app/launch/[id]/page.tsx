"use client";

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  RocketIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { rpc } from "@/lib/rpc/client";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    description: "Ready to deploy on-chain.",
    icon: ClockIcon,
    className: "text-muted-foreground",
  },
  active: {
    label: "Active",
    description: "Live and tradeable.",
    icon: RocketIcon,
    className: "text-primary",
  },
  migrated: {
    label: "Migrated",
    description: "Graduated to DEX.",
    icon: CheckCircleIcon,
    className: "text-primary",
  },
  failed: {
    label: "Failed",
    description: "Deployment failed.",
    icon: WarningIcon,
    className: "text-destructive",
  },
} as const;

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function LaunchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const {
    data: launch,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["launch", id],
    queryFn: () => rpc.launch.get({ id }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => rpc.launch.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launches"] });
      router.push("/launches");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-12">
          <div className="h-8 w-48 animate-pulse bg-muted" />
          <div className="mt-4 h-64 animate-pulse bg-muted" />
        </main>
      </div>
    );
  }

  if (error || !launch) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-12">
          <div className="border border-destructive/20 bg-destructive/5 p-6">
            <p className="text-destructive">
              {error?.message ?? "Launch not found"}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const status = STATUS_CONFIG[launch.status];
  const StatusIcon = status.icon;
  const isPending = launch.status === "pending";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link
          className="mb-6 inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/launches"
        >
          <ArrowLeftIcon className="size-4" />
          Back to launches
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-medium text-2xl">{launch.name}</h1>
            <p className="mt-1 font-mono text-muted-foreground">
              ${launch.symbol}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 ${status.className}`}>
            <StatusIcon className="size-5" weight="bold" />
            <span className="font-medium">{status.label}</span>
          </div>
        </div>

        {launch.description && (
          <p className="mt-4 text-muted-foreground">{launch.description}</p>
        )}

        <div className="mt-8 space-y-6">
          <div className="border border-border bg-card p-4">
            <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Configuration
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Curve</span>
                <span className="text-sm capitalize">{launch.curvePreset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Charity</span>
                <span className="text-sm">
                  {launch.charityName ?? "Unnamed"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Charity Wallet
                </span>
                <button
                  className="flex items-center gap-1 font-mono text-sm transition-colors hover:text-primary"
                  onClick={() =>
                    navigator.clipboard.writeText(launch.charityWallet)
                  }
                  type="button"
                >
                  {shortAddress(launch.charityWallet)}
                  <CopyIcon className="size-3" />
                </button>
              </div>
            </div>
          </div>

          {launch.poolAddress && (
            <div className="border border-border bg-card p-4">
              <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                On-Chain
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Pool</span>
                  <button
                    className="flex items-center gap-1 font-mono text-sm transition-colors hover:text-primary"
                    onClick={() =>
                      navigator.clipboard.writeText(launch.poolAddress ?? "")
                    }
                    type="button"
                  >
                    {shortAddress(launch.poolAddress)}
                    <CopyIcon className="size-3" />
                  </button>
                </div>
                {launch.tokenMint && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Token</span>
                    <button
                      className="flex items-center gap-1 font-mono text-sm transition-colors hover:text-primary"
                      onClick={() =>
                        navigator.clipboard.writeText(launch.tokenMint ?? "")
                      }
                      type="button"
                    >
                      {shortAddress(launch.tokenMint)}
                      <CopyIcon className="size-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isPending && (
            <div className="flex gap-3">
              <button
                className="flex h-12 flex-1 items-center justify-center gap-2 bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90"
                type="button"
              >
                <RocketIcon className="size-5" weight="bold" />
                Deploy On-Chain
              </button>
              <button
                className="flex size-12 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                type="button"
              >
                <TrashIcon className="size-5" weight="bold" />
              </button>
            </div>
          )}

          {deleteMutation.error && (
            <p className="text-destructive text-sm">
              {deleteMutation.error.message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
