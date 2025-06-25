
import { db } from '../db';
import { petsTable } from '../db/schema';
import { type CreatePetInput, type Pet } from '../schema';

export const createPet = async (input: CreatePetInput): Promise<Pet> => {
  try {
    // Insert pet record
    const result = await db.insert(petsTable)
      .values({
        name: input.name,
        type: input.type,
        age: input.age
      })
      .returning()
      .execute();

    // Return the created pet
    const pet = result[0];
    return pet;
  } catch (error) {
    console.error('Pet creation failed:', error);
    throw error;
  }
};
