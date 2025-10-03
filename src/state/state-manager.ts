import type { Chip, GameAction, GameState, Quantity } from './types';

const readQuantity = (quantity: Quantity, chip: Chip): number => {
    if (quantity === 'quantity') {
        return chip.quantity;
    } else if (quantity === '-quantity') {
        return -chip.quantity;
    }

    return quantity;
};

export const GameStateManager = (state: GameState, action: GameAction): GameState => {
    if (action.type === 'playChip') {
        const relevantRule = action.effectModules.find(module => module.style === action.chip.style);

        if (!relevantRule) {
            console.error('Found no relevant rules', action.effectModules, action.chip);
            throw new Error('No relevant rules for played chip');
        }

        const pendingState = {
            ...state
        };

        relevantRule.effects.forEach(effect => {
            if (effect.type === 'money') {
                pendingState.money += readQuantity(effect.moneyShift, action.chip);
            } else if (effect.type === 'health') {
                pendingState.hitPoints = Math.max(
                    0,
                    Math.min(
                        pendingState.maxHitPoints,
                        pendingState.hitPoints + readQuantity(effect.healthShift, action.chip),
                    ),
                );
            } else if (effect.type === 'energy') {
                pendingState.energy = Math.max(
                    0,
                    Math.min(
                        pendingState.maxEnergy,
                        pendingState.energy + readQuantity(effect.energyShift, action.chip),
                    ),
                );
            }
        });

        return pendingState;
    }

    console.error('Unexpected state and action', state, action);
    throw new Error('Unexpected game state action');
};
