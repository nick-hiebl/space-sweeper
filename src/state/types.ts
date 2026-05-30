import { Activity } from './campaign';

export type Style =
    | 'explosion'
    | 'gear'
    | 'fuel'
    | 'asteroid'
    | 'red'
    | 'blue'
    | 'gem'
    | 'fruit'
    | 'tree'
    | 'ice';

type Id = number;

/**
 * 'Y' was chosen as the placeholder in types for 'X' in order to make it easier to find in code.
 */
export type Quantity =
    | number
    | 'Y' | '-Y'
    | { type: 'add'; args: Quantity[] }
    | { type: 'multiply'; args: Quantity[] };

export type Chip = {
    id: Id;
    style: Style;
    quantity: number;
};

export type Weight = Omit<Chip, 'id'>;

export type ChipEffect<T> = Omit<Chip, 'id' | 'quantity'> & { quantity: T };

type HealthEffect<T = number | Quantity> = {
    type: 'health';
    healthShift: T;
};

type MoneyEffect<T = number | Quantity> = {
    type: 'money';
    moneyShift: T;
};

type EnergyEffect<T = number | Quantity> = {
    type: 'energy';
    energyShift: T;
};

/**
 * I have no idea what this is for.
 */
type DiscardEffect = {
    type: 'discard';
};

type ForcedEffect = {
    type: 'forced';
};

type AddToBagEffect<T = number | Quantity> = {
    type: 'add-to-bag';
    transform?: boolean;
    /**
     * These are notated as a weight, but that is just used as a placeholder for a chip without an id
     */
    chips: ChipEffect<T>[];
};

export type MoveEffect<T = number | Quantity> = {
    type: 'move';
    distance: T;
};

export type Effect<T = number | Quantity> =
    | HealthEffect<T>
    | MoneyEffect<T>
    | EnergyEffect<T>
    | DiscardEffect
    | ForcedEffect
    | MoveEffect<T>
    | AddToBagEffect<T>;

type Pattern = Style[];

export type PatternEffect = {
    pattern: Pattern;
    effects: Effect[];
};

export type EffectModule = {
    style: Style;
    text: string;
    playEffects?: Effect[];
    drawEffects?: Effect[];
    returnToBagEffects?: Effect[];
    patternEffects?: PatternEffect[];
};
