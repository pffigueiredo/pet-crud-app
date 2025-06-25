
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { petsTable } from '../db/schema';
import { type CreatePetInput, type UpdatePetInput } from '../schema';
import { updatePet } from '../handlers/update_pet';
import { eq } from 'drizzle-orm';

// Test data
const testPet: CreatePetInput = {
  name: 'Buddy',
  type: 'Dog',
  age: 3
};

describe('updatePet', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a pet with all fields', async () => {
    // Create a pet first
    const createdPet = await db.insert(petsTable)
      .values(testPet)
      .returning()
      .execute();

    const petId = createdPet[0].id;

    const updateInput: UpdatePetInput = {
      id: petId,
      name: 'Max',
      type: 'Golden Retriever',
      age: 5
    };

    const result = await updatePet(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(petId);
    expect(result!.name).toEqual('Max');
    expect(result!.type).toEqual('Golden Retriever');
    expect(result!.age).toEqual(5);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update a pet with partial fields', async () => {
    // Create a pet first
    const createdPet = await db.insert(petsTable)
      .values(testPet)
      .returning()
      .execute();

    const petId = createdPet[0].id;

    const updateInput: UpdatePetInput = {
      id: petId,
      name: 'Charlie'
    };

    const result = await updatePet(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(petId);
    expect(result!.name).toEqual('Charlie');
    expect(result!.type).toEqual('Dog'); // Should remain unchanged
    expect(result!.age).toEqual(3); // Should remain unchanged
  });

  it('should update pet in database', async () => {
    // Create a pet first
    const createdPet = await db.insert(petsTable)
      .values(testPet)
      .returning()
      .execute();

    const petId = createdPet[0].id;

    const updateInput: UpdatePetInput = {
      id: petId,
      age: 4
    };

    await updatePet(updateInput);

    // Verify the update was saved to database
    const pets = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, petId))
      .execute();

    expect(pets).toHaveLength(1);
    expect(pets[0].name).toEqual('Buddy'); // Unchanged
    expect(pets[0].type).toEqual('Dog'); // Unchanged
    expect(pets[0].age).toEqual(4); // Updated
  });

  it('should return null for non-existent pet', async () => {
    const updateInput: UpdatePetInput = {
      id: 99999,
      name: 'NonExistent'
    };

    const result = await updatePet(updateInput);

    expect(result).toBeNull();
  });

  it('should return existing pet when no fields to update', async () => {
    // Create a pet first
    const createdPet = await db.insert(petsTable)
      .values(testPet)
      .returning()
      .execute();

    const petId = createdPet[0].id;

    const updateInput: UpdatePetInput = {
      id: petId
    };

    const result = await updatePet(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(petId);
    expect(result!.name).toEqual('Buddy');
    expect(result!.type).toEqual('Dog');
    expect(result!.age).toEqual(3);
  });
});
