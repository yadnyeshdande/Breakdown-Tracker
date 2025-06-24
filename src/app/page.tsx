import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Archive } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline text-primary">Welcome to Body PU Maintenance CMMS</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Efficiently manage your equipment breakdowns and spare parts inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/breakdowns">
                <ClipboardList className="mr-2 h-5 w-5" /> View Breakdowns
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/inventory">
                <Archive className="mr-2 h-5 w-5" /> Manage Inventory
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <section className="mt-16 w-full max-w-4xl text-center">
            <h2 className="text-2xl font-headline text-foreground mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2"><ClipboardList className="text-accent"/>Breakdown Logging</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Quickly create detailed breakdown reports, including loss time, affected machinery, and consumed spares.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2"><Archive className="text-accent"/>Inventory Control</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Maintain an accurate inventory of spare parts. Consumption is automatically tracked with each breakdown.</p>
                    </CardContent>
                </Card>
            </div>
        </section>
      </div>
    </AppLayout>
  );
}
