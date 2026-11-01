import { isInsideGrid, isSameCell, moveCell } from './grid';
import { turn, type Direction, type SnakeAction } from './direction';
import type { SnakeState } from './game';

// Name of a group of signals
export type SignalGroupId = 'danger' | 'facing' | 'apple';

// One group of signals
interface SignalGroup {
    names: string[];
    read: (state: SnakeState) => number[];
}

// Value of a signal that is on
const SIGNAL_ON = 1;

// Value of a signal that is off
const SIGNAL_OFF = 0;

// Moves in the order the danger signals use
const MOVES: SnakeAction[] = ['straight', 'left', 'right'];

// Directions in the order the facing and apple signals use
const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

// Every group in the fixed order its signals appear
const GROUP_ORDER: SignalGroupId[] = ['danger', 'facing', 'apple'];

// Groups every snake starts with
export const BASIC_GROUPS: SignalGroupId[] = ['danger', 'facing', 'apple'];

// Each group's labels and how to read its signals
const SIGNAL_GROUPS: Record<SignalGroupId, SignalGroup> = {
    apple: {
        names: DIRECTIONS.map((direction) => `Apple ${direction}`),
        read: readApple,
    },
    danger: {
        names: MOVES.map((move) => `Danger ${move}`),
        read: readDanger,
    },
    facing: {
        names: DIRECTIONS.map((direction) => `Facing ${direction}`),
        read: readFacing,
    },
};

// Turn a yes or no into a signal value
function toSignal(isOn: boolean): number {
    return isOn ? SIGNAL_ON : SIGNAL_OFF;
}

// Read whether each move would end the game
function readDanger(state: SnakeState): number[] {
    // Body without the tail
    const blockingBody = state.body.slice(0, -1);

    // Check each move in order
    return MOVES.map((move) => {
        // Find the cell the head would move into
        const cell = moveCell(state.body[0], turn(state.direction, move));

        // Danger when that cell is off the grid or on the body
        const isOffGrid = !isInsideGrid(cell, state.gridSize);
        const isOnBody = blockingBody.some((segment) => isSameCell(segment, cell));
        return toSignal(isOffGrid || isOnBody);
    });
}

// Read which way the snake is moving
function readFacing(state: SnakeState): number[] {
    return DIRECTIONS.map((direction) => toSignal(direction === state.direction));
}

// Read which way the apple is from the head
function readApple(state: SnakeState): number[] {
    // Head the apple is measured from
    const head = state.body[0];

    // Whether the apple lies that way from the head
    const isAppleByDirection: Record<Direction, boolean> = {
        up: state.apple.y < head.y,
        down: state.apple.y > head.y,
        left: state.apple.x < head.x,
        right: state.apple.x > head.x,
    };

    // Return one signal per direction
    return DIRECTIONS.map((direction) => toSignal(isAppleByDirection[direction]));
}

// Put the switched on groups in their fixed order
function orderGroups(groups: SignalGroupId[]): SignalGroupId[] {
    const groupSet = new Set(groups);
    return GROUP_ORDER.filter((id) => groupSet.has(id));
}

/**
 * Reads the signals the model sees before a move.
 *
 * @param state - Game to read.
 * @param groups - Signal groups that are switched on.
 * @returns One number per signal, 1 for on and 0 for off.
 */
export function observeSnakeGame(state: SnakeState, groups: SignalGroupId[]): number[] {
    return orderGroups(groups).flatMap((id) => SIGNAL_GROUPS[id].read(state));
}

/**
 * Lists a label for each signal.
 *
 * @param groups - Signal groups that are switched on.
 * @returns One label per signal.
 */
export function listSignalNames(groups: SignalGroupId[]): string[] {
    return orderGroups(groups).flatMap((id) => SIGNAL_GROUPS[id].names);
}
