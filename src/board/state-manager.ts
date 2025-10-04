import { getId } from '../state/initialiser';
import type { Chip, Weight } from '../state/types';

import type { BoardState } from './types';

type WaitingActions = { type: 'end' } | { type: 'draw' };
type DrawingActions = { type: 'choose'; chip: Chip };

type Action = WaitingActions | DrawingActions;

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

export const StateManager = (state: BoardState, action: Action): BoardState => {
    if (state.action.type === 'waiting') {
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
