import { useMemo, useState } from 'react';

import type { GameAction, GameState, Style } from '../../state/types';
import { EffectModule } from '../../board/effect-module';

type Props = {
    state: GameState;
    onGameAction: (action: GameAction) => void;
};

export const ModuleTrash = ({ onGameAction, state }: Props) => {
    const [done, setDone] = useState(false);
    const { effectDeck } = state;

    const duplicateModules = useMemo(() => {
        const styles = new Set<Style>();
        const duplicateStyles = new Set<Style>();

        effectDeck.forEach(({ style }) => {
            if (styles.has(style)) {
                duplicateStyles.add(style);
            } else {
                styles.add(style);
            }
        });

        return effectDeck.filter(({ style }) => duplicateStyles.has(style));
    }, [effectDeck]);

    return (
        <div className="stack gap-8px">
            <h1>Module trasher</h1>
            <div>
                Pick a module to trash for $10.
            </div>
            <div>
                {duplicateModules.map((module, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            onGameAction({
                                type: 'remove-module',
                                modules: [module],
                            });
                            onGameAction({
                                type: 'trigger-effects',
                                effects: [{ type: 'money', moneyShift: 10 }],
                            });
                        }}
                    >
                        <EffectModule module={module} />
                    </button>
                ))}
            </div>
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
    );
};
