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
    | 'transform'
    | 'forced'
    | 'draw'
    | 'play'
    | 'do-nothing'
    | 'bag'
    | 'return-to-bag'
    | 'add-to-bag'
    | 'heart'
    | 'heart-empty'
    | 'energy'
    | 'energy-empty'
    | 'money'
    | 'no-money'
    | 'arrow';

export type PlanetIcon =
    | 'earth'
    | 'black-hole'
    | 'ice'
    | 'gas-giant'
    | 'moon'
    | 'quasar'
    | 'belt';

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

const commonDetails = (x: number, y: number) => ({
    x: x * 128, y: y * 128, ...COMMON,
});

const planetDetails = (x: number, y: number) => ({
    x: x * 256, y: y * 256, width: 256, height: 256,
});

const ICON_BOTTOM_2 = 6;
const ICON_BOTTOM = 7;

const POSITION_DATA: Record<SpriteId, PositionData> = {
    // Chips
    'chip:fuel': commonDetails(0, 0),
    'chip:explosion': commonDetails(1, 0),
    'chip:asteroid': commonDetails(2, 0),
    'chip:gear': commonDetails(3, 0),
    'chip:red': commonDetails(4, 0),
    'chip:blue': commonDetails(5, 0),
    'chip:gem': commonDetails(6, 0),
    'chip:fruit': commonDetails(7, 0),
    'chip:tree': commonDetails(8, 0),
    'chip:ice': commonDetails(9, 0),
    // UI icons
    'ui-icon:transform': commonDetails(0, ICON_BOTTOM_2 - 1),
    'ui-icon:forced': commonDetails(0, ICON_BOTTOM_2),
    'ui-icon:draw': commonDetails(1, ICON_BOTTOM_2),
    'ui-icon:play': commonDetails(2, ICON_BOTTOM_2),
    'ui-icon:do-nothing': commonDetails(3, ICON_BOTTOM_2),
    'ui-icon:bag': commonDetails(4, ICON_BOTTOM_2),
    'ui-icon:return-to-bag': commonDetails(5, ICON_BOTTOM_2),
    'ui-icon:add-to-bag': commonDetails(6, ICON_BOTTOM_2),

    'ui-icon:heart': commonDetails(0, ICON_BOTTOM),
    'ui-icon:heart-empty': commonDetails(1, ICON_BOTTOM),
    'ui-icon:energy': commonDetails(2, ICON_BOTTOM),
    'ui-icon:energy-empty': commonDetails(3, ICON_BOTTOM),
    'ui-icon:money': commonDetails(4, ICON_BOTTOM),
    'ui-icon:no-money': commonDetails(5, ICON_BOTTOM),
    'ui-icon:arrow': commonDetails(15, ICON_BOTTOM),
    // Planets
    'earth': planetDetails(0, 0),
    'black-hole': planetDetails(1, 0),
    'ice': planetDetails(2, 0),
    'gas-giant': planetDetails(3, 0),
    'moon': planetDetails(4, 0),
    'quasar': planetDetails(5, 0),
    'belt': planetDetails(6, 0),
};

export const LABEL_DATA: Record<SpriteId, string> = {
    // Chips
    'chip:fuel': 'Fuel',
    'chip:explosion': 'Explosion',
    'chip:asteroid': 'Asteroid',
    'chip:gear': 'Wrench',
    'chip:blue': 'Blue item',
    'chip:red': 'Red item',
    'chip:gem': 'Gem item',
    'chip:fruit': 'Fruit item',
    'chip:tree': 'Tree item',
    'chip:ice': 'Ice item',
    // UI icon
    'ui-icon:transform': 'Transform',
    'ui-icon:forced': 'Forced selection',
    'ui-icon:draw': 'When drawing an item',
    'ui-icon:play': 'When playing an item',
    'ui-icon:do-nothing': 'Do nothing',
    'ui-icon:bag': 'Bag',
    'ui-icon:return-to-bag': 'Return to bag',
    'ui-icon:add-to-bag': 'Add to bag',

    'ui-icon:heart': 'Heart',
    'ui-icon:heart-empty': 'Empty heart',
    'ui-icon:energy': 'Energy',
    'ui-icon:energy-empty': 'Empty energy',
    'ui-icon:money': 'Money',
    'ui-icon:no-money': 'No money',
    'ui-icon:arrow': 'causes',
    // Planets
    'earth': 'Earth-like planet',
    'black-hole': 'Black hole',
    'ice': 'Ice planet',
    'gas-giant': 'Gas giant',
    'moon': 'Moon',
    'quasar': 'Quasar',
    'belt': 'Asteroid belt',
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

type QuantityStringData = {
    text: string;
    needsParens: boolean;
};

const quantityToString = (quantity: Quantity): QuantityStringData => {
    if (typeof quantity === 'number') {
        return {
            text: quantity.toString(),
            needsParens: false,
        };
    }

    if (quantity === 'Y') return { text: 'X', needsParens: false };
    if (quantity === '-Y') return { text: '-X', needsParens: false };

    if (quantity.type === 'add') {
        return {
            text: quantity.args.map(quantityToString).map(v => v.text).join('+'),
            needsParens: true,
        };
    } else if (quantity.type === 'multiply') {
        return {
            text: quantity.args
                .map(quantityToString)
                .map(({ text, needsParens}) => needsParens ? `(${text})` : text)
                .join(''),
            needsParens: false,
        }
    }

    throw new Error('Unexpected quantity type!');
};

export const Sprite = (props: SpriteProps) => {
    const { size = '80' } = props;

    if (props.type === 'number') {
        const isNegative = typeof props.value === 'number'
            ? props.value < 0
            : typeof props.value === 'string'
                ? props.value.startsWith('-')
                : false;

        const { text } = quantityToString(props.value);

        return (
            <div
                className="sprite-number"
                data-small={typeof props.value === 'object'}
                data-size={size}
                data-red={isNegative}
            >
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
