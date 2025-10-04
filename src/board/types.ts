import type { Chip, Effect, EffectModule, Weight } from '../state/types';

export type Position = number;

export type Cell = {
    position: Position;
    effects: Effect[];
};

export type Board = {
    cells: Cell[];
};

export type WaitingState = { type: 'waiting' };

export type DrawingState = { type: 'drawing', options: Chip[] };

export type EndedState = { type: 'ended' };

export type ImmediateState = WaitingState | DrawingState | EndedState;

export type BoardState = {
    bag: Chip[];
    effectModules: EffectModule[];
    board: Board;
    played: [Chip, Position][];
    action: ImmediateState;
    weights: Weight[];
};
