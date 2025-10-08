import type { EffectModule as EffectModuleType } from '../../../state/types';
import type { TutorialProps } from '../types';

import '../index.css';
import { EffectModule } from '../../../board/effect-module';

const SAMPLE_EXPLOSION_MODULE: EffectModuleType = {
    style: 'explosion',
    playEffects: [{ type: 'move', distance: 1 }],
    drawEffects: [{ type: 'health', healthShift: '-quantity' }],
};

const SAMPLE_GEAR_MODULE: EffectModuleType = {
    style: 'gear',
    playEffects: [
        { type: 'health', healthShift: 1 },
    ],
};

export const Explosions = ({ gameState, onComplete, onGameAction }: TutorialProps) => {
    return (
        <div className="tutorial">
            <h1>Heating up</h1>
            <p>
                Now that you understand how your energy works, it's time to talk about how your
                health works. Certain triggers can cause you to lose HP.
            </p>
            <div className="stack-center">
                <EffectModule module={SAMPLE_EXPLOSION_MODULE} />
                <p style={{ maxWidth: '480px', textAlign: 'center' }}>
                    This module will be placed one space further than normal, but also cost you hit
                    points equal to its number when you <strong>draw</strong> it.
                </p>
            </div>
            <div>
                This module seems like a straightforward item in your bag on its own, however
                usually it doesn't behave like a normal item in your bag. Generally there will be
                explosion items <strong>always</strong> present in your bag. So even after you draw
                them there will always be another one present.
            </div>
            <p>
                With this you can be extremely unlucky and draw them multiple times in a row, or
                you could be lucky and not draw one for a long time.
            </p>
            <p>
                Conveniently, to help you manage your hit points you also have this item:
            </p>
            <div className="stack-center">
                <EffectModule module={SAMPLE_GEAR_MODULE} />
                <p>When played, this module will restore one hit point.</p>
            </div>
            <p>
                Now we're going to drop you into a longer-form version of the game.
            </p>
            <div>
                <button onClick={() => {
                    if (!gameState.weights.some(weight => weight.style === 'explosion' && weight.quantity >= 1)) {
                        onGameAction({ type: 'add-weight', weights: [{ style: 'explosion', quantity: 1 }] })
                    }

                    onGameAction({
                        type: 'update-stats',
                        newStats: {
                            maxHitPoints: 4,
                            hitPoints: 4,
                            maxEnergy: 8,
                            energy: 8,
                            money: 0,
                        },
                    });

                    onGameAction({
                        type: 'add-chip',
                        chips: [
                            { style: 'gear', quantity: 1 },
                            { style: 'gear', quantity: 1 },
                            { style: 'asteroid', quantity: 1 },
                            { style: 'asteroid', quantity: 1 },
                            { style: 'fuel', quantity: 1 },
                            { style: 'fuel', quantity: 1 },
                        ],
                    })

                    onComplete();
                }}>I'm ready to go!</button>
            </div>
        </div>
    );
};
