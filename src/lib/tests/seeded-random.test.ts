import { drawRandom, pickRandomSeed } from '../seeded-random';
import { afterEach, describe, expect, test, vi } from 'vitest';

// Seed shared by every test
const SEED = 42;

// How many numbers each test draws
const SAMPLE_SIZE = 5;

// How many numbers the range test draws
const LARGE_SAMPLE_SIZE = 1000;

// Largest number Math.random can return
const LARGEST_RANDOM = 1 - Number.EPSILON / 2;

// Largest seed that fits in 32 bits
const LAST_SEED = 4_294_967_295;

// Random number that lands between two whole seeds
const MIDDLE_RANDOM = 0.123456789;

// First three Mulberry32 numbers for SEED
const SEED_FIRST_NUMBERS = [0.6011037519201636, 0.44829055899754167, 0.8524657934904099];

// Draw count numbers in a row
function drawNumbers(seed: number, count: number) {
    // Numbers drawn so far, and where the sequence is now
    const numbers: number[] = [];
    let position = seed;

    // Draw each number from the position of the last draw
    for (let i = 0; i < count; i++) {
        const draw = drawRandom(position);
        numbers.push(draw.value);
        position = draw.position;
    }

    return numbers;
}

describe('drawRandom', () => {
    test('same position gives the same draw', () => {
        // Draw twice from the same position
        const first = drawRandom(SEED);
        const second = drawRandom(SEED);

        // Compare
        expect(second).toEqual(first);
    });

    test('different seeds give different numbers', () => {
        // Draw the same amount from two seeds
        const firstNumbers = drawNumbers(SEED, SAMPLE_SIZE);
        const secondNumbers = drawNumbers(SEED + 1, SAMPLE_SIZE);

        // Compare
        expect(firstNumbers).not.toEqual(secondNumbers);
    });

    test('every number is at least 0 and below 1', () => {
        // Draw a large batch
        const randomNumbers = drawNumbers(SEED, LARGE_SAMPLE_SIZE);

        // Check each number is in the range
        for (const randomNumber of randomNumbers) {
            expect(randomNumber).toBeGreaterThanOrEqual(0);
            expect(randomNumber).toBeLessThan(1);
        }
    });

    test('gives the known numbers for a seed', () => {
        // Draw the first numbers for the shared seed
        const numbers = drawNumbers(SEED, SEED_FIRST_NUMBERS.length);

        // Compare with the recorded ones
        expect(numbers).toEqual(SEED_FIRST_NUMBERS);
    });
});

describe('pickRandomSeed', () => {
    // Put Math.random back after each test
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('turns the lowest and highest random numbers into the first and last seed', () => {
        // Pick with the lowest and highest numbers
        vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(LARGEST_RANDOM);
        const seeds = [pickRandomSeed(), pickRandomSeed()];

        // Check both ends of the 32-bit range
        expect(seeds).toEqual([0, LAST_SEED]);
    });

    test('gives a whole number', () => {
        // Pick with a random number between two seeds
        vi.spyOn(Math, 'random').mockReturnValue(MIDDLE_RANDOM);
        const seed = pickRandomSeed();

        // Check it was rounded down to a whole seed
        expect(Number.isInteger(seed)).toBe(true);
    });
});
