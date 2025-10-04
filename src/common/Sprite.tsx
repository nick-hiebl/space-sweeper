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

type IconType = 'heart' | 'heart-empty' | 'energy' | 'energy-empty' | 'money' | 'forced';

type SpriteProps = SpriteTypeProps & {
    size?: '80';
};

type SpriteId =
    | `chip:${Style}`
    | `number:${Quantity}`
    | `ui-icon:${IconType}`;

const ICON_LABELS: Record<IconType, string> = {
    heart: 'heart',
    'heart-empty': 'empty heart',
    energy: 'energy',
    'energy-empty': 'empty energy',
    money: 'money',
    forced: 'Forced choice',
};

const DATA_URL_MAP = new Map<SpriteId, string>();

type PositionData = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const COMMON = { width: 16, height: 16 };

const POSITION_DATA: Record<SpriteId, PositionData> = {
    'chip:fuel': { x: 0, y: 0, ...COMMON },
    'chip:explosion': { x: 16, y: 0, ...COMMON },
    'chip:asteroid': { x: 32, y: 0, ...COMMON },
    'chip:gear': { x: 48, y: 0, ...COMMON },
    'number:1': { x: 0, y: 16, ...COMMON },
    'number:2': { x: 16, y: 16, ...COMMON },
    'number:3': { x: 32, y: 16, ...COMMON },
    'number:4': { x: 48, y: 16, ...COMMON },
    'number:-quantity': { x: 224, y: 16, ...COMMON },
    'number:quantity': { x: 240, y: 16, ...COMMON },
    'ui-icon:forced': { x: 0, y: 96, ...COMMON },
    'ui-icon:heart': { x: 0, y: 112, ...COMMON },
    'ui-icon:heart-empty': { x: 16, y: 112, ...COMMON },
    'ui-icon:energy': { x: 35, y: 112, width: 10, height: 16 },
    'ui-icon:energy-empty': { x: 51, y: 112, width: 10, height: 16 },
    'ui-icon:money': { x: 64, y: 112, ...COMMON },
};

const LABEL_DATA: Record<SpriteId, string> = {
    'chip:fuel': 'Fuel item',
    'chip:explosion': 'Explosion item',
    'chip:asteroid': 'Asteroid item',
    'chip:gear': 'Wrench item',
    'number:1': '1',
    'number:2': '2',
    'number:3': '3',
    'number:4': '4',
    'number:-quantity': 'Minus item quantity',
    'number:quantity': 'Item quantity',
    'ui-icon:forced': 'Forced selection',
    'ui-icon:heart': 'Heart',
    'ui-icon:heart-empty': 'Empty heart',
    'ui-icon:energy': 'Energy',
    'ui-icon:energy-empty': 'Empty energy',
    'ui-icon:money': 'Money',
};

const propsToSpriteId = (props: SpriteProps): SpriteId => {
    if (props.type === 'number') {
        return `number:${props.value}`;
    } else if (props.type === 'chip') {
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
    const id = propsToSpriteId(props);

    if (DATA_URL_MAP.has(id)) {
        return <img src={DATA_URL_MAP.get(id)} alt={LABEL_DATA[id]} className="sprite" />;
    }

    const dataURI = getDataURI(id);

    DATA_URL_MAP.set(id, dataURI);

    return <img src={DATA_URL_MAP.get(id)} alt={LABEL_DATA[id]} className="sprite" />;
};
