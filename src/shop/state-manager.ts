import { selectRandomN } from '../common/random';
import type { EffectModule, GameState } from '../state/types';

import type { ShopAction, ShopState } from './types';

const DEFAULT_BETTER_FUEL_MODULE: EffectModule = {
    style: 'fuel', playEffects: [{ type: 'energy', energyShift: 'quantity' }],
};

const RED_ENERGY_MODULE: EffectModule = {
    style: 'red', drawEffects: [{ type: 'energy', energyShift: 1 }],
};

export const getDefaultShop = (state: GameState): ShopState => {
    return {
        rebootPrice: 2,
        healPrice: 1,
        sales: selectRandomN([
            { price: 1, remaining: 1, chip: { style: 'red', quantity: 1 } },
            { price: 2, remaining: -1, chip: { style: 'fuel', quantity: 2 } },
            { price: 1, remaining: 2, chip: { style: 'asteroid', quantity: 1 } },
            { price: 6, remaining: 1, chip: { style: 'blue', quantity: 4 } },
        ], 2),
        modules: selectRandomN([
            { price: 5, sold: false, module: DEFAULT_BETTER_FUEL_MODULE },
            { price: 6, sold: false, module: RED_ENERGY_MODULE },
        ], 1).filter(sale => !state.effectDeck.some(module => module === sale.module)),
    };
};

export const ShopStateManager = (state: ShopState, action: ShopAction): ShopState => {
    if (action.type === 'buy') {
        const relevantSale = state.sales.find(sale => sale.chip === action.chip);

        if (!relevantSale) {
            console.error('Could not find purchased chip in state', state, action);
            throw new Error('Unexpected ShopState purchase');
        }

        if (relevantSale.remaining === -1) {
            return state;
        } else if (relevantSale.remaining === 0) {
            console.error('Tried to purchase sold out item', state, action);
            throw new Error('Purchased out-of-stock chip');
        } else {
            return {
                ...state,
                sales: state.sales.map(sale => sale === relevantSale
                    ? { ...relevantSale, remaining: relevantSale.remaining - 1 }
                    : sale,
                ),
            };
        }
    } else if (action.type === 'buy-module') {
        const relevantSale = state.modules.find(sale => sale.module === action.module);

        if (!relevantSale) {
            console.error('Could not find purchased module in state', state, action);
            throw new Error('Unexpected ShopState module purchase');
        }

        if (relevantSale.sold) {
            console.error('Tried to purchase sold out module', state, action);
            throw new Error('Purchased out-of-stock module');
        } else {
            return {
                ...state,
                modules: state.modules.map(sale => sale === relevantSale
                    ? { ...relevantSale, sold: true }
                    : sale,
                ),
            };
        }
    }

    console.error('Unexpected ShopState state and action', state, action);
    throw new Error('Unexpected ShopState action');
}