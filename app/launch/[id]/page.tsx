"use client";

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  RocketIcon,
  SpinnerIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  SendTransactionError,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { rpc } from "@/lib/rpc/client";
import { getConnection } from "@/lib/solana";

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

  const { publicKey, signTransaction, connected } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const [deployError, setDeployError] = useState<string | null>(null);

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

  const deployMutation = useMutation({
    mutationFn: async () => {
      if (!(publicKey && signTransaction)) {
        throw new Error("Wallet not connected");
      }

      setDeployError(null);

      const prepareResult = await rpc.launch.prepareDeploy({
        id,
        creatorWallet: publicKey.toBase58(),
      });

      const txBuffer = Buffer.from(prepareResult.transaction, "base64");
      let signedTx: Transaction | VersionedTransaction;

      try {
        signedTx = await signTransaction(
          VersionedTransaction.deserialize(txBuffer)
        );
      } catch {
        signedTx = await signTransaction(Transaction.from(txBuffer));
      }

      const connection = getConnection();

      let signature: string;
      try {
        signature = await connection.sendRawTransaction(signedTx.serialize());
      } catch (err) {
        if (err instanceof SendTransactionError) {
          const logs = await err.getLogs(connection);
          console.error("Transaction logs:", logs);
          const logsPreview = logs?.slice(0, 5).join("\n") ?? "No logs";
          throw new Error(
            `Transaction simulation failed.\nLogs:\n${logsPreview}`
          );
        }
        throw err;
      }

      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      await rpc.launch.confirmDeploy({
        id,
        poolAddress: prepareResult.poolAddress,
        tokenMint: prepareResult.baseMint,
        signature,
      });

      return { signature, poolAddress: prepareResult.poolAddress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launch", id] });
      queryClient.invalidateQueries({ queryKey: ["launches"] });
    },
    onError: (err) => {
      setDeployError(err.message);
    },
  });

  const handleDeploy = () => {
    if (!connected) {
      setWalletModalVisible(true);
      return;
    }
    deployMutation.mutate();
  };

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
  const isDeploying = deployMutation.isPending;

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
          <>
            {!connected && (
              <div className="flex items-start gap-2 border border-border bg-muted/30 p-3">
                <WarningIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  weight="fill"
                />
                <p className="text-muted-foreground text-xs">
                  Connect your wallet to deploy this token on-chain.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                className="flex h-11 flex-1 items-center justify-center gap-2 bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isDeploying}
                onClick={handleDeploy}
                type="button"
              >
                {isDeploying ? (
                  <>
                    <SpinnerIcon className="size-5 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <RocketIcon className="size-5" weight="bold" />
                    {connected ? "Deploy" : "Connect Wallet"}
                  </>
                )}
              </button>
              <button
                className="flex size-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                disabled={deleteMutation.isPending || isDeploying}
                onClick={() => deleteMutation.mutate()}
                type="button"
              >
                <TrashIcon className="size-5" weight="bold" />
              </button>
            </div>
          </>
        )}

        {(deployError || deleteMutation.error) && (
          <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/5 p-3">
            <WarningIcon
              className="mt-0.5 size-4 shrink-0 text-destructive"
              weight="bold"
            />
            <p className="text-destructive text-sm">
              {deployError || deleteMutation.error?.message}
            </p>
          </div>
        )}

        {deployMutation.isSuccess && (
          <div className="flex items-start gap-2 border border-primary/30 bg-primary/5 p-3">
            <CheckCircleIcon
              className="mt-0.5 size-4 shrink-0 text-primary"
              weight="fill"
            />
            <p className="text-primary text-sm">
              Token deployed successfully! Your token is now live on Meteora.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
