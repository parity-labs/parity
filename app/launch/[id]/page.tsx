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
import { rpc } from "@/lib/rpc/client";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    description: "Ready to deploy on-chain.",
    icon: ClockIcon,
    className: "text-muted-foreground bg-muted",
  },
  active: {
    label: "Active",
    description: "Live and tradeable.",
    icon: RocketIcon,
    className: "text-primary bg-primary/10",
  },
  migrated: {
    label: "Migrated",
    description: "Graduated to DEX.",
    icon: CheckCircleIcon,
    className: "text-primary bg-primary/10",
  },
  failed: {
    label: "Failed",
    description: "Deployment failed.",
    icon: WarningIcon,
    className: "text-destructive bg-destructive/10",
  },
} as const;

function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="flex items-center gap-1.5 font-mono text-sm transition-colors hover:text-primary"
      onClick={() => navigator.clipboard.writeText(text)}
      type="button"
    >
      {shortAddress(text)}
      <CopyIcon className="size-3.5" />
    </button>
  );
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
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="h-6 w-32 animate-pulse bg-muted" />
        <div className="mt-6 h-48 animate-pulse bg-muted" />
      </div>
    );
  }

  if (error || !launch) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link
          className="mb-6 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/launches"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
        <div className="border border-destructive/20 bg-destructive/5 p-6">
          <p className="text-destructive">
            {error?.message ?? "Launch not found"}
          </p>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[launch.status];
  const StatusIcon = status.icon;
  const isPending = launch.status === "pending";

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        className="mb-6 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
        href="/launches"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-medium text-2xl">{launch.name}</h1>
          <p className="mt-0.5 font-mono text-muted-foreground">
            ${launch.symbol}
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 text-sm ${status.className}`}
        >
          <StatusIcon className="size-4" weight="bold" />
          {status.label}
        </div>
      </div>

      {launch.description && (
        <p className="mt-4 text-muted-foreground text-sm">
          {launch.description}
        </p>
      )}

      <div className="mt-8 space-y-4">
        <div className="border border-border bg-card p-4">
          <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Configuration
          </p>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Curve</span>
              <span className="capitalize">{launch.curvePreset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charity</span>
              <span>{launch.charityName ?? "Unnamed"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Charity Wallet</span>
              <CopyButton text={launch.charityWallet} />
            </div>
          </div>
        </div>

        {launch.poolAddress && (
          <div className="border border-border bg-card p-4">
            <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              On-Chain
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pool</span>
                <CopyButton text={launch.poolAddress} />
              </div>
              {launch.tokenMint && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token</span>
                  <CopyButton text={launch.tokenMint} />
                </div>
              )}
            </div>
          </div>
        )}

        {isPending && (
          <div className="flex gap-3 pt-2">
            <button
              className="flex h-11 flex-1 items-center justify-center gap-2 bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90"
              type="button"
            >
              <RocketIcon className="size-5" weight="bold" />
              Deploy
            </button>
            <button
              className="flex size-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
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
    </div>
  );
}
