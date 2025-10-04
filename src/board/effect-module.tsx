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
                    <Sprite type="number" value={effect.energyShift} />
                </div>
            </div>
        );
    } else if (effect.type === 'health') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="heart" />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.healthShift} />
                </div>
            </div>
        );
    } else if (effect.type === 'money') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="money" />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.moneyShift} />
                </div>
            </div>
        );
    } else if (effect.type === 'forced') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="forced" />
            </div>
        );
    }

    return null;
};

export const EffectModule = (props: EffectModuleProps) => {
    return (
        <div className="effect-module" data-isHighlighted={props.isHighlighted}>
            <Sprite type="chip" chip={{ style: props.module.style }} />
            <Sprite type="ui-icon" icon="arrow" />
            {props.module.effects.map((effect, index) => (
                <Effect key={index} effect={effect} />
            ))}
        </div>
    );
};
