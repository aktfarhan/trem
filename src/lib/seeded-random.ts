// Function that returns the next random number from 0 to 1
export type Random = () => number;

// Number of values a 32-bit integer can hold
const UINT32_RANGE = 2 ** 32;

// Mulberry32 step size, an odd number so every state is visited before repeating
const STATE_STEP = 0x6d2b79f5;

/**
 * Creates a seeded random number generator.
 *
 * @param seed - Starting number that picks the sequence.
 * @returns A function that returns the next number from 0 to 1.
 */
export function createSeededRandom(seed: number): Random {
    // Current position in the sequence
    let state = seed;

    return () => {
        // Step to the next state
        state = (state + STATE_STEP) % UINT32_RANGE;

        // Mulberry32: scramble the bits so nearby states give unrelated numbers
        let bits = Math.imul(state ^ (state >>> 15), state | 1);
        bits ^= bits + Math.imul(bits ^ (bits >>> 7), bits | 61);
        bits ^= bits >>> 14;

        // Convert to an unsigned 32-bit integer, and scale to 0 to 1
        return (bits >>> 0) / UINT32_RANGE;
    };
}
