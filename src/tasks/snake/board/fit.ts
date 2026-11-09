// Board size, and the width of the wrap
export interface BoardFit {
    boardSize: number;
    wrapWidth: number;
}

// Largest board side
export const MAX_BOARD_SIZE = 640;

// Narrowest the wrap gets
export const MIN_WRAP_WIDTH = 580;

/**
 * Fits a square board into a space.
 *
 * @param width - Width of the space.
 * @param height - Height of the space.
 * @param reservedHeight - Height the lines above and below the board take.
 * @returns Board side, and the width of the wrap around it.
 */
export function fitBoard(width: number, height: number, reservedHeight: number): BoardFit {
    // Take the smallest of the width and height left over
    const largestSize = Math.min(width, height - reservedHeight, MAX_BOARD_SIZE);
    const boardSize = Math.max(0, Math.floor(largestSize));

    // Widen the wrap for the buttons
    const wrapWidth = Math.min(width, Math.max(MIN_WRAP_WIDTH, boardSize));

    return { boardSize, wrapWidth };
}
