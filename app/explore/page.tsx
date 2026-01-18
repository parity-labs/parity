"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  MagnifyingGlassIcon,
  RocketIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rpc } from "@/lib/rpc/client";
import { cn } from "@/lib/utils";

type LaunchStatus = "pending" | "active" | "migrated" | "failed";

interface Launch {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  image: string | null;
  charityName: string | null;
  charityWallet: string;
  status: LaunchStatus;
  poolAddress: string | null;
  tokenMint: string | null;
  createdAt: Date;
  migratedAt: Date | null;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: ClockIcon,
    className: "text-muted-foreground bg-muted",
  },
  active: {
    label: "Active",
    icon: RocketIcon,
    className: "text-emerald-600 bg-emerald-500/10",
  },
  migrated: {
    label: "Migrated",
    icon: CheckCircleIcon,
    className: "text-blue-600 bg-blue-500/10",
  },
  failed: {
    label: "Failed",
    icon: WarningIcon,
    className: "text-destructive bg-destructive/10",
  },
} as const;

function truncateAddress(address: string | null) {
  if (!address) {
    return "—";
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className="ml-1 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
      onClick={handleCopy}
      title="Copy address"
      type="button"
    >
      <CopyIcon className={cn("size-3.5", copied && "text-emerald-500")} />
    </button>
  );
}

function StatusBadge({ status }: { status: LaunchStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 font-medium text-xs",
        config.className
      )}
    >
      <Icon className="size-3" weight="bold" />
      {config.label}
    </span>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((id) => (
        <div className="h-14 animate-pulse bg-muted" key={id} />
      ))}
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="border border-border bg-card p-12 text-center">
      <MagnifyingGlassIcon
        className="mx-auto size-12 text-muted-foreground"
        weight="duotone"
      />
      <p className="mt-4 font-medium">
        {hasFilter ? "No launches match your filter" : "No launches yet"}
      </p>
      <p className="mt-1 text-muted-foreground text-sm">
        {hasFilter
          ? "Try adjusting your filter criteria."
          : "Be the first to create a token launch."}
      </p>
    </div>
  );
}

function StatusFilter({
  value,
  onChange,
}: {
  value: LaunchStatus | "all";
  onChange: (status: LaunchStatus | "all") => void;
}) {
  const statuses: Array<{ value: LaunchStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "migrated", label: "Migrated" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <div className="flex items-center gap-1">
      {statuses.map((status) => (
        <button
          className={cn(
            "px-3 py-1.5 font-medium text-sm transition-colors",
            value === status.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
          key={status.value}
          onClick={() => onChange(status.value)}
          type="button"
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}

function LaunchesTable({ launches }: { launches: Launch[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Charity</TableHead>
          <TableHead>Pool Address</TableHead>
          <TableHead>Token Mint</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {launches.map((launch) => (
          <TableRow key={launch.id}>
            <TableCell>
              <Link
                className="group flex items-center gap-3"
                href={`/launch/${launch.id}`}
              >
                {launch.image ? (
                  <Image
                    alt={launch.name}
                    className="size-8 rounded-full object-cover"
                    height={32}
                    src={launch.image}
                    width={32}
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <RocketIcon className="size-4" />
                  </div>
                )}
                <div>
                  <p className="font-medium group-hover:underline">
                    {launch.name}
                  </p>
                  <p className="font-mono text-muted-foreground text-xs">
                    ${launch.symbol}
                  </p>
                </div>
              </Link>
            </TableCell>
            <TableCell>
              <StatusBadge status={launch.status} />
            </TableCell>
            <TableCell>
              {launch.charityName ? (
                <span className="text-sm">{launch.charityName}</span>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
            <TableCell>
              {launch.poolAddress ? (
                <span className="inline-flex items-center font-mono text-sm">
                  {truncateAddress(launch.poolAddress)}
                  <CopyButton text={launch.poolAddress} />
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
            <TableCell>
              {launch.tokenMint ? (
                <span className="inline-flex items-center font-mono text-sm">
                  {truncateAddress(launch.tokenMint)}
                  <CopyButton text={launch.tokenMint} />
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground text-sm">
                {formatDate(launch.createdAt)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ExplorePage() {
  const [statusFilter, setStatusFilter] = useState<LaunchStatus | "all">("all");

  const {
    data: launches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["launches", "all", statusFilter],
    queryFn: () =>
      rpc.launch.listAll({
        limit: 50,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-medium text-2xl">Explore Launches</h1>
        <p className="mt-0.5 text-muted-foreground text-sm">
          Browse all token launches on the platform.
        </p>
      </div>

      <div className="mb-4">
        <StatusFilter onChange={setStatusFilter} value={statusFilter} />
      </div>

      {isLoading && <LoadingSkeleton />}
      {!isLoading && error && (
        <div className="border border-destructive/20 bg-destructive/5 p-6">
          <p className="text-destructive text-sm">
            {error instanceof Error ? error.message : "Failed to load launches"}
          </p>
        </div>
      )}
      {!(isLoading || error) && (!launches || launches.length === 0) && (
        <EmptyState hasFilter={statusFilter !== "all"} />
      )}
      {!(isLoading || error) && launches && launches.length > 0 && (
        <div className="border border-border bg-card">
          <LaunchesTable launches={launches as Launch[]} />
        </div>
      )}
    </div>
  );
}
