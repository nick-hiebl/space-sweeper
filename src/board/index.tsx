import { useEffect, useReducer, useState } from 'react';

import { ChipDisplay } from '../common/ChipDisplay';
import { last, resolveEffect } from '../state/common';
import type { Chip, Effect, GameAction, GameState, Style } from '../state/types';

import { DisplayEffect, EffectModule } from './effect-module';
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

const IMAGE_SCALE = 4;

const CellComponent = ({ cell, chip, isHovered, onMouseEnter, onMouseLeave }: CellComponentProps) => {
    return (
        <li className="grid-item" data-hovered={isHovered}>
            <div className="cell" style={{ top: cell.offset.y * IMAGE_SCALE, left: cell.offset.x * IMAGE_SCALE }}>
                {cell.effects.length > 0 && (
                    <div className="cell-effects-container">
                        {cell.effects.map((effect, index) => (
                            <DisplayEffect key={index} effect={effect} size="small" />
                        ))}
                    </div>
                )}
                {chip && (
                    <ChipDisplay
                        size="64"
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
    const [hasEnded, setEnded] = useState(false);

    const [hoveredStyle, setHoveredStyle] = useState<Style | undefined>(undefined);
    const [hoveredPlace, setHoveredPlace] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (boardState.action.type !== 'drawing') {
            setHoveredStyle(undefined);
            setHoveredPlace(undefined);
        }
    }, [boardState]);

    const isDone = state.hitPoints <= 0 && boardState.action.type !== 'drawing';

    useEffect(() => {
        if (isDone) {
            setEnded(true);
        }
    }, [isDone]);

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
    }, [boardState, onGameAction]);

    const unplayedChips = boardState.bag.filter(chip => (
        !boardState.played.some(([playedChip]) => chip.id === playedChip.id)
    ));

    const nothingToDraw = unplayedChips.length === 0 && boardState.weights.length === 0;

    const lastPlace = last(boardState.board.cells);
    const lastIndex = lastPlace.position;

    const anythingPlacedInLast = boardState.played.some(([_, index]) => index === lastIndex);

    return (
        <div id="board-state">
            <h2>Board</h2>
            <div id="board" style={{ height: boardState.board.dimensions.height * IMAGE_SCALE }}>
                <img src={boardState.board.imageSrc} height={boardState.board.dimensions.height * IMAGE_SCALE} alt="" />
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
            </div>
            {hasEnded || isDone ? (
                <div>
                    <h2>Actions</h2>
                    <button
                        onClick={() => onGameAction({
                            type: 'activity-signal',
                            signal: 'finish-board',
                            boardState,
                        })}
                    >
                        Move on
                    </button>
                </div>
            ) : (
                <div id="action-row">
                    {boardState.action.type === 'ended' ? (
                        <div>
                            <h2>Actions</h2>
                            <button
                                onClick={() => onGameAction({
                                    type: 'activity-signal',
                                    signal: 'finish-board',
                                    boardState,
                                })}
                            >
                                Leave
                            </button>
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
                            <div className="inline-center gap-8px">
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

                                                const landedCell = boardState.board.cells.find(({ position }) => position === willLandOn);
                                                if (landedCell && (landedCell?.effects?.length ?? 0) > 0) {
                                                    onGameAction({
                                                        type: 'trigger-effects',
                                                        effects: landedCell.effects,
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
                        </div>
                    ) : (
                        <div>
                            <h2>Actions</h2>
                            <div className="inline-center gap-8px">
                                <button
                                    disabled={state.energy <= 0 || anythingPlacedInLast || nothingToDraw}
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
                                <button onClick={() => setEnded(true)}>
                                    End
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
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
