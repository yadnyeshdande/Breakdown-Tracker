
import { Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getBreakdownPosts } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BreakdownPost } from "@/lib/types";

// Dynamically import sections to allow for code splitting and suspense
import { MttrSection } from "@/components/kpi/MttrSection";
import { MtbfSection } from "@/components/kpi/MtbfSection";
import { ParetoSection } from "@/components/kpi/ParetoSection";

export const metadata = {
  title: "KPI Dashboard - Breakdown Tracker",
  description: "Analyze Key Performance Indicators like MTTR, MTBF, and Pareto.",
};

export default async function KpiPage() {
  const breakdowns = await getBreakdownPosts();

  // Normalize machine names (trim whitespace) and get unique, sorted list. Filter out empty strings.
  const allMachines = Array.from(new Set(breakdowns.map(b => b.machine.trim()))).filter(m => m).sort();

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <h1 className="text-3xl font-headline text-primary">KPI Dashboard</h1>

        <Tabs defaultValue="mttr" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="mttr" className="w-full">MTTR Analysis</TabsTrigger>
            <TabsTrigger value="mtbf" className="w-full">MTBF Analysis</TabsTrigger>
            <TabsTrigger value="pareto" className="w-full">Pareto Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="mttr">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Mean Time To Repair (MTTR)</CardTitle>
                <CardDescription>Average time taken to repair a machine after a failure.</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<KpiSectionSkeleton />}>
                  <MttrSection breakdowns={breakdowns} allMachines={allMachines} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mtbf">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Mean Time Between Failures (MTBF)</CardTitle>
                <CardDescription>Average time a machine operates successfully between failures.</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<KpiSectionSkeleton />}>
                  <MtbfSection breakdowns={breakdowns} allMachines={allMachines} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pareto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Pareto Analysis (Loss Time by Machine)</CardTitle>
                <CardDescription>Identify machines contributing most to total downtime (80/20 rule).</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<KpiSectionSkeleton />}>
                  <ParetoSection breakdowns={breakdowns} allMachines={allMachines} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function KpiSectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-10 w-1/3" />
    </div>
  );
}
