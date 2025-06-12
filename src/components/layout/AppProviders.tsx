"use client";

import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true} className="bg-muted/40">
      {children}
    </SidebarProvider>
  );
}
