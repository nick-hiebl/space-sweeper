import { useEffect, useReducer, useState } from 'react';

import { ChipDisplay } from '../common/ChipDisplay';
import { last, resolveEffect } from '../state/common';
import type { Chip, Effect, GameAction, GameState, Style } from '../state/types';

import { EffectModule } from './effect-module';
import { StateManager, defaultBoardState, resolvePlacementDistance } from './state-manager';
import type { Cell, PickingModuleState } from './types';

import './index.css';

type Props = {
    onGameAction: (action: GameAction) => void;
    state: GameState;
};

const DEFAULT_ENERGY_COST: Effect = {
    type: 'energy',
    energyShift: -1,
};

type CellComponentProps = {
    cell: Cell;
    chip?: Chip;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    isHovered?: boolean;
};

const CellComponent = ({ cell, chip, isHovered, onMouseEnter, onMouseLeave }: CellComponentProps) => {
    return (
        <li className="grid-item" data-hovered={isHovered}>
            <div className="cell">
                {chip && (
                    <ChipDisplay
                        chip={chip}
                        onMouseEnter={() => onMouseEnter?.()}
                        onMouseLeave={() => onMouseLeave?.()}
                    />
                )}
            </div>
        </li>
    );
};

export const Board = ({ onGameAction, state }: Props) => {
    const [boardState, onBoardAction] = useReducer(StateManager(state), defaultBoardState(state));

    const [hoveredStyle, setHoveredStyle] = useState<Style | undefined>(undefined);
    const [hoveredPlace, setHoveredPlace] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (boardState.action.type !== 'drawing') {
            setHoveredStyle(undefined);
            setHoveredPlace(undefined);
        }
    }, [boardState]);

    useEffect(() => {
        if (boardState.action.type !== 'drawing') {
            return;
        }

        const drawEffects = boardState.action.options
            .flatMap(chip => (
                (boardState.effectModules
                    .find(module => module.style === chip.style)?.drawEffects ?? [])
                    .map(effect => resolveEffect(effect, chip))
            ));

        onGameAction({
            type: 'trigger-effects',
            effects: drawEffects,
        });
    }, [boardState]);

    const lastPlace = last(boardState.board.cells);
    const lastIndex = lastPlace.position;

    const anythingPlacedInLast = boardState.played.some(([_, index]) => index === lastIndex);

    return (
        <div id="board-state">
            <h2>Board</h2>
            <ul id="cells" className="board-list">
                {boardState.board.cells.map(cell => {
                    const placement = boardState.played.find(([_, pos]) => pos === cell.position);
                    const chip = placement?.[0];

                    return (
                        <CellComponent
                            key={cell.position}
                            cell={cell}
                            chip={chip}
                            isHovered={cell.position === hoveredPlace}
                            onMouseEnter={chip ? () => setHoveredStyle(chip.style) : undefined}
                            onMouseLeave={chip ? () => setHoveredStyle(undefined) : undefined}
                        />
                    );
                })}
            </ul>
            {state.currentActivity === 'board' ? (
                <div id="action-row">
                    {boardState.action.type === 'ended' ? (
                        <div>
                            <h2>Actions</h2>
                            <button onClick={() => onGameAction({ type: 'leave-board' })}>Leave</button>
                        </div>
                    ) : boardState.action.type === 'picking-modules' ? (
                        <div>
                            <h2>Select module</h2>
                            <div>
                                {state.effectDeck
                                    .filter(effectModule => effectModule.style === (boardState.action as PickingModuleState).style)
                                    .map((effectModule, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                onBoardAction({ type: 'select-module', module: effectModule });
                                            }}
                                        >
                                            <EffectModule module={effectModule} />
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ) : boardState.action.type === 'drawing' ? (
                        <div>
                            <h2>Actions</h2>
                            {boardState.action.options.map((chip, _) => {
                                const relevantRule = boardState.effectModules.find(module => module.style === chip.style);

                                const willLandOn = resolvePlacementDistance(boardState, chip);

                                return (
                                    <button
                                        key={chip.id}
                                        onClick={() => {
                                            onBoardAction({ type: 'choose', chip });

                                            if (!relevantRule) {
                                                console.error('No relevant rule for chosen chip:', chip, boardState.effectModules);
                                                throw new Error('No relevant rule!');
                                            }

                                            if (relevantRule.playEffects) {
                                                onGameAction({
                                                    type: 'trigger-effects',
                                                    effects: relevantRule.playEffects.map(effect => resolveEffect(effect, chip)),
                                                });
                                            }
                                        }}
                                    >
                                        <ChipDisplay
                                            onMouseEnter={() => {
                                                setHoveredStyle(chip.style);
                                                setHoveredPlace(willLandOn);
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredStyle(undefined);
                                                setHoveredPlace(undefined);
                                            }}
                                            chip={chip}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div>
                            <h2>Actions</h2>
                            <button
                                disabled={state.energy <= 0 || anythingPlacedInLast}
                                onClick={() => {
                                    onGameAction({
                                        type: 'trigger-effects',
                                        effects: [DEFAULT_ENERGY_COST],
                                    });
                                    onBoardAction({ type: 'draw' });
                                }}
                            >
                                Draw
                            </button>
                            <button onClick={() => onGameAction({ type: 'end-board' })}>End</button>
                        </div>
                    )}
                </div>
            ) : state.currentActivity === 'board-finished' ? (
                <div>
                    <h2>Actions</h2>
                    <button onClick={() => onGameAction({ type: 'leave-board' })}>Move on</button>
                </div>
            ) : null}
            <h2>Rules</h2>
            <div id="effect-modules">
                {boardState.effectModules.map((effectModule, index) => (
                    <EffectModule
                        key={index}
                        module={effectModule}
                        isHighlighted={!hoveredStyle ? undefined : effectModule.style === hoveredStyle}
                    />
                ))}
            </div>
        </div>
    );
};
