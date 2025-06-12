"use client";

import React, { useState } from "react";
import type { SparePart } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2, PackageSearch, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SpareForm } from "./SpareForm";
import { deleteSparePartAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "../ui/input";

interface SpareListProps {
  initialSpareParts: SparePart[];
}

export function SpareList({ initialSpareParts }: SpareListProps) {
  const [spareParts, setSpareParts] = useState<SparePart[]>(initialSpareParts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpare, setEditingSpare] = useState<SparePart | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleFormSuccess = async () => {
    // This is a client-side update for immediate feedback.
    // In a real app, you'd likely re-fetch or rely on cache invalidation.
    // For now, we can't easily re-fetch without a full page reload with server components.
    // This will be out of sync if the action fails silently or if there are concurrent updates.
    // A better approach for SPA-like feel would involve client-side state management or optimistic updates.
    // For now, closing the dialog and relying on revalidation is simplest.
    setIsFormOpen(false);
    setEditingSpare(undefined);
    // Consider fetching updated list here or rely on revalidatePath
    toast({ title: "Action successful", description: "Inventory list will update shortly." });
  };

  const handleDelete = async (id: string) => {
    const result = await deleteSparePartAction(id);
    if (result.message.includes("success")) {
      setSpareParts(prev => prev.filter(sp => sp.id !== id)); // Optimistic update
      toast({
        title: "Success",
        description: result.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const filteredSpareParts = spareParts.filter(spare =>
    spare.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spare.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spare.location.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input 
          placeholder="Search inventory (part no, desc, location)..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-ai-hint="search spares"
        />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSpare(undefined)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Spare
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSpare ? "Edit" : "Add New"} Spare Part</DialogTitle>
            </DialogHeader>
            <SpareForm sparePart={editingSpare} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {filteredSpareParts.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg text-center">
            <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Spare Parts Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new spare part to your inventory."}
            </p>
            {!searchTerm && (
                <Button onClick={() => { setEditingSpare(undefined); setIsFormOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Spare
                </Button>
            )}
        </div>
      ) : (
        <div className="rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpareParts.map((spare) => (
                <TableRow key={spare.id}>
                  <TableCell className="font-medium">{spare.partNumber}</TableCell>
                  <TableCell>{spare.description}</TableCell>
                  <TableCell className="text-right">{spare.quantity}</TableCell>
                  <TableCell>{spare.location}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingSpare(spare);
                        setIsFormOpen(true);
                      }}
                      className="mr-2 hover:text-accent"
                      aria-label="Edit Spare Part"
                    >
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-destructive" aria-label="Delete Spare Part">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the spare part
                            "{spare.partNumber} - {spare.description}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(spare.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
