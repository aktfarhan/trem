import { scoreSnakeModel } from './fitness';
import { drawRandom } from '../../lib/seeded-random';
import { createSnakeModel, type SnakeModel } from './model';
import {
    averageWithPastScores,
    evolvePopulation,
    type EvolutionSettings,
    type ScoreRecord,
} from '../../lib/evolution';
import type { SignalGroupId } from './observe';
import type { Network } from '../../lib/network';

// How a training is set up
export interface TrainingSettings extends EvolutionSettings {
    groups: SignalGroupId[];
    gridSize: number;
    hiddenSize: number;
    snakeCount: number;
    gamesPerSnake: number;
}

// A run's randomness
export interface RunSeeds {
    worldSeed: number;
    trainingSeed: number;
}

// Best snake seen so far
export interface KeptSnake {
    model: SnakeModel;
    pickScore: number;
    generation: number;
}

// Training between generations
export interface SnakeTraining {
    kept: KeptSnake | null;
    networks: Network[];
    settings: TrainingSettings;
    pickSeeds: number[];
    generation: number;
    worldPosition: number;
    randomPosition: number;
    recordByNetwork: Map<Network, ScoreRecord>;
}

// Training one generation
export interface TrainedGeneration {
    training: SnakeTraining;
    bestScore: number;
    averageScore: number;
}

// Games drawn from the world
interface DrawnGames {
    seeds: number[];
    worldPosition: number;
}

// Generations between checks for a better snake to keep
export const KEEP_CHECK_GAP = 50;

// Games each world draws to pick which snake to keep
const PICK_GAME_COUNT = 200;

// Number of different game seeds
const GAME_SEED_RANGE = 2 ** 32;

// Draw the next games from the world
function drawGames(count: number, worldPosition: number): DrawnGames {
    const seeds: number[] = [];
    let position = worldPosition;
    for (let i = 0; i < count; i++) {
        const draw = drawRandom(position);
        seeds.push(Math.floor(draw.value * GAME_SEED_RANGE));
        position = draw.position;
    }
    return { seeds, worldPosition: position };
}

// Keep the best snake seen
function keepBetterSnake(
    kept: KeptSnake | null,
    challenger: SnakeModel,
    pickSeeds: number[],
    generation: number,
    gridSize: number,
): KeptSnake | null {
    // Score the challenger on the picked games
    const pickScore = scoreSnakeModel(challenger, pickSeeds, gridSize);

    // Stay with the kept snake unless the challenger does better
    if (kept && pickScore <= kept.pickScore) return kept;
    return { model: challenger, pickScore, generation };
}

/**
 * Creates a training with a population of random snakes.
 *
 * @param settings - How the training is set up.
 * @param seeds - World and training seeds for the games and snakes.
 * @returns Training at generation 0.
 */
export function createTraining(settings: TrainingSettings, seeds: RunSeeds): SnakeTraining {
    // Make every snake from the training seed
    const networks: Network[] = [];
    let position = seeds.trainingSeed;
    for (let i = 0; i < settings.snakeCount; i++) {
        const created = createSnakeModel(settings.groups, settings.hiddenSize, position);
        networks.push(created.model.network);
        position = created.randomPosition;
    }

    // Draw the picked games first
    const picked = drawGames(PICK_GAME_COUNT, seeds.worldSeed);

    return {
        kept: null,
        networks,
        settings,
        pickSeeds: picked.seeds,
        generation: 0,
        worldPosition: picked.worldPosition,
        randomPosition: position,
        recordByNetwork: new Map(),
    };
}

/**
 * Trains one generation of snakes.
 *
 * @param training - Training to continue.
 * @returns Training one generation on, and how the generation scored.
 */
export function trainGeneration(training: SnakeTraining): TrainedGeneration {
    // Snakes, settings, picked games and records this generation starts from
    const { networks, settings, pickSeeds, recordByNetwork } = training;
    const { groups, gridSize, gamesPerSnake } = settings;

    // 1. Draw this generation's games from the world, and play them
    const games = drawGames(gamesPerSnake, training.worldPosition);
    const scores = networks.map((network) =>
        scoreSnakeModel({ groups, network }, games.seeds, gridSize),
    );

    // 2. Judge each snake on every game it has played
    const averaged = averageWithPastScores(networks, scores, gamesPerSnake, recordByNetwork);

    // 3. Find the best snake
    const bestScore = Math.max(...averaged.scores);
    const bestNetwork = networks[averaged.scores.indexOf(bestScore)];
    let totalScore = 0;
    for (const score of averaged.scores) {
        totalScore += score;
    }
    const averageScore = totalScore / averaged.scores.length;

    // 4. Keep the best snake if it's better
    const generation = training.generation + 1;
    const isCheckGeneration = generation % KEEP_CHECK_GAP === 0;
    const challenger = { groups, network: bestNetwork };
    const kept = isCheckGeneration
        ? keepBetterSnake(training.kept, challenger, pickSeeds, generation, gridSize)
        : training.kept;

    // 5. Make the next generation
    const evolved = evolvePopulation(networks, averaged.scores, settings, training.randomPosition);

    return {
        training: {
            kept,
            networks: evolved.networks,
            settings,
            pickSeeds,
            generation,
            worldPosition: games.worldPosition,
            randomPosition: evolved.randomPosition,
            recordByNetwork: averaged.recordByNetwork,
        },
        bestScore,
        averageScore,
    };
}
