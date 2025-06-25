
import { db } from '../db';
import { petsTable } from '../db/schema';
import { type Pet } from '../schema';
import { desc } from 'drizzle-orm';

export const getPets = async (): Promise<Pet[]> => {
  try {
    const results = await db.select()
      .from(petsTable)
      .orderBy(desc(petsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch pets:', error);
    throw error;
  }
};
