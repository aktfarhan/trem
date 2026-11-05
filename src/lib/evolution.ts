import { drawRandom } from './seeded-random';
import type { CreatedNetwork, Network } from './network';

// How many networks are kept each generation, and nudge rate
export interface EvolutionSettings {
    keepCount: number;
    mutationRate: number;
    mutationSize: number;
}

// Next generation, and the random position
export interface EvolvedPopulation {
    networks: Network[];
    randomPosition: number;
}

// Games scored, and their totals
export interface ScoreRecord {
    games: number;
    total: number;
}

// Score per network over all its games
export interface AveragedScores {
    scores: number[];
    recordByNetwork: Map<Network, ScoreRecord>;
}

// Fewest networks a generation can keep
const MIN_KEEP_COUNT = 1;

// Record of a network that has not been scored yet
const EMPTY_RECORD: ScoreRecord = { games: 0, total: 0 };

/**
 * Averages each network's new score with every score it got before.
 *
 * @param networks - Current generation.
 * @param scores - One new score per network.
 * @param gameCount - Games behind each new score.
 * @param pastRecordByNetwork - Records from the generation before.
 * @returns Score per network over every game it has played, and records for the next generation.
 */
export function averageWithPastScores(
    networks: Network[],
    scores: number[],
    gameCount: number,
    pastRecordByNetwork: Map<Network, ScoreRecord>,
): AveragedScores {
    // Refuse scores that do not match the networks
    if (scores.length !== networks.length)
        throw new Error(`Averaging needs ${networks.length} scores, got ${scores.length}`);

    // Add each new score to the network's record
    const averagedScores: number[] = [];
    const recordByNetwork = new Map<Network, ScoreRecord>();
    for (const [index, network] of networks.entries()) {
        const pastRecord = pastRecordByNetwork.get(network) ?? EMPTY_RECORD;
        const record = {
            games: pastRecord.games + gameCount,
            total: pastRecord.total + scores[index] * gameCount,
        };
        recordByNetwork.set(network, record);
        averagedScores.push(record.total / record.games);
    }

    // Return the averages
    return { scores: averagedScores, recordByNetwork };
}

// Copy of a network with some weights nudged
function mutateNetwork(
    parent: Network,
    settings: EvolutionSettings,
    randomPosition: number,
): CreatedNetwork {
    // Copy the weights first
    const weights = new Float64Array(parent.weights);
    let position = randomPosition;

    for (let i = 0; i < weights.length; i++) {
        // Skip the weight unless it draws under the mutation rate
        const chance = drawRandom(position);
        position = chance.position;
        if (chance.value >= settings.mutationRate) continue;

        // Nudge it by a random amount from -mutationSize to mutationSize
        const nudge = drawRandom(position);
        position = nudge.position;
        weights[i] += (nudge.value * 2 - 1) * settings.mutationSize;
    }

    return { network: { weights, layerSizes: parent.layerSizes }, randomPosition: position };
}

/**
 * Makes the next generation.
 *
 * @param networks - Current generation.
 * @param scores - One score per network.
 * @param settings - How many to keep, and the nudge rate.
 * @param randomPosition - Position in the random sequence to draw from.
 * @returns Next generation and the next random position.
 */
export function evolvePopulation(
    networks: Network[],
    scores: number[],
    settings: EvolutionSettings,
    randomPosition: number,
): EvolvedPopulation {
    // Refuse scores that do not match the networks
    if (scores.length !== networks.length)
        throw new Error(`Evolution needs ${networks.length} scores, got ${scores.length}`);

    // Refuse to keep none, or more networks than there are
    const { keepCount } = settings;
    if (keepCount < MIN_KEEP_COUNT || keepCount > networks.length)
        throw new Error(
            `Evolution keeps ${MIN_KEEP_COUNT} to ${networks.length} networks, got ${keepCount}`,
        );

    // 1. Rank the networks by score
    const scoredNetworks = networks.map((network, index) => ({ score: scores[index], network }));
    const sortedNetworks = scoredNetworks.toSorted((a, b) => b.score - a.score);

    // 2. Keep the best ones unchanged
    const keptNetworks = sortedNetworks.slice(0, keepCount).map(({ network }) => network);

    // 3. Fill the rest with nudged copies
    const nextNetworks = [...keptNetworks];
    let position = randomPosition;
    for (let i = keptNetworks.length; i < networks.length; i++) {
        const parent = keptNetworks[i % keptNetworks.length];
        const child = mutateNetwork(parent, settings, position);
        nextNetworks.push(child.network);
        position = child.randomPosition;
    }

    return { networks: nextNetworks, randomPosition: position };
}
