import * as React from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { SidebarProvider } from "./sidebar-context";
import { CommandPalette } from "@/components/CommandPalette";
import { DemoProvider } from "@/components/demo-mode/demo-context";
import { DemoLauncher } from "@/components/demo-mode/demo-launcher";
import { DemoOverlay } from "@/components/demo-mode/demo-overlay";

export function AppLayout({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DemoProvider>
        <div className="min-h-screen flex bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 overflow-x-hidden min-w-0">{children ?? <Outlet />}</main>
          </div>
          <CommandPalette />
          <DemoLauncher />
          <DemoOverlay />
        </div>
      </DemoProvider>
    </SidebarProvider>
  );
}
