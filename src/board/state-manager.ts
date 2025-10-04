import { selectRandom } from '../common/random';
import { getId } from '../state/initialiser';
import type { Chip, EffectModule, GameState, Style, Weight } from '../state/types';

import type { Board, BoardAction, BoardState, ImmediateState } from './types';

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

    while (bagItems.length < count) {
        const chosenWeight = weights[Math.floor(Math.random() * weights.length)];

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

            const { cells } = state.board;
            const lastCellPosition = cells[cells.length - 1].position;

            const [_, lastPosition] = state.played[state.played.length - 1] ?? [undefined, -1];

            console.assert(lastPosition < lastCellPosition, 'Something already placed in final cell but tried to place another!');

            const placedPosition = Math.min(lastPosition + chosenChip.quantity, lastCellPosition);

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

const getDefaultBoard = (): Board => {
    return {
        cells: Array.from(new Array(20), (_, index: number) => ({ position: index, effects: [] })),
    };
};

const DEFAULT_MODULE = (style: Style): EffectModule => {
    return {
        style,
        effects: [],
    };
};

export const defaultBoardState = (state: GameState): BoardState => {
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
        board: getDefaultBoard(),
        played: [],
        action: initialAction,
        weights: state.weights.slice(),
    };
};
