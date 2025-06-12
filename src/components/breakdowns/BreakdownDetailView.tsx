import type { BreakdownPost } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Factory, Cog, Wrench, PackageSearch, Info } from "lucide-react";
import { format } from 'date-fns';

interface BreakdownDetailViewProps {
  breakdown: BreakdownPost;
}

function getCategoryIcon(category: BreakdownPost['category']) {
    switch (category) {
        case 'Electrical': return <Cog className="h-5 w-5 text-orange-500" />;
        case 'Mechanical': return <Wrench className="h-5 w-5 text-blue-500" />;
        case 'Instrumentation': return <Factory className="h-5 w-5 text-green-500" />;
        default: return <Wrench className="h-5 w-5 text-gray-500" />;
    }
}

export function BreakdownDetailView({ breakdown }: BreakdownDetailViewProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-headline text-primary">
            {breakdown.machine} on {breakdown.line}
          </CardTitle>
          <Badge variant={breakdown.category === 'Electrical' ? 'destructive' : (breakdown.category === 'Mechanical' ? 'default' : 'secondary')} className="capitalize text-sm px-3 py-1">
            {getCategoryIcon(breakdown.category)}
            <span className="ml-2">{breakdown.category}</span>
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground flex items-center pt-1">
          <CalendarDays className="h-4 w-4 mr-1.5" />
          Logged on: {format(new Date(breakdown.createdAt), "PPPp")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
            <Info className="h-4 w-4 mr-2 text-accent" />
            Breakdown Details
          </h3>
          <p className="text-md text-foreground whitespace-pre-wrap">{breakdown.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                <Clock className="h-4 w-4 mr-2 text-accent" />
                Loss Time
              </h3>
              <p className="text-lg font-semibold text-foreground">{breakdown.lossTime} minutes</p>
            </div>
             <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                <Factory className="h-4 w-4 mr-2 text-accent" />
                Affected Line
              </h3>
              <p className="text-md text-foreground">{breakdown.line}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                <Cog className="h-4 w-4 mr-2 text-accent" />
                Affected Machine
              </h3>
              <p className="text-md text-foreground">{breakdown.machine}</p>
            </div>
        </div>

        {breakdown.sparesConsumed.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
              <PackageSearch className="h-4 w-4 mr-2 text-accent" />
              Spares Consumed
            </h3>
            <ul className="space-y-2 list-disc list-inside pl-1">
              {breakdown.sparesConsumed.map((spare, index) => (
                <li key={index} className="text-md text-foreground">
                  {spare.partNumber} - {spare.description}: <span className="font-semibold">{spare.quantityConsumed} unit(s)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Last updated: {format(new Date(breakdown.updatedAt), "PPPp")}
      </CardFooter>
    </Card>
  );
}
