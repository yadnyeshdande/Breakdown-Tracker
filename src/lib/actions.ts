
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { 
  addBreakdownPost, 
  addSparePart, 
  deleteSparePart, 
  getSparePartById, 
  updateSparePart,
  getBreakdownPostById,
  deleteBreakdownPost
} from "./data"; 
import type { BreakdownPostInput, SparePartInput } from "./types";
import { breakdownCategories } from "./types";
import { redirect } from 'next/navigation';

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
    revalidatePath("/breakdowns/create"); 
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
  sparesConsumed: z.string().optional(), 
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
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create breakdown post. Validation errors.",
    };
  }
  
  const breakdownInput: BreakdownPostInput = {
    ...validatedFields.data,
    sparesConsumed: parsedSpares, 
  };

  try {
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
    revalidatePath("/inventory"); 
    revalidatePath("/dashboard");
    revalidatePath("/kpi");
    revalidatePath("/breakdowns/create"); 
    return { message: "Breakdown post created successfully." };
  } catch (error) {
    console.error("CreateBreakdownPostAction Error:", error);
    return { message: "Database Error: Failed to create breakdown post." };
  }
}

export async function deleteBreakdownPostAction(breakdownId: string) {
  try {
    const breakdownToDelete = await getBreakdownPostById(breakdownId);
    if (!breakdownToDelete) {
      return { success: false, message: "Breakdown post not found." };
    }

    // Return consumed spares to inventory
    if (breakdownToDelete.sparesConsumed && breakdownToDelete.sparesConsumed.length > 0) {
      for (const consumed of breakdownToDelete.sparesConsumed) {
        const spare = await getSparePartById(consumed.sparePartId);
        if (spare) {
          const newQuantity = spare.quantity + consumed.quantityConsumed;
          await updateSparePart(spare.id, { quantity: newQuantity });
        } else {
          console.warn(`While deleting breakdown ${breakdownId}, tried to return spare ${consumed.sparePartId} which was not found.`);
        }
      }
    }

    const success = await deleteBreakdownPost(breakdownId);
    if (!success) {
      return { success: false, message: "Database Error: Failed to delete breakdown post." };
    }

    revalidatePath("/breakdowns");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/kpi");
    // No direct revalidate for /breakdowns/[id] as it will be gone.
  } catch (error) {
    console.error("DeleteBreakdownPostAction Error:", error);
    return { success: false, message: "An unexpected error occurred while deleting the breakdown post." };
  }
  // Redirect after successful deletion (or if post not found initially for deletion)
  // This needs to be handled by the calling component or by throwing redirect error
  // For actions, redirecting directly is preferred.
  redirect('/breakdowns'); 
  //The return below will not be reached due to redirect, but good for type consistency if redirect was conditional
  // return { success: true, message: "Breakdown post deleted successfully." }; 
}


// Simplified Auth Actions (No real security, for trial only)
const UserSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."), // No real complexity check for trial
  fullName: z.string().min(1, "Full name is required.").optional(),
});

let users: Array<Omit<UserInput, 'password'> & {id: string, passwordHash: string}> = []; // In-memory store, no hashing for trial
let simpleUsers: Array<UserInput & {id: string}> = []; // Stores plain password for trial

async function findUserByEmail(email: string): Promise<(UserInput & {id: string}) | undefined> {
  // In a real app, this would query a database
  return simpleUsers.find(user => user.email === email);
}

async function createUser(userInput: UserInput): Promise<UserInput & {id: string}> {
  // In a real app, this would insert into a database and hash the password
  const newUser = { ...userInput, id: crypto.randomUUID() };
  simpleUsers.push(newUser);
  return newUser;
}


export async function simpleSignUpAction(formData: FormData) {
  const validatedFields = UserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
      success: false,
    };
  }

  const { email, password, fullName } = validatedFields.data;
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return { errors: { email: ['Email already in use.'] }, message: 'User already exists.', success: false };
  }

  await createUser({ email, password, fullName });
  return { message: 'Sign up successful! You can now log in.', success: true };
}

export async function simpleLoginAction(formData: FormData) {
  const validatedFields = UserSchema.pick({ email: true, password: true }).safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
      success: false,
      userEmail: null,
    };
  }

  const { email, password } = validatedFields.data;
  const user = await findUserByEmail(email);

  if (!user || user.password !== password) { // Plain text comparison for trial
    return { message: 'Invalid email or password.', success: false, userEmail: null };
  }

  return { message: 'Login successful!', success: true, userEmail: user.email };
}
