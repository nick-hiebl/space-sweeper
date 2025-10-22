import type { Chip, Effect, EffectModule, Style, Weight } from '../state/types';

export type Position = number;

export type Cell = {
    offset: { x: number; y: number };
    position: Position;
    effects: Effect[];
    markerNumber?: number;
};

export type Board = {
    dimensions: { width: number; height: number };
    imageSrc: string;
    cells: Cell[];
};

export type PickingModuleState = { type: 'picking-modules'; style: Style };

export type WaitingState = { type: 'waiting' };

export type DrawingState = { type: 'drawing', options: Chip[] };

export type EndedState = { type: 'ended' };

export type ImmediateState = PickingModuleState | WaitingState | DrawingState | EndedState;

export type BoardState = {
    bag: Chip[];
    effectModules: EffectModule[];
    board: Board;
    played: [Chip, Position][];
    action: ImmediateState;
    weights: Weight[];
};

type WaitingActions = { type: 'end' } | { type: 'draw' };
type DrawingActions = { type: 'choose'; chip: Chip };
type SelectModuleActions = { type: 'select-module'; module: EffectModule };

export type BoardAction = WaitingActions | DrawingActions | SelectModuleActions;
