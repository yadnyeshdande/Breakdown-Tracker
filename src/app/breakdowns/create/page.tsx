import { AppLayout } from "@/components/layout/AppLayout";
import { BreakdownForm } from "@/components/breakdowns/BreakdownForm";
import { getSpareParts } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function CreateBreakdownPage() {
  const availableSpares = await getSpareParts();

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
         <Card className="max-w-3xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary">Log New Breakdown</CardTitle>
                <CardDescription>Fill in the details of the equipment breakdown and any spare parts consumed.</CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<BreakdownFormSkeleton />}>
                    <BreakdownForm availableSpares={availableSpares} />
                </Suspense>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function BreakdownFormSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
            <Skeleton className="h-24 w-full" />
            <div>
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-8 w-1/3" />
            </div>
            <Skeleton className="h-10 w-1/4" />
        </div>
    );
}

export const metadata = {
  title: "Log New Breakdown - Breakdown Tracker",
  description: "Create a new breakdown report.",
};
