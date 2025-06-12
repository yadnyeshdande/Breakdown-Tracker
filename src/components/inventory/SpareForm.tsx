"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SparePart } from "@/lib/types";
import { createSparePartAction, updateSparePartAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "@/components/SubmitButton";
import React from "react";

const formSchema = z.object({
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(0, "Quantity must be a non-negative integer"),
  location: z.string().min(1, "Location is required"),
});

type SpareFormValues = z.infer<typeof formSchema>;

interface SpareFormProps {
  sparePart?: SparePart;
  onSuccess?: () => void;
}

export function SpareForm({ sparePart, onSuccess }: SpareFormProps) {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useForm<SpareFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: sparePart
      ? {
          partNumber: sparePart.partNumber,
          description: sparePart.description,
          quantity: sparePart.quantity,
          location: sparePart.location,
        }
      : {
          partNumber: "",
          description: "",
          quantity: 0,
          location: "",
        },
  });

  async function onSubmit(data: SpareFormValues) {
    const formData = new FormData();
    formData.append("partNumber", data.partNumber);
    formData.append("description", data.description);
    formData.append("quantity", String(data.quantity));
    formData.append("location", data.location);

    const action = sparePart
      ? updateSparePartAction.bind(null, sparePart.id)
      : createSparePartAction;

    const result = await action(formData);

    if (result.message.includes("success")) {
      toast({
        title: "Success",
        description: result.message,
      });
      form.reset();
      formRef.current?.reset();
      onSuccess?.();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            form.setError(key as keyof SpareFormValues, { message: value.join(", ") });
          }
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="partNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Part Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SP-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 5HP Electric Motor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Shelf A1, Bin B3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton className="w-full" pendingText={sparePart ? "Updating..." : "Creating..."}>
          {sparePart ? "Update Spare Part" : "Add Spare Part"}
        </SubmitButton>
      </form>
    </Form>
  );
}
