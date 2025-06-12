
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Header } from "./Header";
import { SidebarNav } from "./SidebarNav";
import { Tractor } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 p-2 h-14">
            <SidebarTrigger className="hidden md:flex text-sidebar-foreground hover:text-sidebar-accent-foreground" />
             <Tractor className="h-6 w-6 text-sidebar-primary flex-shrink-0 ml-1 group-data-[collapsible=icon]:ml-0" />
            <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden whitespace-nowrap">
              Breakdown Tracker
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col flex-1 h-screen overflow-hidden transition-[padding] duration-200 ease-linear peer-data-[state=expanded]:sm:pl-[var(--sidebar-width)] peer-data-[state=collapsed]:peer-data-[collapsible=icon]:sm:pl-[var(--sidebar-width-icon)] peer-data-[collapsible=offcanvas]:sm:pl-0">
         <Header />
        <SidebarInset className="flex-1 bg-background p-4 sm:px-6 sm:pb-6 sm:pt-[calc(theme(spacing.16)_+_theme(spacing.4))]">
            {children}
        </SidebarInset>
      </div>
    </>
  );
}
