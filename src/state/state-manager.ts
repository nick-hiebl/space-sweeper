import type { Chip, GameAction, GameState, Quantity } from './types';

const readQuantity = (quantity: Quantity): number => {
    if (quantity === 'quantity' || quantity === '-quantity') {
        throw new Error('Game state manager should not receive quantity');
    }

    return quantity;
};

export const GameStateManager = (state: GameState, action: GameAction): GameState => {
    if (action.type === 'trigger-effects') {
        const pendingState = {
            ...state
        };

        action.effects.forEach(effect => {
            if (effect.type === 'money') {
                pendingState.money += readQuantity(effect.moneyShift);
            } else if (effect.type === 'health') {
                pendingState.hitPoints = Math.max(
                    0,
                    Math.min(
                        pendingState.maxHitPoints,
                        pendingState.hitPoints + readQuantity(effect.healthShift),
                    ),
                );
            } else if (effect.type === 'energy') {
                pendingState.energy = Math.max(
                    0,
                    Math.min(
                        pendingState.maxEnergy,
                        pendingState.energy + readQuantity(effect.energyShift),
                    ),
                );
            }
        });

        return pendingState;
    }

    console.error('Unexpected state and action', state, action);
    throw new Error('Unexpected game state action');
};
