// Colors the board is drawn with
export interface BoardColors {
    eye: string;
    grid: string;
    leaf: string;
    apple: string;
    board: string;
    pupil: string;
    snake: string;
    snakeHead: string;
}

/**
 * Reads the board colors from the theme in index.css.
 *
 * @returns Current color for each part of the board.
 */
export function readBoardColors(): BoardColors {
    // Theme values set on the page root
    const style = getComputedStyle(document.documentElement);

    // Read one theme color by name
    const read = (name: string) => style.getPropertyValue(`--color-${name}`).trim();

    return {
        eye: read('eye'),
        grid: read('grid'),
        leaf: read('leaf'),
        apple: read('apple'),
        board: read('board'),
        pupil: read('pupil'),
        snake: read('snake'),
        snakeHead: read('snake-head'),
    };
}
