import type { Chip, Quantity } from '../state/types';

import './index.css';

type SpriteTypeProps =
    | { type: 'chip'; chip: Pick<Chip, 'style'> }
    | { type: 'number'; value: Quantity }
    | { type: 'ui-icon'; icon: IconType };

type IconType = 'heart' | 'heart-empty' | 'energy' | 'energy-empty' | 'money' | 'forced';

type SpriteProps = SpriteTypeProps & {
    size?: '80';
}

const ICON_LABELS: Record<IconType, string> = {
    heart: 'heart',
    'heart-empty': 'empty heart',
    energy: 'energy',
    'energy-empty': 'empty energy',
    money: 'money',
    forced: 'Forced choice',
};

export const Sprite = (props: SpriteProps) => {
    const { size = '80' } = props;

    if (props.type === 'number') {
        if (props.value === 'quantity' || props.value === '-quantity') {
            return (
                <div
                    aria-label={props.value.toString()}
                    className={`sprite-sheet number q${props.value} size-${size}`}
                />
            );
        }

        if (props.value !== 1 && props.value !== 2 && props.value !== 3 && props.value !== 4) {
            console.error('Invalid Sprite quantity:', props.value);
            throw new Error('Received invalid quantity to Sprite');
        }

        return (
            <div
                aria-label={props.value.toString()}
                className={`sprite-sheet number q${props.value} size-${size}`}
            />
        );
    } else if (props.type === 'chip') {
        return (
            <div
                aria-label={props.chip.style}
                className={`sprite-sheet chip ${props.chip.style} size-${size}`}
            />
        );
    } else if (props.type === 'ui-icon') {
        return (
            <div
                aria-label={ICON_LABELS[props.icon]}
                className={`sprite-sheet icon ${props.icon} size-${size}`}
            />
        );
    }

    return null;
};
