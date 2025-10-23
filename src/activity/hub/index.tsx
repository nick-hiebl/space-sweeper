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

    const { energy } = region;

    const activitiesCompleted = region.activities.filter(a => a.chosen).length;

    const disabled = activitiesCompleted >= energy;

    return (
        <div>
            <h1>
                {region.name}
            </h1>
            <h2>Activities</h2>
            <p>
                You have energy for {energy} {energy === 1 ? 'activity' : 'activities'}.
                You have already completed {activitiesCompleted} {activitiesCompleted === 1 ? 'activity' : 'activities'}.
            </p>
            <div className="inline-center gap-8px">
                {region.activities.map(({ activity, chosen }, index) => (
                    <button
                        key={index}
                        disabled={chosen || disabled}
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
            <div className="inline-center gap-8px">
                {region.nextRegions.map((nextRegion, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            onGameAction({
                                type: 'trigger-effects',
                                effects: [{ type: 'energy', energyShift: state.maxEnergy }],
                            });
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
