import { createSnakeGame } from '../game';
import { SNAKE_ACTIONS } from '../direction';
import { describe, expect, test } from 'vitest';
import { createNetwork } from '../../../lib/network';
import { BASIC_GROUPS, listSignalNames } from '../observe';
import { chooseModelAction, createSnakeModel, type SnakeModel } from '../model';

// Seed shared by every model test
const SEED = 42;

// Middle neurons in the model
const TINY_HIDDEN_SIZE = 8;

// Signals the basic groups give
const SIGNAL_COUNT = listSignalNames(BASIC_GROUPS).length;

// Scores a broken network gives
const TOO_FEW_SCORES = 2;

// Make the model with every weight and bias at 0
function makeZeroModel(): SnakeModel {
    const { model } = createSnakeModel(BASIC_GROUPS, TINY_HIDDEN_SIZE, SEED);
    model.network.weights.fill(0);
    return model;
}

describe('createSnakeModel', () => {
    test('has an input per signal and a score per move', () => {
        // Create the model
        const { model } = createSnakeModel(BASIC_GROUPS, TINY_HIDDEN_SIZE, SEED);

        // Check its shape and the groups it reads
        expect(model.network.layerSizes).toEqual([
            SIGNAL_COUNT,
            TINY_HIDDEN_SIZE,
            SNAKE_ACTIONS.length,
        ]);
        expect(model.groups).toEqual(BASIC_GROUPS);
    });
});

describe('chooseModelAction', () => {
    test('picks the move with the highest score', () => {
        // Raise the last number
        const model = makeZeroModel();
        model.network.weights[model.network.weights.length - 1] = 1;

        // Check it turns right
        expect(chooseModelAction(createSnakeGame(SEED), model)).toBe('right');
    });

    test('goes straight when every score ties', () => {
        // Score every move 0
        const model = makeZeroModel();

        // Check it picks the first move
        expect(chooseModelAction(createSnakeGame(SEED), model)).toBe('straight');
    });

    test('refuses a network that does not score every move', () => {
        // Wire the signals to only two scores
        const { network } = createNetwork([SIGNAL_COUNT, TOO_FEW_SCORES], SEED);
        const model = { groups: BASIC_GROUPS, network };

        // Check it throws
        expect(() => chooseModelAction(createSnakeGame(SEED), model)).toThrow(
            'Snake model must give 3 scores, got 2',
        );
    });
});
