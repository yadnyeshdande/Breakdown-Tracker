import { AppLayout } from "@/components/layout/AppLayout";
import { SpareList } from "@/components/inventory/SpareList";
import { getSpareParts } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function InventoryPage() {
  const spareParts = await getSpareParts();

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-headline text-primary">Spares Inventory</h1>
        </div>
        <Suspense fallback={<InventorySkeleton />}>
          <SpareList initialSpareParts={spareParts} />
        </Suspense>
      </div>
    </AppLayout>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="rounded-lg border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
            <div className="space-y-2 w-1/4">
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2 w-1/3">
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2 w-1/6">
              <Skeleton className="h-4 w-1/2 ml-auto" />
            </div>
             <div className="space-y-2 w-1/6">
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="w-1/6 flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Spares Inventory - Breakdown Tracker",
  description: "Manage your spare parts inventory.",
};
