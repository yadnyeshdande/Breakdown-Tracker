import { AppLayout } from "@/components/layout/AppLayout";
import { BreakdownDetailView } from "@/components/breakdowns/BreakdownDetailView";
import { getBreakdownPostById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface BreakdownDetailPageProps {
  params: { id: string };
}

export default async function BreakdownDetailPage({ params }: BreakdownDetailPageProps) {
  const breakdown = await getBreakdownPostById(params.id);

  if (!breakdown) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/breakdowns">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Breakdowns
          </Link>
        </Button>
        <Suspense fallback={<BreakdownDetailSkeleton />}>
            <BreakdownDetailView breakdown={breakdown} />
        </Suspense>
      </div>
    </AppLayout>
  );
}

function BreakdownDetailSkeleton() {
    return (
      <div className="w-full max-w-3xl mx-auto border rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-start">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/5" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        
        <div>
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-4 w-1/3 mb-1" />
                    <Skeleton className="h-6 w-2/3" />
                </div>
            ))}
        </div>

        <div>
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-5 w-full mb-1" />
            <Skeleton className="h-5 w-full" />
        </div>
        <Skeleton className="h-4 w-1/3 ml-auto" />
      </div>
    );
}


export async function generateMetadata({ params }: BreakdownDetailPageProps) {
  const breakdown = await getBreakdownPostById(params.id);
  if (!breakdown) {
    return { title: "Breakdown Not Found" };
  }
  return {
    title: `Breakdown: ${breakdown.machine} on ${breakdown.line} - Breakdown Tracker`,
    description: breakdown.description.substring(0, 150),
  };
}
