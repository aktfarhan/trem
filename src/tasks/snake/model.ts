import { SNAKE_ACTIONS, type SnakeAction } from './direction';
import { createNetwork, runNetwork, type Network } from '../../lib/network';
import { listSignalNames, observeSnakeGame, type SignalGroupId } from './observe';
import type { SnakeState } from './game';

// Network and the signal groups it reads
export interface SnakeModel {
    groups: SignalGroupId[];
    network: Network;
}

// New model, and the random position after making it
export interface CreatedSnakeModel {
    model: SnakeModel;
    randomPosition: number;
}

/**
 * Creates a model with one input per signal, one middle layer, and score per move.
 *
 * @param groups - Signal groups the model reads.
 * @param hiddenSize - Neurons in the middle layer.
 * @param randomPosition - Position in the random sequence to draw from.
 * @returns New model with random weights, and the next random position.
 */
export function createSnakeModel(
    groups: SignalGroupId[],
    hiddenSize: number,
    randomPosition: number,
): CreatedSnakeModel {
    // Size the network from the signals in and the moves out
    const layerSizes = [listSignalNames(groups).length, hiddenSize, SNAKE_ACTIONS.length];
    const created = createNetwork(layerSizes, randomPosition);

    return { model: { groups, network: created.network }, randomPosition: created.randomPosition };
}

/**
 * Picks a move with a trained model.
 *
 * @param state - Game to pick a move for.
 * @param model - Model to ask.
 * @returns Move with the highest score.
 */
export function chooseModelAction(state: SnakeState, model: SnakeModel): SnakeAction {
    // Score each move from what the snake sees
    const signals = observeSnakeGame(state, model.groups);
    const scores = runNetwork(model.network, signals);

    // Refuse a network that does not score every move
    if (scores.length !== SNAKE_ACTIONS.length)
        throw new Error(
            `Snake model must give ${SNAKE_ACTIONS.length} scores, got ${scores.length}`,
        );

    // Pick the highest score
    const bestIndex = scores.indexOf(Math.max(...scores));
    return SNAKE_ACTIONS[bestIndex];
}
