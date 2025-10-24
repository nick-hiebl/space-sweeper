import { useState } from 'react';

import { EffectModule } from '../../board/effect-module';
import { ChipDisplay } from '../../common/ChipDisplay';
import type { GameAction, GameState } from '../../state/types';

type Props = {
    state: GameState;
    onGameAction: (action: GameAction) => void;
};

export const Choice = ({ onGameAction, state }: Props) => {
    const [done, setDone] = useState(false);
    const [initiallyOwnedModules] = useState(state.effectDeck);

    if (state.currentActivity.type !== 'choice') {
        return null;
    }

    const { choices, modules } = state.currentActivity;

    return (
        <div className="stack gap-8px">
            <h1>Choices</h1>
            <div>
                Choose one to add to your bag.
            </div>
            {choices && (
                <div className="inline-center gap-8px">
                    {choices.map((choice, index) => (
                        <button
                            key={index}
                            disabled={done}
                            onClick={() => {
                                onGameAction({
                                    type: 'add-chip',
                                    chips: [choice],
                                });
                                setDone(true);
                            }}
                        >
                            <ChipDisplay chip={choice} />
                        </button>
                    ))}
                </div>
            )}
            {modules && (
                <div className="inline-center gap-8px">
                    {modules
                        .filter(module => {
                            return !initiallyOwnedModules.includes(module)
                        })
                        .map((module, index) => (
                            <button
                                key={index}
                                disabled={done}
                                onClick={() => {
                                    onGameAction({
                                        type: 'add-module',
                                        modules: [module],
                                    });
                                    setDone(true);
                                }}
                            >
                                <EffectModule module={module} />
                            </button>
                        ))}
                </div>
            )}
            <div>
                <button disabled={done} onClick={() => setDone(true)}>Pass</button>
            </div>
            {done && (
                <div>
                    <button
                        onClick={() => {
                            onGameAction({
                                type: 'activity-signal',
                                signal: 'finish-shop',
                            });
                        }}
                    >
                        Move on
                    </button>
                </div>
            )}
        </div>
    )
};
