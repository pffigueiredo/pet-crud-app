
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { petsTable } from '../db/schema';
import { getPets } from '../handlers/get_pets';

describe('getPets', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no pets exist', async () => {
    const result = await getPets();
    expect(result).toEqual([]);
  });

  it('should return all pets ordered by creation date (newest first)', async () => {
    // Create test pets with small delay to ensure different timestamps
    await db.insert(petsTable)
      .values({
        name: 'Fluffy',
        type: 'Cat',
        age: 3
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(petsTable)
      .values({
        name: 'Rex',
        type: 'Dog',
        age: 5
      })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(petsTable)
      .values({
        name: 'Tweety',
        type: 'Bird',
        age: 1
      })
      .execute();

    const result = await getPets();

    expect(result).toHaveLength(3);
    
    // Verify all pets are returned with correct data
    const petNames = result.map(pet => pet.name);
    expect(petNames).toContain('Fluffy');
    expect(petNames).toContain('Rex');
    expect(petNames).toContain('Tweety');

    // Verify ordering by creation date (newest first)
    expect(result[0].name).toEqual('Tweety'); // Last created
    expect(result[1].name).toEqual('Rex');    // Second created
    expect(result[2].name).toEqual('Fluffy'); // First created

    // Verify all required fields are present
    result.forEach(pet => {
      expect(pet.id).toBeDefined();
      expect(pet.name).toBeDefined();
      expect(pet.type).toBeDefined();
      expect(pet.age).toBeDefined();
      expect(pet.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return pets with correct field types', async () => {
    await db.insert(petsTable)
      .values({
        name: 'Test Pet',
        type: 'Test Type',
        age: 2
      })
      .execute();

    const result = await getPets();

    expect(result).toHaveLength(1);
    const pet = result[0];

    expect(typeof pet.id).toBe('number');
    expect(typeof pet.name).toBe('string');
    expect(typeof pet.type).toBe('string');
    expect(typeof pet.age).toBe('number');
    expect(pet.created_at).toBeInstanceOf(Date);
  });
});
