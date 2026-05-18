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

export type Quantity = number | 'quantity' | '-quantity';

export type Chip = {
    id: Id;
    style: Style;
    quantity: number;
};

export type Weight = Omit<Chip, 'id'>;

export type HealthEffect = {
    type: 'health';
    healthShift: Quantity;
};

export type MoneyEffect = {
    type: 'money';
    moneyShift: Quantity;
};

export type EnergyEffect = {
    type: 'energy';
    energyShift: Quantity;
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

export type AddToBagEffect = {
    type: 'add-to-bag';
    /**
     * These are notated as a weight, but that is just used as a placeholder for a chip without an id
     */
    chips: Weight[];
};

export type MoveEffect = {
    type: 'move';
    distance: Quantity;
};

export type Effect =
    | HealthEffect
    | MoneyEffect
    | EnergyEffect
    | DiscardEffect
    | ForcedEffect
    | MoveEffect
    | AddToBagEffect;

export type Pattern = Style[];

export type PatternEffect = {
    pattern: Pattern;
    effects: Effect[];
};

export type EffectModule = {
    style: Style;
    playEffects?: Effect[];
    drawEffects?: Effect[];
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