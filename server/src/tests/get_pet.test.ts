
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { petsTable } from '../db/schema';
import { type GetPetInput } from '../schema';
import { getPet } from '../handlers/get_pet';

describe('getPet', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a pet when it exists', async () => {
    // Create a test pet
    const insertResult = await db.insert(petsTable)
      .values({
        name: 'Buddy',
        type: 'dog',
        age: 3
      })
      .returning()
      .execute();

    const createdPet = insertResult[0];
    
    const input: GetPetInput = {
      id: createdPet.id
    };

    const result = await getPet(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdPet.id);
    expect(result!.name).toEqual('Buddy');
    expect(result!.type).toEqual('dog');
    expect(result!.age).toEqual(3);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when pet does not exist', async () => {
    const input: GetPetInput = {
      id: 999
    };

    const result = await getPet(input);

    expect(result).toBeNull();
  });

  it('should return the correct pet when multiple pets exist', async () => {
    // Create multiple test pets
    await db.insert(petsTable)
      .values([
        { name: 'Buddy', type: 'dog', age: 3 },
        { name: 'Whiskers', type: 'cat', age: 2 },
        { name: 'Goldie', type: 'fish', age: 1 }
      ])
      .execute();

    // Get all pets to find a specific ID
    const allPets = await db.select()
      .from(petsTable)
      .execute();

    const targetPet = allPets.find(pet => pet.name === 'Whiskers');
    expect(targetPet).toBeDefined();

    const input: GetPetInput = {
      id: targetPet!.id
    };

    const result = await getPet(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(targetPet!.id);
    expect(result!.name).toEqual('Whiskers');
    expect(result!.type).toEqual('cat');
    expect(result!.age).toEqual(2);
  });
});
