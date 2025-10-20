import { Sprite } from '../common/Sprite';
import type { Effect as EffectType, EffectModule as EffectModuleType, Effect, PatternEffect, Style } from '../state/types';

type EffectModuleProps = {
    module: EffectModuleType;
    isHighlighted?: boolean;
};

export const DisplayEffect = ({ effect, size }: { effect: EffectType, size?: 'regular' | 'small' }) => {
    if (effect.type === 'discard') {
        return <div className="effect">discard</div>;
    } else if (effect.type === 'energy') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="energy" size={size === 'regular' ? '80' : '48'} />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.energyShift} size={size === 'regular' ? '48' : '32'} />
                </div>
            </div>
        );
    } else if (effect.type === 'health') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="heart" size={size === 'regular' ? '80' : '48'} />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.healthShift} size={size === 'regular' ? '48' : '32'} />
                </div>
            </div>
        );
    } else if (effect.type === 'money') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="money" size={size === 'regular' ? '80' : '48'} />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.moneyShift} size={size === 'regular' ? '48' : '32'} />
                </div>
            </div>
        );
    } else if (effect.type === 'forced') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="forced" size={size === 'regular' ? '80' : '48'} />
            </div>
        );
    } else if (effect.type === 'move') {
        return (
            <div className="effect">
                <Sprite type="ui-icon" icon="arrow" size={size === 'regular' ? '80' : '48'} />
                <div className="number-overlay">
                    <Sprite type="number" value={effect.distance} size={size === 'regular' ? '48' : '32'} />
                </div>
            </div>
        )
    }

    return null;
};

export const EffectModule = ({ isHighlighted, module }: EffectModuleProps) => {
    const anyEffects = (module.playEffects ?? [] as (Effect | PatternEffect)[])
        .concat(module.drawEffects ?? [])
        .concat(module.patternEffects ?? []);

    return (
        <div className="effect-module stack-center" data-ishighlighted={isHighlighted}>
            <Sprite type="chip" chip={{ style: module.style }} />
            {module.playEffects && (
                <div className="inline-center">
                    <Sprite type="ui-icon" icon="play" />
                    <Sprite type="ui-icon" icon="arrow" size="32" />
                    {module.playEffects.map((effect, index) => (
                        <DisplayEffect key={index} effect={effect} />
                    ))}
                </div>
            )}
            {module.drawEffects && (
                <div className="inline-center">
                    <Sprite type="ui-icon" icon="draw" />
                    <Sprite type="ui-icon" icon="arrow" size="32" />
                    {module.drawEffects.map((effect, index) => (
                        <DisplayEffect key={index} effect={effect} />
                    ))}
                </div>
            )}
            {module.patternEffects && (
                <div className="stack">
                    {module.patternEffects.map((patternEffect, index) => (
                        <div className="inline-center" key={index}>
                            <div className="inline-center">
                                {patternEffect.pattern.reduce((iter: Style[], style: Style) => {
                                    return [style].concat(iter);
                                }, []).map((style, index) => (
                                    <Sprite key={index} type="chip" chip={{ style }} size="32" />
                                ))}
                            </div>
                            <Sprite type="ui-icon" icon="arrow" size="32" />
                            {patternEffect.effects.map((effect, index) => (
                                <DisplayEffect key={index} effect={effect} />
                            ))}
                        </div>

                    ))}
                </div>
            )}
            {anyEffects.length === 0 && (
                <Sprite type="ui-icon" icon="do-nothing" />
            )}
        </div>
    );
};
