
import { db } from '../db';
import { petsTable } from '../db/schema';
import { type UpdatePetInput, type Pet } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePet = async (input: UpdatePetInput): Promise<Pet | null> => {
  try {
    // First check if the pet exists
    const existingPet = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, input.id))
      .execute();

    if (existingPet.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof petsTable.$inferInsert> = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    
    if (input.age !== undefined) {
      updateData.age = input.age;
    }

    // If no fields to update, return the existing pet
    if (Object.keys(updateData).length === 0) {
      return existingPet[0];
    }

    // Update the pet record
    const result = await db.update(petsTable)
      .set(updateData)
      .where(eq(petsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Pet update failed:', error);
    throw error;
  }
};
