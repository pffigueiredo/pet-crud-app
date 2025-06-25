
import { z } from 'zod';

// Pet schema
export const petSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  age: z.number().int(),
  created_at: z.coerce.date()
});

export type Pet = z.infer<typeof petSchema>;

// Input schema for creating pets
export const createPetInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  age: z.number().int().nonnegative("Age must be a non-negative integer")
});

export type CreatePetInput = z.infer<typeof createPetInputSchema>;

// Input schema for updating pets
export const updatePetInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").optional(),
  type: z.string().min(1, "Type is required").optional(),
  age: z.number().int().nonnegative("Age must be a non-negative integer").optional()
});

export type UpdatePetInput = z.infer<typeof updatePetInputSchema>;

// Input schema for getting a pet by ID
export const getPetInputSchema = z.object({
  id: z.number()
});

export type GetPetInput = z.infer<typeof getPetInputSchema>;

// Input schema for deleting a pet
export const deletePetInputSchema = z.object({
  id: z.number()
});

export type DeletePetInput = z.infer<typeof deletePetInputSchema>;
