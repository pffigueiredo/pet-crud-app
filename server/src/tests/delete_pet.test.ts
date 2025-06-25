
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { petsTable } from '../db/schema';
import { type DeletePetInput } from '../schema';
import { deletePet } from '../handlers/delete_pet';
import { eq } from 'drizzle-orm';

describe('deletePet', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing pet', async () => {
    // Create a test pet first
    const createResult = await db.insert(petsTable)
      .values({
        name: 'Test Pet',
        type: 'Dog',
        age: 3
      })
      .returning()
      .execute();

    const petId = createResult[0].id;

    // Delete the pet
    const deleteInput: DeletePetInput = { id: petId };
    const result = await deletePet(deleteInput);

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify pet no longer exists in database
    const pets = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, petId))
      .execute();

    expect(pets).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent pet', async () => {
    const deleteInput: DeletePetInput = { id: 999 };
    const result = await deletePet(deleteInput);

    // Should return false since pet doesn't exist
    expect(result).toBe(false);
  });

  it('should not affect other pets when deleting one pet', async () => {
    // Create two test pets
    const createResults = await db.insert(petsTable)
      .values([
        { name: 'Pet 1', type: 'Cat', age: 2 },
        { name: 'Pet 2', type: 'Dog', age: 4 }
      ])
      .returning()
      .execute();

    const petId1 = createResults[0].id;
    const petId2 = createResults[1].id;

    // Delete only the first pet
    const deleteInput: DeletePetInput = { id: petId1 };
    const result = await deletePet(deleteInput);

    expect(result).toBe(true);

    // Verify first pet is deleted
    const deletedPets = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, petId1))
      .execute();

    expect(deletedPets).toHaveLength(0);

    // Verify second pet still exists
    const remainingPets = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, petId2))
      .execute();

    expect(remainingPets).toHaveLength(1);
    expect(remainingPets[0].name).toEqual('Pet 2');
  });
});
