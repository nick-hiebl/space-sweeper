import type { GameAction, GameState } from '../../state/types';

type Props = {
    state: GameState;
    onGameAction: (action: GameAction) => void;
};

export const Hub = ({ onGameAction, state }: Props) => {
    if (state.currentActivity.type !== 'hub') {
        return null;
    }

    const { region } = state.currentActivity;

    return (
        <div>
            <h1>
                {region.name}
            </h1>
            <h2>Activities</h2>
            <div>
                {region.activities.map(({ activity, chosen }, index) => (
                    <button
                        key={index}
                        disabled={chosen}
                        onClick={() => {
                            onGameAction({
                                type: 'activity-signal',
                                signal: 'hub-activity',
                                activity,
                            });
                        }}
                    >
                        {activity.type}
                    </button>
                ))}
            </div>
            <h2>Next regions</h2>
            <div>
                {region.nextRegions.map((nextRegion, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            onGameAction({
                                type: 'activity-signal',
                                signal: 'next-hub',
                                hub: nextRegion.name,
                            });
                        }}
                    >
                        Next: {nextRegion.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
