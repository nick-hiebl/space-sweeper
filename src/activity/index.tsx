import { Board } from '../board';
import { Shop } from '../shop';
import type { GameAction, GameState } from '../state/types';

import { Combiner } from './combiner';
import { Tutorial } from './tutorial';

type ActivityProps = {
    state: GameState;
    onAction: (action: GameAction) => void;
}

export const Activity = ({ state, onAction }: ActivityProps) => {
    if (state.currentActivity.type === 'start') {
        return (
            <button onClick={() => onAction({ type: 'activity-signal', signal: 'finish-start' })}>
                Start
            </button>
        );
    } else if (state.currentActivity.type === 'board') {
        return <Board state={state} onGameAction={onAction} />;
    } else if (state.currentActivity.type === 'shop') {
        return <Shop state={state} onGameAction={onAction} />;
    } else if (state.currentActivity.type === 'combiner') {
        return <Combiner state={state} onGameAction={onAction} />;
    } else if (state.currentActivity.type === 'tutorial') {
        return (
            <Tutorial
                gameState={state}
                onComplete={() => onAction({
                    type: 'activity-signal',
                    signal: 'finish-tutorial',
                })}
                onGameAction={onAction}
            />
        );
    }

    return null;
};
