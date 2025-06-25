
import { db } from '../db';
import { petsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetPetInput, type Pet } from '../schema';

export const getPet = async (input: GetPetInput): Promise<Pet | null> => {
  try {
    const result = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Pet retrieval failed:', error);
    throw error;
  }
};
