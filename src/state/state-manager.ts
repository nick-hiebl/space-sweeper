import { getId } from './initialiser';
import type { GameAction, GameStateWithCampaign, Quantity } from './types';

const readQuantity = (quantity: Quantity): number => {
    if (quantity === 'quantity' || quantity === '-quantity') {
        throw new Error('Game state manager should not receive quantity');
    }

    return quantity;
};

export const GameStateManager = <T>(state: GameStateWithCampaign<T>, action: GameAction): GameStateWithCampaign<T> => {
    if (action.type === 'activity-signal') {
        const { activity, campaignState } = state.campaign(state, action);

        return {
            ...state,
            currentActivity: activity,
            campaignData: campaignState,
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
            bag: state.bag.concat(action.chips.map(chip => ({ ...chip, id: getId() }))),
        };
    } else if (action.type === 'add-module') {
        return {
            ...state,
            effectDeck: state.effectDeck.concat(action.modules),
        };
    } else if (action.type === 'add-weight') {
        return {
            ...state,
            weights: state.weights.concat(action.weights),
        };
    } else if (action.type === 'update-stats') {
        return {
            ...state,
            ...action.newStats,
        };
    } else if (action.type === 'remove-chip') {
        return {
            ...state,
            bag: state.bag.filter(chip => !action.chips.includes(chip.id)),
        };
    } else if (action.type === 'remove-module') {
        return {
            ...state,
            effectDeck: state.effectDeck.filter(module => !action.modules.includes(module)),
        };
    }

    console.error('Unexpected state and action', state, action);
    throw new Error('Unexpected game state action');
};
