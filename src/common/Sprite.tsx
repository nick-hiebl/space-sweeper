import type { Chip, Quantity, Style } from '../state/types';

import './index.css';

const SPRITE_IMAGE = new Image();
SPRITE_IMAGE.src = './shape-sprites.png';

export const imageReady = new Promise<void>(resolve => {
    SPRITE_IMAGE.onload = () => {
        resolve();
    };
});

type SpriteTypeProps =
    | { type: 'chip'; chip: Pick<Chip, 'style'> }
    | { type: 'number'; value: Quantity }
    | { type: 'ui-icon'; icon: IconType };

type IconType =
    | 'heart'
    | 'heart-empty'
    | 'energy'
    | 'energy-empty'
    | 'money'
    | 'no-money'
    | 'forced'
    | 'draw'
    | 'play'
    | 'do-nothing'
    | 'arrow';

type SpriteProps = SpriteTypeProps & {
    /**
     * Defaults to 80
     */
    size?: '80' | '16' | '32' | '48' | '64';
};

type SpriteId =
    | `chip:${Style}`
    | `ui-icon:${IconType}`;

const DATA_URL_MAP = new Map<SpriteId, string>();

type PositionData = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const COMMON = { width: 128, height: 128 };

const POSITION_DATA: Record<SpriteId, PositionData> = {
    'chip:fuel': { x: 0, y: 0, ...COMMON },
    'chip:explosion': { x: 128, y: 0, ...COMMON },
    'chip:asteroid': { x: 256, y: 0, ...COMMON },
    'chip:gear': { x: 384, y: 0, ...COMMON },
    'chip:red': { x: 512, y: 0, ...COMMON },
    'chip:blue': { x: 640, y: 0, ...COMMON },
    'ui-icon:forced': { x: 0, y: 768, ...COMMON },
    'ui-icon:heart': { x: 0, y: 896, ...COMMON },
    'ui-icon:heart-empty': { x: 128, y: 896, ...COMMON },
    'ui-icon:energy': { x: 256, y: 896, ...COMMON },
    'ui-icon:energy-empty': { x: 384, y: 896, ...COMMON },
    'ui-icon:money': { x: 512, y: 896, ...COMMON },
    'ui-icon:no-money': { x: 640, y: 896, ...COMMON },
    'ui-icon:draw': { x: 128, y: 768, ...COMMON },
    'ui-icon:play': { x: 256, y: 768, ...COMMON },
    'ui-icon:do-nothing': { x: 384, y: 768, ...COMMON },
    'ui-icon:arrow': { x: 1920, y: 896, ...COMMON },
};

const LABEL_DATA: Record<SpriteId, string> = {
    'chip:fuel': 'Fuel item',
    'chip:explosion': 'Explosion item',
    'chip:asteroid': 'Asteroid item',
    'chip:gear': 'Wrench item',
    'chip:blue': 'Blue item',
    'chip:red': 'Red item',
    'ui-icon:forced': 'Forced selection',
    'ui-icon:heart': 'Heart',
    'ui-icon:heart-empty': 'Empty heart',
    'ui-icon:energy': 'Energy',
    'ui-icon:energy-empty': 'Empty energy',
    'ui-icon:money': 'Money',
    'ui-icon:no-money': 'No money',
    'ui-icon:draw': 'When drawing an item',
    'ui-icon:play': 'When playing an item',
    'ui-icon:do-nothing': 'Do nothing',
    'ui-icon:arrow': 'causes',
};

const propsToSpriteId = (props: SpriteProps): SpriteId => {
    if (props.type === 'chip') {
        return `chip:${props.chip.style}`;
    } else if (props.type === 'ui-icon') {
        return `ui-icon:${props.icon}`;
    }

    throw new Error('Trying to parse undefined type');
};

const getDataURI = (id: SpriteId): string => {
    const pos = POSITION_DATA[id];

    const canvas = document.createElement('canvas');
    canvas.width = pos.width;
    canvas.height = pos.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not set up images!');
    }

    ctx.drawImage(SPRITE_IMAGE, pos.x, pos.y, pos.width, pos.height, 0, 0, pos.width, pos.height);

    return canvas.toDataURL();
};

export const Sprite = (props: SpriteProps) => {
    const { size = '80' } = props;

    if (props.type === 'number') {
        const isNegative = typeof props.value === 'number' ? props.value < 0 : props.value.startsWith('-');

        const text = typeof props.value === 'number'
            ? props.value.toString()
            : props.value === '-quantity'
                ? '-?'
                : '?';

        return (
            <div className="sprite-number" data-size={size} data-red={isNegative}>
                {text}
            </div>
        );
    }

    const id = propsToSpriteId(props);

    if (DATA_URL_MAP.has(id)) {
        return <img src={DATA_URL_MAP.get(id)} alt={LABEL_DATA[id]} className="sprite" data-size={size} />;
    }

    const dataURI = getDataURI(id);

    DATA_URL_MAP.set(id, dataURI);

    return <img src={DATA_URL_MAP.get(id)} alt={LABEL_DATA[id]} className="sprite" data-size={size} />;
};

export const JumpySprite = (props: SpriteProps & { index: number }) => {
    return (
        <div
            className="jumpy-sprite"
            key={props.type + (props.type === 'ui-icon' ? props.icon : '')}
            style={{ animationDelay: `${props.index * 0.03}s` }}
        >
            <Sprite {...props} />
        </div>
    );
};
