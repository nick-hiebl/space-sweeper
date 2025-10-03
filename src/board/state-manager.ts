import type { Chip } from '../state/types';

import type { BoardState } from './types';

type WaitingActions = { type: 'end' } | { type: 'draw' };
type DrawingActions = { type: 'choose'; chip: Chip };

type Action = WaitingActions | DrawingActions;

function selectN<T>(items: T[], count: number): T[] {
    return items.reduce((chosen: T[], current: T, index: number) => {
        const stillNeeded = count - chosen.length;
        const remainingOptions = items.length - index;
        if (Math.random() < stillNeeded / remainingOptions) {
            return chosen.concat(current);
        } else {
            return chosen;
        }
    }, []);
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
                    ),
                },
            };
        }
    } else if (state.action.type === 'drawing') {
        if (action.type === 'choose') {
            const chosenChip = action.chip;
            const alreadyPlayed = state.played.some(([playedChip]) => playedChip === chosenChip);
            console.assert(!alreadyPlayed, 'Chip was already played');

            const [_, lastPosition] = state.played[state.played.length - 1] ?? [undefined, -1];

            return {
                ...state,
                played: state.played.concat([[chosenChip, lastPosition + chosenChip.quantity]]),
                action: { type: 'waiting' },
            };
        }
    }

    console.error('Unexpected action from state!', state, action);
    throw new Error('UnacceptableAction');
};
