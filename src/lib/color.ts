// Red, green and blue parts of a color
export interface RgbColor {
    red: number;
    green: number;
    blue: number;
}

// Where each part's two hex digits start
const PART_START = { red: 1, green: 3, blue: 5 } as const;

// Hex digits in each part
const PART_LENGTH = 2;

/**
 * Reads a "#rrggbb" color into its parts.
 *
 * @param hex - Color written as "#rrggbb".
 * @returns Each part as a number from 0 to 255.
 */
export function parseHexColor(hex: string): RgbColor {
    // Read the two hex digits of one part
    const readPart = (start: number) => parseInt(hex.slice(start, start + PART_LENGTH), 16);

    return {
        red: readPart(PART_START.red),
        green: readPart(PART_START.green),
        blue: readPart(PART_START.blue),
    };
}

/**
 * Mixes two colors.
 *
 * @param from - Color at amount 0.
 * @param to - Color at amount 1.
 * @param amount - How far to move toward the second color.
 * @returns Mixed color as a CSS string.
 */
export function mixColors(from: RgbColor, to: RgbColor, amount: number): string {
    // Move one part toward the second color
    const mixPart = (start: number, end: number) => Math.round(start + (end - start) * amount);

    const red = mixPart(from.red, to.red);
    const green = mixPart(from.green, to.green);
    const blue = mixPart(from.blue, to.blue);
    return `rgb(${red}, ${green}, ${blue})`;
}
