"use client";

import React, { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { breakdownCategories, type SparePart } from "@/lib/types";
import { createBreakdownPostAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "@/components/SubmitButton";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";

const formSchema = z.object({
  lossTime: z.coerce.number().int().min(0, "Loss time must be a non-negative integer"),
  line: z.string().min(1, "Line is required"),
  machine: z.string().min(1, "Machine is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(breakdownCategories, { required_error: "Category is required" }),
  sparesConsumed: z.array(
    z.object({
      sparePartId: z.string().min(1, "Spare part must be selected"),
      quantityConsumed: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    })
  ).optional(),
});

type BreakdownFormValues = z.infer<typeof formSchema>;

interface BreakdownFormProps {
  availableSpares: SparePart[];
}

export function BreakdownForm({ availableSpares }: BreakdownFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<BreakdownFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lossTime: 0,
      line: "",
      machine: "",
      description: "",
      category: undefined,
      sparesConsumed: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sparesConsumed",
  });

  async function onSubmit(data: BreakdownFormValues) {
    const formData = new FormData();
    formData.append("lossTime", String(data.lossTime));
    formData.append("line", data.line);
    formData.append("machine", data.machine);
    formData.append("description", data.description);
    formData.append("category", data.category);
    if (data.sparesConsumed && data.sparesConsumed.length > 0) {
      formData.append("sparesConsumed", JSON.stringify(data.sparesConsumed));
    }
    
    const result = await createBreakdownPostAction(formData);

    if (result.message.includes("success")) {
      toast({
        title: "Success",
        description: result.message,
      });
      form.reset();
      formRef.current?.reset(); 
      router.push("/breakdowns");
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      if (result.errors) {
         Object.entries(result.errors).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            if (key === 'sparesConsumed' && typeof value[0] === 'string') {
               // For array-level error on sparesConsumed
               form.setError('sparesConsumed', { message: value.join(", ") });
            } else {
              form.setError(key as keyof BreakdownFormValues, { message: value.join(", ") });
            }
          }
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="lossTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loss Time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 60" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {breakdownCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="line"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Line</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., P122, P141, PTCED, BTCL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="machine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., EMS,Robot" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description of Breakdown</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue, symptoms, and actions taken."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Spares Consumed</FormLabel>
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-end gap-4 mt-2 p-4 border rounded-md">
              <FormField
                control={form.control}
                name={`sparesConsumed.${index}.sparePartId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Spare Part</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select spare part" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSpares.map((spare) => (
                          <SelectItem key={spare.id} value={spare.id} disabled={spare.quantity <= 0}>
                            {spare.partNumber} - {spare.description} (Qty: {spare.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`sparesConsumed.${index}.quantityConsumed`}
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel className="text-xs">Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Qty" {...field} min="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} aria-label="Remove spare part">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
           {form.formState.errors.sparesConsumed && !form.formState.errors.sparesConsumed.root && !Array.isArray(form.formState.errors.sparesConsumed) && (
            <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.sparesConsumed.message}</p>
           )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => append({ sparePartId: "", quantityConsumed: 1 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Spare Consumed
          </Button>
        </div>

        <SubmitButton className="w-full sm:w-auto" pendingText="Submitting...">
          Create Breakdown Post
        </SubmitButton>
      </form>
    </Form>
  );
}
