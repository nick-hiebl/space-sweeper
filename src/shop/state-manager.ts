import type { EffectModule, GameState } from '../state/types';

import type { ShopAction, ShopState } from './types';

const DEFAULT_BETTER_FUEL_MODULE: EffectModule = {
    style: 'fuel', effects: [{ type: 'energy', energyShift: 'quantity' }],
};

export const getDefaultShop = (state: GameState): ShopState => {
    return {
        rebootPrice: 2,
        healPrice: 1,
        sales: [
            { price: 2, remaining: -1, chip: { style: 'fuel', quantity: 2 } },
            { price: 1, remaining: 2, chip: { style: 'asteroid', quantity: 1 } },
        ],
        modules: [
            { price: 5, sold: false, module: DEFAULT_BETTER_FUEL_MODULE },
        ],
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