import { describe, expect, test } from 'vitest';
import { createSeededRandom, type Random } from '../seeded-random';

// Seed shared by every test
const SEED = 42;

// How many numbers each test draws
const SAMPLE_SIZE = 5;

// How many numbers the range test draws
const LARGE_SAMPLE_SIZE = 1000;

// Draw count numbers from a generator
function drawNumbers(random: Random, count: number) {
    return Array.from({ length: count }, () => random());
}

describe('createSeededRandom', () => {
    test('same seed gives the same numbers', () => {
        // Create two generators from the same seed
        const first = createSeededRandom(SEED);
        const second = createSeededRandom(SEED);

        // Draw the same amount from both
        const firstNumbers = drawNumbers(first, SAMPLE_SIZE);
        const secondNumbers = drawNumbers(second, SAMPLE_SIZE);

        // Compare
        expect(firstNumbers).toEqual(secondNumbers);
    });

    test('different seeds give different numbers', () => {
        // Create two generators from different seeds
        const first = createSeededRandom(SEED);
        const second = createSeededRandom(SEED + 1);

        // Draw the same amount from both
        const firstNumbers = drawNumbers(first, SAMPLE_SIZE);
        const secondNumbers = drawNumbers(second, SAMPLE_SIZE);

        // Compare
        expect(firstNumbers).not.toEqual(secondNumbers);
    });

    test('every number is at least 0 and below 1', () => {
        // Create a generator and draw a large batch
        const random = createSeededRandom(SEED);
        const randomNumbers = drawNumbers(random, LARGE_SAMPLE_SIZE);

        // Check each number is in the range
        for (const randomNumber of randomNumbers) {
            expect(randomNumber).toBeGreaterThanOrEqual(0);
            expect(randomNumber).toBeLessThan(1);
        }
    });
});
