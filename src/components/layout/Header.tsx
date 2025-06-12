"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tractor } from "lucide-react"; // Placeholder icon

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      <SidebarTrigger className="md:hidden" />
      <Link href="/" className="flex items-center gap-2">
        <Tractor className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold font-headline">Breakdown Tracker</h1>
      </Link>
      {/* Add UserMenu or other actions here if needed */}
    </header>
  );
}
