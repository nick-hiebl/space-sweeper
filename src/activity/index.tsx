import { Board } from '../board';
import { useExternalStore } from '../common/external-store';
import { Shop } from '../shop';
import { useCampaign } from '../state/campaigns/context';
import type { GameAction, GameState } from '../state/types';

import { Choice } from './choice';
import { Combiner } from './combiner';
import { Hub } from './hub';
import { ModuleTrash } from './module-trash';
import { Tutorial } from './tutorial';

type ActivityProps = {
    state: GameState;
    onAction: (action: GameAction) => void;
};

export const RenderActivity = () => {
	const campaign = useCampaign();

	const currentActivity = useExternalStore(campaign.activity);

	if (!currentActivity) {
		return null;
	}

	const { component: Component, data } = currentActivity;

	return <Component {...data} />;
};

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
    } else if (state.currentActivity.type === 'hub') {
        return <Hub state={state} onGameAction={onAction} />;
    } else if (state.currentActivity.type === 'choice') {
        return <Choice state={state} onGameAction={onAction} />;
    } else if (state.currentActivity.type === 'module-trash') {
        return <ModuleTrash state={state} onGameAction={onAction} />;
    }

    return null;
};
