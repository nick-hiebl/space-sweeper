import { getId } from './initialiser';
import type { GameAction, GameState, Quantity } from './types';

const readQuantity = (quantity: Quantity): number => {
    if (quantity === 'quantity' || quantity === '-quantity') {
        throw new Error('Game state manager should not receive quantity');
    }

    return quantity;
};

export const GameStateManager = (state: GameState, action: GameAction): GameState => {
    if (action.type === 'start-board') {
        return {
            ...state,
            currentActivity: 'board',
        };
    } else if (action.type === 'end-board') {
        return {
            ...state,
            currentActivity: 'board-finished',
        };
    } else if (action.type === 'leave-board') {
        return {
            ...state,
            currentActivity: 'shop',
        };
    } else if (action.type === 'leave-shop') {
        return {
            ...state,
            currentActivity: 'board',
        };
    } else if (action.type === 'trigger-effects') {
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

                if (pendingState.hitPoints <= 0 && state.currentActivity === 'board') {
                    pendingState.currentActivity = 'board-finished';
                }
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
    } else if (action.type === 'add-chip') {
        return {
            ...state,
            bag: state.bag.concat({ ...action.partialChip, id: getId() }),
        };
    }

    console.error('Unexpected state and action', state, action);
    throw new Error('Unexpected game state action');
};
