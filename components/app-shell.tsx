"use client";

import { ListIcon } from "@phosphor-icons/react";
import { AppSidebar } from "@/components/app-sidebar";
import { CoinTicker } from "@/components/coin-ticker";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-screen flex-col overflow-hidden">
        <header className="shrink-0 bg-background">
          <div className="flex h-12 items-center gap-2 border-border border-b px-4 md:hidden">
            <SidebarTrigger>
              <ListIcon className="size-5" />
            </SidebarTrigger>
            <span className="font-medium text-sm">Parity</span>
          </div>
          <CoinTicker />
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
