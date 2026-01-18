"use client";

import { RocketIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/header";
import { rpc } from "@/lib/rpc/client";

const CURVE_OPTIONS = [
  {
    id: "community",
    name: "Community",
    description: "Gentle curve. Good for community tokens.",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Balanced curve. Similar to pump.fun.",
  },
  {
    id: "scarce",
    name: "Scarce",
    description: "Steeper curve for limited editions.",
  },
] as const;

export default function CreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: "",
    curvePreset: "standard" as const,
    charityWallet: "",
    charityName: "",
  });

  const createMutation = useMutation({
    mutationFn: () =>
      rpc.launch.create({
        name: form.name,
        symbol: form.symbol.toUpperCase(),
        description: form.description || undefined,
        curvePreset: form.curvePreset,
        charityWallet: form.charityWallet,
        charityName: form.charityName || undefined,
      }),
    onSuccess: (data) => {
      router.push(`/launch/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="font-medium text-2xl">Create Launch</h1>
          <p className="mt-1 text-muted-foreground">
            Launch a token with transparent, non-extractive fees.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1.5 block font-medium text-sm"
                htmlFor="name"
              >
                Token Name
              </label>
              <input
                className="h-10 w-full border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                id="name"
                maxLength={50}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="My Token"
                required
                type="text"
                value={form.name}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block font-medium text-sm"
                htmlFor="symbol"
              >
                Symbol
              </label>
              <input
                className="h-10 w-full border border-border bg-card px-3 font-mono text-sm uppercase focus:border-primary focus:outline-none"
                id="symbol"
                maxLength={10}
                onChange={(e) => updateField("symbol", e.target.value)}
                placeholder="MTK"
                required
                type="text"
                value={form.symbol}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block font-medium text-sm"
                htmlFor="description"
              >
                Description
                <span className="ml-1 text-muted-foreground">(optional)</span>
              </label>
              <textarea
                className="min-h-24 w-full resize-none border border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
                id="description"
                maxLength={500}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="What's this token about?"
                value={form.description}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-sm">Curve Preset</p>
            <div className="grid gap-3">
              {CURVE_OPTIONS.map((curve) => (
                <label
                  className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                    form.curvePreset === curve.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  key={curve.id}
                >
                  <input
                    checked={form.curvePreset === curve.id}
                    className="mt-0.5"
                    name="curvePreset"
                    onChange={() => updateField("curvePreset", curve.id)}
                    type="radio"
                    value={curve.id}
                  />
                  <div>
                    <p className="font-medium text-sm">{curve.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {curve.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-border border-t pt-6">
            <p className="font-medium text-sm">Charity Destination</p>
            <p className="text-muted-foreground text-sm">
              30% of all fees go directly to this wallet.
            </p>

            <div>
              <label
                className="mb-1.5 block font-medium text-sm"
                htmlFor="charityWallet"
              >
                Wallet Address
              </label>
              <input
                className="h-10 w-full border border-border bg-card px-3 font-mono text-sm focus:border-primary focus:outline-none"
                id="charityWallet"
                onChange={(e) => updateField("charityWallet", e.target.value)}
                placeholder="So1ana..."
                required
                type="text"
                value={form.charityWallet}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block font-medium text-sm"
                htmlFor="charityName"
              >
                Name
                <span className="ml-1 text-muted-foreground">(optional)</span>
              </label>
              <input
                className="h-10 w-full border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                id="charityName"
                maxLength={100}
                onChange={(e) => updateField("charityName", e.target.value)}
                placeholder="e.g. Red Cross, Local Food Bank"
                type="text"
                value={form.charityName}
              />
            </div>
          </div>

          {createMutation.error && (
            <p className="text-destructive text-sm">
              {createMutation.error.message}
            </p>
          )}

          <button
            className="flex h-12 w-full items-center justify-center gap-2 bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={createMutation.isPending}
            type="submit"
          >
            <RocketIcon className="size-5" weight="bold" />
            {createMutation.isPending ? "Creating..." : "Create Launch"}
          </button>
        </form>
      </main>
    </div>
  );
}
