import { useReducer } from 'react';

import { Sprite } from '../common/Sprite';
import { resolveEffect } from '../state/common';
import type { Chip, Effect, GameAction, GameState } from '../state/types';

import { StateManager } from './state-manager';
import type { BoardState, Board as BoardType } from './types';

import './index.css';

type Props = {
    onGameAction: (action: GameAction) => void;
    state: GameState;
};

const getDefaultBoard = (): BoardType => {
    return {
        cells: Array.from(new Array(20), (_, index: number) => ({ position: index, effects: [] })),
    };
};

const defaultBoardState = (state: GameState): BoardState => {
    const styles = new Set(['explosion']);
    state.bag.forEach(chip => {
        styles.add(chip.style);
    });

    const effectModules = Array.from(styles).map(style => {
        return state.effectDeck.find(effect => effect.style === style)!;
    });

    return {
        bag: state.bag,
        effectModules,
        board: getDefaultBoard(),
        played: [],
        action: { type: 'waiting' },
        weights: state.weights.slice(),
    };
};

export const ChipDisplay = ({ chip }: { chip: Chip }) => {
    if (!chip) {
        return null;
    }

    return (
        <div className="cell-chip">
            <Sprite type="chip" chip={chip} />
            <Sprite type="number" value={chip.quantity} />
        </div>
    );
};

const DEFAULT_ENERGY_COST: Effect = {
    type: 'energy',
    energyShift: -1,
};

export const Board = ({ onGameAction, state }: Props) => {
    const [boardState, boardAction] = useReducer(StateManager, defaultBoardState(state));

    return (
        <div id="board">
            <ul id="cells" className="board-list">
                {boardState.board.cells.map(cell => {
                    const placement = boardState.played.find(([_, pos]) => pos === cell.position);

                    return (
                        <li key={cell.position} className="grid-item">
                            <div className="cell">
                                {placement && <ChipDisplay chip={placement[0]} />}
                            </div>
                        </li>
                    );
                })}
            </ul>
            {state.currentActivity === 'board' && (
                <div id="action-row">
                    {boardState.action.type === 'ended' ? (
                        <div>
                            <button onClick={() => onGameAction({ type: 'leave-board' })}>Leave</button>
                        </div>
                    ) : boardState.action.type === 'drawing' ? (
                        <div>
                            {boardState.action.options.map((chip, _, options) => {
                                const isSomeForced = options.some(chip => {
                                    const relevantRule = state.effectDeck.find(module => module.style === chip.style)!;

                                    return relevantRule.effects.some(effect => effect.type === 'forced');
                                });

                                const isThisForced = state.effectDeck.some(effectCard => {
                                    return effectCard.style === chip.style
                                        && effectCard.effects.some(effect => effect.type === 'forced');
                                });

                                return (
                                    <button
                                        key={chip.id}
                                        onClick={() => {
                                            boardAction({ type: 'choose', chip });

                                            const relevantRule = boardState.effectModules.find(module => module.style === chip.style);

                                            if (!relevantRule) {
                                                console.error('No relevant rule for chosen chip:', chip, boardState.effectModules);
                                                throw new Error('No relevant rule!');
                                            }

                                            onGameAction({
                                                type: 'trigger-effects',
                                                effects: relevantRule.effects.map(effect => resolveEffect(effect, chip)),
                                            });
                                        }}
                                        disabled={isSomeForced && !isThisForced}
                                    >
                                        <ChipDisplay chip={chip} />
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div>
                            <button
                                disabled={state.energy <= 0}
                                onClick={() => {
                                    onGameAction({
                                        type: 'trigger-effects',
                                        effects: [DEFAULT_ENERGY_COST],
                                    });
                                    boardAction({ type: 'draw' });
                                }}
                            >
                                Draw
                            </button>
                            <button onClick={() => onGameAction({ type: 'end-board' })}>End</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
