import { Activity, ActivityManager, ActivitySignal } from './campaign';

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

export type Id = number;

export type Quantity = number | 'Y' | '-Y' | { type: 'add'; args: Quantity[] };

export type Chip = {
    id: Id;
    style: Style;
    quantity: number;
};

export type Weight = Omit<Chip, 'id'>;

export type ChipEffect<T> = Omit<Chip, 'id' | 'quantity'> & { quantity: T };

export type HealthEffect<T = number | Quantity> = {
    type: 'health';
    healthShift: T;
};

export type MoneyEffect<T = number | Quantity> = {
    type: 'money';
    moneyShift: T;
};

export type EnergyEffect<T = number | Quantity> = {
    type: 'energy';
    energyShift: T;
};

/**
 * I have no idea what this is for.
 */
export type DiscardEffect = {
    type: 'discard';
};

export type ForcedEffect = {
    type: 'forced';
};

export type AddToBagEffect<T = number | Quantity> = {
    type: 'add-to-bag';
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

export type Pattern = Style[];

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

export type GameState = {
    bag: Chip[];
    effectDeck: EffectModule[];
    energy: number;
    maxEnergy: number;
    hitPoints: number;
    maxHitPoints: number;
    money: number;
    weights: Weight[];
    currentActivity: Activity;
};

export type GameStateWithCampaign<T> = GameState & {
    campaign: ActivityManager<T>;
    campaignData: T;
};

type UpdatableStats = 'maxEnergy' | 'maxHitPoints' | 'energy' | 'hitPoints' | 'money';

export type GameAction =
    | { type: 'trigger-effects'; effects: Effect[] }
    | { type: 'add-chip'; chips: Omit<Chip, 'id'>[] }
    | { type: 'add-module'; modules: EffectModule[] }
    | { type: 'add-weight'; weights: Weight[] }
    | { type: 'remove-chip'; chips: Id[] }
    | { type: 'remove-module'; modules: EffectModule[] }
    | {
        type: 'update-stats';
        newStats: Partial<Pick<GameState, UpdatableStats>> & Partial<Record<Exclude<keyof GameState, UpdatableStats>, never>>;
    }
    | ActivitySignal;