import { Sprite } from '../common/Sprite';
import type { Effect as EffectType, EffectModule as EffectModuleType } from '../state/types';

type EffectModuleProps = {
    module: EffectModuleType;
    isHighlighted?: boolean;
};

const Effect = ({ effect }: { effect: EffectType }) => {
    if (effect.type === 'discard') {
        return <div className="effect">discard</div>;
    } else if (effect.type === 'energy') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="energy" />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.energyShift} size="48" />
                </div>
            </div>
        );
    } else if (effect.type === 'health') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="heart" />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.healthShift} size="48" />
                </div>
            </div>
        );
    } else if (effect.type === 'money') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="money" />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.moneyShift} size="48" />
                </div>
            </div>
        );
    } else if (effect.type === 'forced') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="forced" />
            </div>
        );
    } else if (effect.type === 'move') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="arrow" />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.distance} size="48" />
                </div>
            </div>
        )
    }

    return null;
};

export const EffectModule = ({ isHighlighted, module }: EffectModuleProps) => {
    return (
        <div className="effect-module stack-center" data-ishighlighted={isHighlighted}>
            <Sprite type="chip" chip={{ style: module.style }} />
            {module.playEffects && (
                <div className="inline-center">
                    <Sprite type="ui-icon" icon="play" />
                    <Sprite type="ui-icon" icon="arrow" size="32" />
                    {module.playEffects.map((effect, index) => (
                        <Effect key={index} effect={effect} />
                    ))}
                </div>
            )}
            {module.drawEffects && (
                <div className="inline-center">
                    <Sprite type="ui-icon" icon="draw" />
                    <Sprite type="ui-icon" icon="arrow" size="32" />
                    {module.drawEffects.map((effect, index) => (
                        <Effect key={index} effect={effect} />
                    ))}
                </div>
            )}
            {!module.drawEffects && !module.playEffects && (
                <Sprite type="ui-icon" icon="do-nothing" />
            )}
        </div>
    );
};
