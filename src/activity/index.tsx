import { Board } from '../board';
import { Shop } from '../shop';
import type { GameAction, GameState } from '../state/types';

type ActivityProps = {
    state: GameState;
    onAction: (action: GameAction) => void;
}

export const Activity = ({ state, onAction }: ActivityProps) => {
    if (state.currentActivity === 'start') {
        return (
            <button onClick={() => onAction({ type: 'start-board' })}>Start</button>
        );
    } else if (state.currentActivity === 'board' || state.currentActivity === 'board-finished') {
        return (
            <div>
                <Board state={state} onGameAction={onAction} />
                {state.currentActivity === 'board-finished' && (
                    <button onClick={() => onAction({ type: 'leave-board' })}>Move on</button>
                )}
            </div>
        );
    } else if (state.currentActivity === 'shop') {
        return (
            <div>
                <Shop state={state} onGameAction={onAction} />
            </div>
        )
    }

    return null;
};
