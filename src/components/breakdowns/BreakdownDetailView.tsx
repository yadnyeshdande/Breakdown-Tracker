
"use client";

import type { BreakdownPost } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Factory, Cog, Wrench, PackageSearch, Info, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteBreakdownPostAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Corrected import
import React from "react";


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
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // The action now handles redirection internally on success.
      // We expect it might throw an error for redirection or return a message on failure.
      await deleteBreakdownPostAction(breakdown.id);
      // If deleteBreakdownPostAction redirects, this toast might not show, which is fine.
      // If it returns (e.g., on failure before redirect), the toast will show.
      toast({
        title: "Success",
        description: "Breakdown post deleted successfully. You will be redirected.",
      });
      // Explicit router.push might be redundant if action always redirects, but safe fallback.
      // router.push("/breakdowns"); 
    } catch (error: any) {
      // Catching potential redirect errors or other errors from the action
      if (error.message?.includes('NEXT_REDIRECT')) {
        // This is a redirect error, Next.js will handle it.
        throw error;
      }
      toast({
        title: "Error Deleting Breakdown",
        description: error.message || "Could not delete the breakdown post.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };


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
      <CardFooter className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Last updated: {format(new Date(breakdown.updatedAt), "PPPp")}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "Deleting..." : "Delete Breakdown"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this breakdown post
                and return any consumed spares to the inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? "Deleting..." : "Yes, delete it"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
