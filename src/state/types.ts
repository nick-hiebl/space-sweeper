export type Style =
    | 'explosion'
    | 'gear'
    | 'fuel'
    | 'asteroid'
    | 'red'
    | 'blue';

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

export type DiscardEffect = {
    type: 'discard';
};

export type ForcedEffect = {
    type: 'forced';
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
    | MoveEffect;

export type EffectModule = {
    style: Style;
    effects: Effect[];
};

export type Activity = 'start' | 'board' | 'board-finished' | 'shop';

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

export type GameAction =
    | { type: 'trigger-effects'; effects: Effect[] }
    | { type: 'add-chip'; partialChip: Omit<Chip, 'id'> }
    | { type: 'add-module'; module: EffectModule }
    | { type: 'start-board' }
    | { type: 'end-board' }
    | { type: 'leave-board' }
    | { type: 'leave-shop' };
