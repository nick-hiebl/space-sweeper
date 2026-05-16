import type { Chip, Quantity, Style } from '../state/types';

import './index.css';

const SPRITE_IMAGE = new Image();
SPRITE_IMAGE.src = './shape-sprites.png';

const PLANET_IMAGE = new Image();
PLANET_IMAGE.src = './planet-sprites.png';

type SpriteSrc = 'planet' | 'sprite';

export const imageReady = new Promise<void>(resolve => {
    const completed: Record<SpriteSrc, boolean> = {
        'sprite': false,
        'planet': false,
    };

    const onComplete = (src: SpriteSrc) => {
        completed[src] = true;

        if (Object.values(completed).every(v => v)) {
            resolve();
        }
    };

    SPRITE_IMAGE.onload = () => onComplete('sprite');
    PLANET_IMAGE.onload = () => onComplete('planet');
});

type SpriteTypeProps =
    | { type: 'chip'; chip: Pick<Chip, 'style'> }
    | { type: 'number'; value: Quantity }
    | { type: 'ui-icon'; icon: IconType }
    | { type: 'planet'; icon: PlanetIcon };

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

export type PlanetIcon =
    | 'earth'
    | 'black-hole';

type SpriteProps = SpriteTypeProps & {
    /**
     * Defaults to 80
     */
    size?: '80' | '16' | '32' | '48' | '64';
};

type SpriteId =
    | `chip:${Style}`
    | `ui-icon:${IconType}`
    | PlanetIcon;

const DATA_URL_MAP = new Map<SpriteId, string>();

type PositionData = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const COMMON = { width: 128, height: 128 };

const POSITION_DATA: Record<SpriteId, PositionData> = {
    // Chips
    'chip:fuel': { x: 0, y: 0, ...COMMON },
    'chip:explosion': { x: 128, y: 0, ...COMMON },
    'chip:asteroid': { x: 256, y: 0, ...COMMON },
    'chip:gear': { x: 384, y: 0, ...COMMON },
    'chip:red': { x: 512, y: 0, ...COMMON },
    'chip:blue': { x: 640, y: 0, ...COMMON },
    'chip:gem': { x: 768, y: 0, ...COMMON },
    'chip:fruit': { x: 896, y: 0, ...COMMON },
    'chip:tree': { x: 1024, y: 0, ...COMMON },
    // UI icons
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
    // Planets
    'earth': { x: 0, y: 0, width: 256, height: 256 },
    'black-hole': { x: 256, y: 0, width: 256, height: 256 },
};

const LABEL_DATA: Record<SpriteId, string> = {
    // Chips
    'chip:fuel': 'Fuel item',
    'chip:explosion': 'Explosion item',
    'chip:asteroid': 'Asteroid item',
    'chip:gear': 'Wrench item',
    'chip:blue': 'Blue item',
    'chip:red': 'Red item',
    'chip:gem': 'Gem item',
    'chip:fruit': 'Fruit item',
    'chip:tree': 'Tree item',
    // UI icon
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
    // Planets
    'earth': 'Earth-like planet',
    'black-hole': 'Black hole',
};

const propsToSpriteId = (props: SpriteProps): SpriteId => {
    if (props.type === 'chip') {
        return `chip:${props.chip.style}`;
    } else if (props.type === 'ui-icon') {
        return `ui-icon:${props.icon}`;
    } else if (props.type === 'planet') {
        return props.icon;
    }

    throw new Error('Trying to parse undefined type');
};

const getDataURI = (id: SpriteId, type: SpriteTypeProps['type']): string => {
    const pos = POSITION_DATA[id];

    const canvas = document.createElement('canvas');
    canvas.width = pos.width;
    canvas.height = pos.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not set up images!');
    }

    const srcImage = type === 'planet' ? PLANET_IMAGE : SPRITE_IMAGE;

    ctx.drawImage(srcImage, pos.x, pos.y, pos.width, pos.height, 0, 0, pos.width, pos.height);

    return canvas.toDataURL();
};

export const Sprite = (props: SpriteProps) => {
    const { size = '80' } = props;

    if (props.type === 'number') {
        const isNegative = typeof props.value === 'number' ? props.value < 0 : props.value.startsWith('-');

        const text = typeof props.value === 'number'
            ? props.value.toString()
            : props.value === '-quantity'
                ? '-X'
                : 'X';

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

    const dataURI = getDataURI(id, props.type);

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
