"use client";

import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      {children}
    </SidebarProvider>
  );
}
