// The way the snake is facing
export type Direction = 'up' | 'down' | 'left' | 'right';

// Move picked by the model
export type SnakeAction = 'straight' | 'left' | 'right';

// New direction for each current direction and action
const TURN_MAP: Record<Direction, Record<SnakeAction, Direction>> = {
    up: { left: 'left', right: 'right', straight: 'up' },
    down: { left: 'right', right: 'left', straight: 'down' },
    left: { left: 'down', right: 'up', straight: 'left' },
    right: { left: 'up', right: 'down', straight: 'right' },
};

/**
 * Returns the direction the snake faces after an action.
 *
 * @param direction - Way the snake is facing now.
 * @param action - Move picked by the model.
 * @returns New direction.
 */
export function turn(direction: Direction, action: SnakeAction): Direction {
    return TURN_MAP[direction][action];
}
