"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addBreakdownPost, addSparePart, deleteSparePart, getSparePartById, updateSparePart } from "./data"; // Will use MongoDB versions
import type { BreakdownPostInput, SparePartInput } from "./types";
import { breakdownCategories } from "./types";

const sparePartSchema = z.object({
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  location: z.string().min(1, "Location is required"),
});

export async function createSparePartAction(formData: FormData) {
  const validatedFields = sparePartSchema.safeParse({
    partNumber: formData.get("partNumber"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    location: formData.get("location"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create spare part. Validation errors.",
    };
  }

  try {
    await addSparePart(validatedFields.data as SparePartInput);
    revalidatePath("/inventory");
    revalidatePath("/breakdowns/create"); // Revalidate create breakdown page to update spare list
    return { message: "Spare part created successfully." };
  } catch (error) {
    console.error("CreateSparePartAction Error:", error);
    return { message: "Database Error: Failed to create spare part." };
  }
}

export async function updateSparePartAction(id: string, formData: FormData) {
  const validatedFields = sparePartSchema.safeParse({
    partNumber: formData.get("partNumber"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    location: formData.get("location"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to update spare part. Validation errors.",
    };
  }

  try {
    const result = await updateSparePart(id, validatedFields.data as SparePartInput);
    if (!result) {
        return { message: "Database Error: Failed to update spare part. Part not found or update failed." };
    }
    revalidatePath("/inventory");
    revalidatePath("/breakdowns/create");
    return { message: "Spare part updated successfully." };
  } catch (error) {
    console.error("UpdateSparePartAction Error:", error);
    return { message: "Database Error: Failed to update spare part." };
  }
}

export async function deleteSparePartAction(id: string) {
  try {
    const success = await deleteSparePart(id);
     if (!success) {
        return { message: "Database Error: Failed to delete spare part. Part not found or delete failed." };
    }
    revalidatePath("/inventory");
    revalidatePath("/breakdowns/create");
    return { message: "Spare part deleted successfully." };
  } catch (error) {
    console.error("DeleteSparePartAction Error:", error);
    return { message: "Database Error: Failed to delete spare part." };
  }
}

const breakdownPostSchema = z.object({
  lossTime: z.coerce.number().int().min(0, "Loss time must be non-negative"),
  line: z.string().min(1, "Line is required"),
  machine: z.string().min(1, "Machine is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(breakdownCategories, {
    errorMap: () => ({ message: "Invalid category selected." }),
  }),
  sparesConsumed: z.string().optional(), // JSON string of [{ sparePartId: string, quantityConsumed: number }]
});

export async function createBreakdownPostAction(formData: FormData) {
  const rawSparesConsumed = formData.get("sparesConsumed") as string;
  let parsedSpares: Array<{ sparePartId: string; quantityConsumed: number }> = [];
  if (rawSparesConsumed) {
    try {
      parsedSpares = JSON.parse(rawSparesConsumed);
      if (!Array.isArray(parsedSpares) || !parsedSpares.every(s => typeof s.sparePartId === 'string' && typeof s.quantityConsumed === 'number' && s.quantityConsumed > 0)) {
        throw new Error("Invalid spares format");
      }
    } catch (error) {
      return {
        errors: { sparesConsumed: ["Invalid format for consumed spares."] },
        message: "Failed to create breakdown post due to spares format.",
      };
    }
  }
  
  const validatedFields = breakdownPostSchema.safeParse({
    lossTime: formData.get("lossTime"),
    line: formData.get("line"),
    machine: formData.get("machine"),
    description: formData.get("description"),
    category: formData.get("category"),
    // sparesConsumed is handled separately as it's JSON string
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create breakdown post. Validation errors.",
    };
  }
  
  const breakdownInput: BreakdownPostInput = {
    ...validatedFields.data,
    sparesConsumed: parsedSpares, // Use the parsed array
  };

  try {
    // Reduce spare quantities
    if (breakdownInput.sparesConsumed && breakdownInput.sparesConsumed.length > 0) {
        for (const consumed of breakdownInput.sparesConsumed) {
          const spare = await getSparePartById(consumed.sparePartId);
          if (spare) {
            const newQuantity = spare.quantity - consumed.quantityConsumed;
            if (newQuantity < 0) {
              return {
                errors: { sparesConsumed: [`Not enough stock for spare part ${spare.partNumber}. Available: ${spare.quantity}, Consumed: ${consumed.quantityConsumed}`] },
                message: "Inventory error: Insufficient stock.",
              };
            }
            // Update only the quantity
            const updateResult = await updateSparePart(spare.id, { quantity: newQuantity });
            if (!updateResult) {
                 return {
                    errors: { sparesConsumed: [`Failed to update stock for spare part ${spare.partNumber}.`] },
                    message: "Inventory error: Failed to update stock.",
                 };
            }
          } else {
             return {
                errors: { sparesConsumed: [`Spare part with ID ${consumed.sparePartId} not found.`] },
                message: "Inventory error: Spare part not found.",
              };
          }
        }
    }

    await addBreakdownPost(breakdownInput);
    revalidatePath("/breakdowns");
    revalidatePath("/inventory"); // Revalidate inventory due to stock changes
    revalidatePath("/dashboard");
    revalidatePath("/breakdowns/create"); // Revalidate to reflect stock changes in the form
    return { message: "Breakdown post created successfully." };
  } catch (error) {
    console.error("CreateBreakdownPostAction Error:", error);
    // Check if it's a known error type from Zod or DB if more specific handling is needed
    return { message: "Database Error: Failed to create breakdown post." };
  }
}
