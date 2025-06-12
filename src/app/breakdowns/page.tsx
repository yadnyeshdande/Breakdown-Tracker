import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { BreakdownCard } from "@/components/breakdowns/BreakdownCard";
import { getBreakdownPosts } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function BreakdownsPage() {
  const breakdowns = await getBreakdownPosts();

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-headline text-primary">Breakdown Reports</h1>
          <Button asChild>
            <Link href="/breakdowns/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Log New Breakdown
            </Link>
          </Button>
        </div>

        <Suspense fallback={<BreakdownListSkeleton />}>
          {breakdowns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg text-center min-h-[300px]">
              <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Breakdowns Logged Yet</h3>
              <p className="text-muted-foreground mb-4">Start by logging a new breakdown event.</p>
              <Button asChild>
                <Link href="/breakdowns/create">
                  <PlusCircle className="mr-2 h-4 w-4" /> Log New Breakdown
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {breakdowns.map((breakdown) => (
                <BreakdownCard key={breakdown.id} breakdown={breakdown} />
              ))}
            </div>
          )}
        </Suspense>
      </div>
    </AppLayout>
  );
}

function BreakdownListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="border rounded-lg p-4 space-y-3 shadow-sm">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
        </div>
    )
}

export const metadata = {
  title: "Breakdown Reports - Breakdown Tracker",
  description: "View all recorded breakdown incidents.",
};
