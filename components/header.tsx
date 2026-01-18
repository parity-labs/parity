"use client";

import { GithubLogoIcon, RocketIcon, ScalesIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AuthButton } from "./auth-button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-border border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link className="flex items-center gap-3" href="/">
          <ScalesIcon className="h-8 w-8 text-foreground" weight="bold" />
          <span className="font-medium text-lg tracking-tight">Parity</span>
        </Link>
        <nav className="hidden items-center gap-8 text-muted-foreground text-sm md:flex">
          {session?.user ? (
            <>
              <Link
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                href="/launches"
              >
                <RocketIcon className="size-4" weight="bold" />
                Launches
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="/create"
              >
                Create
              </Link>
            </>
          ) : (
            <>
              <a
                className="transition-colors hover:text-foreground"
                href="#fees"
              >
                Fees
              </a>
              <a
                className="transition-colors hover:text-foreground"
                href="#protocol"
              >
                Protocol
              </a>
            </>
          )}
          <a
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            href="https://github.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubLogoIcon className="size-4" weight="bold" />
            GitHub
          </a>
        </nav>
        <AuthButton />
      </div>
    </header>
  );
}
