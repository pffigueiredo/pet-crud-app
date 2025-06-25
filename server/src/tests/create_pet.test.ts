
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { petsTable } from '../db/schema';
import { type CreatePetInput } from '../schema';
import { createPet } from '../handlers/create_pet';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreatePetInput = {
  name: 'Buddy',
  type: 'Dog',
  age: 3
};

describe('createPet', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a pet', async () => {
    const result = await createPet(testInput);

    // Basic field validation
    expect(result.name).toEqual('Buddy');
    expect(result.type).toEqual('Dog');
    expect(result.age).toEqual(3);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save pet to database', async () => {
    const result = await createPet(testInput);

    // Query using proper drizzle syntax
    const pets = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, result.id))
      .execute();

    expect(pets).toHaveLength(1);
    expect(pets[0].name).toEqual('Buddy');
    expect(pets[0].type).toEqual('Dog');
    expect(pets[0].age).toEqual(3);
    expect(pets[0].created_at).toBeInstanceOf(Date);
  });

  it('should create pets with different types', async () => {
    const catInput: CreatePetInput = {
      name: 'Whiskers',
      type: 'Cat',
      age: 2
    };

    const result = await createPet(catInput);

    expect(result.name).toEqual('Whiskers');
    expect(result.type).toEqual('Cat');
    expect(result.age).toEqual(2);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify it's saved in database
    const pets = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, result.id))
      .execute();

    expect(pets).toHaveLength(1);
    expect(pets[0].type).toEqual('Cat');
  });

  it('should handle zero age correctly', async () => {
    const puppyInput: CreatePetInput = {
      name: 'Puppy',
      type: 'Dog',
      age: 0
    };

    const result = await createPet(puppyInput);

    expect(result.age).toEqual(0);
    expect(result.name).toEqual('Puppy');
    expect(result.id).toBeDefined();

    // Verify in database
    const pets = await db.select()
      .from(petsTable)
      .where(eq(petsTable.id, result.id))
      .execute();

    expect(pets[0].age).toEqual(0);
  });
});
