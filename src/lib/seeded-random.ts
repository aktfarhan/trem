// Random number from 0 to 1, and the position for the next one
export interface RandomDraw {
    value: number;
    position: number;
}

// Number of values a 32-bit integer can hold
const UINT32_RANGE = 2 ** 32;

// Mulberry32 step size, an odd number so every position is visited before repeating
const POSITION_STEP = 0x6d2b79f5;

/**
 * Draws the next random number in a seeded sequence.
 *
 * @param position - Where the sequence is.
 * @returns Number from 0 to 1, and the position for the next one.
 */
export function drawRandom(position: number): RandomDraw {
    // Step to the next position
    const nextPosition = (position + POSITION_STEP) % UINT32_RANGE;

    // Mulberry32: scramble the bits so nearby positions give unrelated numbers
    let bits = Math.imul(nextPosition ^ (nextPosition >>> 15), nextPosition | 1);
    bits ^= bits + Math.imul(bits ^ (bits >>> 7), bits | 61);
    bits ^= bits >>> 14;

    // Convert to an unsigned 32-bit integer, and scale to 0 to 1
    return { value: (bits >>> 0) / UINT32_RANGE, position: nextPosition };
}
