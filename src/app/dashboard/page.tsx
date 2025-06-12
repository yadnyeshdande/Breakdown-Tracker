import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart, PieChartIcon, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getBreakdownPosts, getSpareParts } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const breakdowns = await getBreakdownPosts();
  const spares = await getSpareParts();

  const totalLossTime = breakdowns.reduce((sum, b) => sum + b.lossTime, 0);
  const lowStockSpares = spares.filter(s => s.quantity < 5).length;

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-headline mb-8 text-primary">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Breakdowns</CardTitle>
              <Activity className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{breakdowns.length}</div>
              <p className="text-xs text-muted-foreground">Recorded incidents</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loss Time</CardTitle>
              <BarChart className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLossTime} <span className="text-sm">mins</span></div>
              <p className="text-xs text-muted-foreground">Across all breakdowns</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
              <PieChartIcon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spares.length}</div>
              <p className="text-xs text-muted-foreground">Total unique spare parts</p>
            </CardContent>
          </Card>
           <Card className={`shadow-lg hover:shadow-xl transition-shadow ${lowStockSpares > 0 ? 'border-destructive' : 'border-green-500'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              {lowStockSpares > 0 ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lowStockSpares > 0 ? 'text-destructive' : 'text-green-500'}`}>{lowStockSpares}</div>
              <p className="text-xs text-muted-foreground">Items with quantity less than 5</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Recent Breakdowns</CardTitle>
                    <CardDescription>A quick look at the latest reported issues.</CardDescription>
                </CardHeader>
                <CardContent>
                    {breakdowns.slice(0, 3).map(b => (
                        <div key={b.id} className="mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-0">
                            <Link href={`/breakdowns/${b.id}`} className="font-medium text-primary hover:underline">{b.machine} on {b.line}</Link>
                            <p className="text-sm text-muted-foreground">{b.description.substring(0,50)}...</p>
                            <p className="text-xs text-muted-foreground">Loss: {b.lossTime} mins | Category: {b.category}</p>
                        </div>
                    ))}
                    {breakdowns.length === 0 && <p className="text-muted-foreground">No breakdowns recorded yet.</p>}
                     <Button asChild variant="link" className="px-0 text-primary">
                        <Link href="/breakdowns">View All Breakdowns &rarr;</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Get started with common tasks.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-3">
                    <Button asChild className="w-full justify-start">
                        <Link href="/breakdowns/create">Log New Breakdown</Link>
                    </Button>
                     <Button asChild variant="secondary" className="w-full justify-start">
                        <Link href="/inventory">Manage Spare Parts</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </AppLayout>
  );
}
