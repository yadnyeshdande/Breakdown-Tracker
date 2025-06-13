import Link from "next/link";
import type { BreakdownPost } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CalendarDays, Clock, Factory, Cog, Wrench } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface BreakdownCardProps {
  breakdown: BreakdownPost;
}

function getCategoryIcon(category: BreakdownPost['category']) {
    switch (category) {
        case 'Electrical': return <Cog className="h-4 w-4 text-orange-500" />;
        case 'Mechanical': return <Wrench className="h-4 w-4 text-blue-500" />;
        case 'Instrumentation': return <Factory className="h-4 w-4 text-green-500" />; // Using Factory as a placeholder
        default: return <Wrench className="h-4 w-4 text-gray-500" />;
    }
}

export function BreakdownCard({ breakdown }: BreakdownCardProps) {
  const timeAgo = formatDistanceToNow(new Date(breakdown.createdAt), { addSuffix: true });

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-primary mb-1 leading-tight">{breakdown.machine} at {breakdown.line}</CardTitle>
            <Badge variant={breakdown.category === 'Electrical' ? 'destructive' : (breakdown.category === 'Mechanical' ? 'default' : 'secondary')} className="capitalize whitespace-nowrap">
                {getCategoryIcon(breakdown.category)}
                <span className="ml-1">{breakdown.category}</span>
            </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground flex items-center">
            <CalendarDays className="h-3 w-3 mr-1" /> Logged {timeAgo}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground line-clamp-3 mb-3">{breakdown.description}</p>
        <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-1.5"/>
            Loss Time: <span className="font-medium text-foreground ml-1">{breakdown.lossTime} mins</span>
        </div>
         {breakdown.sparesConsumed.length > 0 && (
            <div className="mt-2 text-xs">
                <span className="font-medium">Spares:</span> {breakdown.sparesConsumed.map(s => `${s.partNumber} (x${s.quantityConsumed})`).join(', ')}
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/breakdowns/${breakdown.id}`} className="text-sm font-medium text-accent hover:underline flex items-center">
          View Details <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
