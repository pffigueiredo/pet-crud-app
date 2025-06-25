
import { db } from '../db';
import { petsTable } from '../db/schema';
import { type DeletePetInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deletePet = async (input: DeletePetInput): Promise<boolean> => {
  try {
    // Delete the pet record
    const result = await db.delete(petsTable)
      .where(eq(petsTable.id, input.id))
      .returning()
      .execute();

    // Return true if a record was deleted, false if no record was found
    return result.length > 0;
  } catch (error) {
    console.error('Pet deletion failed:', error);
    throw error;
  }
};
