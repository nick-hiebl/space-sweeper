import { selectRandom, selectRandomN } from '../common/random';
import { last, resolveEffect } from '../state/common';
import { getId } from '../state/initialiser';
import type { Chip, Effect, EffectModule, GameState, MoveEffect, Style, Weight } from '../state/types';

import { BOARD_MAP } from './board-data';
import type { Board, BoardAction, BoardState, Cell, ImmediateState, Position } from './types';

export const getPlayEffectsFromPlacing = (state: BoardState, chip: Chip): Effect[] => {
    const thisRule = state.effectModules.find(({ style }) => style === chip.style);

    const playEffects = (thisRule?.playEffects ?? []);

    const alreadyPlayed = state.played.slice().concat([[chip, 100]]);
    alreadyPlayed.reverse();

    const stack: Style[] = alreadyPlayed.map(([{ style }]) => style);

    const patternEffects: Effect[] = [];

    alreadyPlayed.forEach(([priorChip], index) => {
        const relevantRule = state.effectModules.find(({ style }) => style === priorChip.style);

        const triggeredPatterns = (relevantRule?.patternEffects ?? []).filter(patternEffect => {
            const matchingFragment = stack.slice(0, patternEffect.pattern.length);

            // Lengths must match
            if (matchingFragment.length !== patternEffect.pattern.length) {
                return false;
            }

            // The chip must be most recent instance of this style in the stack
            if (index > matchingFragment.findIndex(style => style === priorChip.style)) {
                return false;
            }

            return matchingFragment.every((style, index) => patternEffect.pattern[index] === style);
        });

        patternEffects.push(...triggeredPatterns.flatMap(patternEffect => patternEffect.effects.map(e => resolveEffect(e, priorChip))));
    });

    return playEffects.concat(patternEffects);
};

export const resolvePlacementDistance = (state: BoardState, chip: Chip): Position => {
    if (state.action.type !== 'drawing' || !state.action.options.includes(chip)) {
        console.error('Calculating placement outside of drawing phase, or with invalid chip', state, chip);
        throw new Error('Invalid placement distance resolution');
    }

    const { cells } = state.board;
    const lastCellPosition = last(cells).position;

    const playBonusDistance = getPlayEffectsFromPlacing(state, chip)
        .filter(effect => effect.type === 'move')
        .map(effect => resolveEffect(effect, chip))
        .reduce((total, effect) => {
            return total + ((effect as MoveEffect).distance as number);
        }, 0);

    const drawBonusDistance = state.action.options
        .map<[Chip, Effect[]]>(chip => [chip, state.effectModules.find(module => module.style === chip.style)?.drawEffects ?? []])
        .filter(([_, effects]) => effects.length > 0)
        .map<[Chip, Effect[]]>(([chip, effects]) => [chip, effects.filter(effect => effect.type === 'move')])
        .flatMap(([chip, effects]) => effects.map(effect => resolveEffect(effect, chip)))
        .reduce((total, effect) => {
            return total + ((effect as MoveEffect).distance as number);
        }, 0);

    const [, lastPosition] = last(state.played) ?? [undefined, -1];

    console.assert(lastPosition < lastCellPosition, 'Something already placed in final cell but tried to place another!');

    return Math.min(lastPosition + chip.quantity + playBonusDistance + drawBonusDistance, lastCellPosition);
};

function selectN(items: Chip[], count: number, weights: Weight[]): Chip[] {
    const bagItems = items.reduce((chosen: Chip[], current: Chip, index: number) => {
        const stillNeeded = count - chosen.length;
        const remainingOptions = items.length + weights.length - index;
        if (Math.random() < stillNeeded / remainingOptions) {
            return chosen.concat(current);
        } else {
            return chosen;
        }
    }, []);

    let selectableWeights = weights.slice();

    while (bagItems.length < count && selectableWeights.length > 0) {
        const chosenWeight = selectRandom(selectableWeights);
        selectableWeights = selectableWeights.filter(w => w !== chosenWeight);

        bagItems.push({ ...chosenWeight, id: getId() });
    }

    return bagItems;
}

const CHIPS_TO_CHOOSE_FROM = 3;

export const StateManager = (initialGameState: GameState) => (state: BoardState, action: BoardAction): BoardState => {
    if (state.action.type === 'picking-modules') {
        if (action.type === 'select-module') {
            const unpickedTypes = new Set<Style>();
            initialGameState.bag.forEach(chip => {
                unpickedTypes.add(chip.style);
            });
            initialGameState.weights.forEach(weight => {
                unpickedTypes.add(weight.style);
            });

            state.effectModules.forEach(module => {
                unpickedTypes.delete(module.style);
            });
            unpickedTypes.delete(action.module.style);

            const nextAction: ImmediateState = unpickedTypes.size === 0
                ? { type: 'waiting' }
                : { type: 'picking-modules', style: selectRandom(Array.from(unpickedTypes)) };

            return {
                ...state,
                effectModules: state.effectModules.concat(action.module),
                action: nextAction,
            };
        }
    } else if (state.action.type === 'waiting') {
        if (action.type === 'end') {
            return {
                ...state,
                action: { type: 'ended' },
            };
        } else if (action.type === 'draw') {
            return {
                ...state,
                action: {
                    type: 'drawing',
                    options: selectN(
                        state.bag
                            .filter(chip => !state.played.some(([playedChip]) => playedChip === chip)),
                        CHIPS_TO_CHOOSE_FROM,
                        state.weights,
                    ),
                },
            };
        }
    } else if (state.action.type === 'drawing') {
        if (action.type === 'choose') {
            const chosenChip = action.chip;
            const alreadyPlayed = state.played.some(([playedChip]) => playedChip === chosenChip);

            console.assert(!alreadyPlayed, 'Chip was already played');

            const placedPosition = resolvePlacementDistance(state, chosenChip);

            return {
                ...state,
                played: state.played.concat([[chosenChip, placedPosition]]),
                action: { type: 'waiting' },
            };
        }
    }

    console.error('Unexpected action from state!', state, action);
    throw new Error('UnacceptableAction');
};

const getDefaultBoard = (boardKey: string, scatteredEffects: Effect[]): Board => {
    const board = BOARD_MAP.get(boardKey);
    if (!board) {
        throw new Error(`Cannot find level: '${boardKey}'`);
    }

    if (boardKey === 'SMALL' && scatteredEffects.length === 0) {
        return {
            ...board,
            cells: board.cells.map<Cell>(cell => cell.position === 5
                ? { ...cell, effects: [{ type: 'health', healthShift: 1 }] }
                : cell
            ),
        };
    }

    const effectCells = selectRandomN(board.cells, scatteredEffects.length);
    const markerCells = selectRandomN(board.cells.filter(cell => !effectCells.includes(cell)), 3);

    return {
        ...board,
        cells: board.cells.map<Cell>(cell => {
            const specialIndex = effectCells.findIndex(c => c === cell);
            const markerIndex = markerCells.findIndex(c => c === cell);

            return {
                ...cell,
                effects: specialIndex >= 0 ? cell.effects.concat([scatteredEffects[specialIndex]]) : cell.effects,
                markerNumber: markerIndex >= 0 ? markerIndex + 1 : undefined,
            };
        }),
    };
};

const DEFAULT_MODULE = (style: Style): EffectModule => {
    return {
        style,
    };
};

export const defaultBoardState = (state: GameState): BoardState => {
    if (state.currentActivity.type !== 'board') {
        throw new Error('Constructing board when game not in board state!');
    }

    const unresolvedStyles = new Set<Style>();
    state.bag.forEach(chip => {
        unresolvedStyles.add(chip.style);
    });
    state.weights.forEach(weight => {
        unresolvedStyles.add(weight.style);
    });

    const effectModules: EffectModule[] = [];

    Array.from(unresolvedStyles).forEach(style => {
        const modules = state.effectDeck.filter(mod => mod.style === style);
        if (modules.length === 1) {
            effectModules.push(modules[0]);
            unresolvedStyles.delete(style);
        } else if (modules.length === 0) {
            effectModules.push(DEFAULT_MODULE(style));
            unresolvedStyles.delete(style);
        }
    });

    const initialAction: ImmediateState = unresolvedStyles.size > 0
        ? { type: 'picking-modules', style: selectRandom(Array.from(unresolvedStyles)) }
        : { type: 'waiting' };

    return {
        bag: state.bag,
        effectModules: effectModules,
        board: getDefaultBoard(state.currentActivity.boardKey, state.currentActivity.scatteredEffects ?? []),
        played: [],
        action: initialAction,
        weights: state.weights.slice(),
    };
};
