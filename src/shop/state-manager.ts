import type { GameState } from '../state/types';

import type { ShopAction, ShopState } from './types';

export const getDefaultShop = (state: GameState): ShopState => {
    return {
        rebootPrice: 2,
        healPrice: 1,
        sales: [
            { price: 2, remaining: -1, chip: { style: 'fuel', quantity: 2 } },
            { price: 1, remaining: 2, chip: { style: 'asteroid', quantity: 1 } },
        ]
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
        } else {
            return {
                ...state,
                sales: state.sales.map(sale => sale === relevantSale
                    ? { ...relevantSale, remaining: relevantSale.remaining - 1 }
                    : sale,
                ),
            };
        }
    }

    console.error('Unexpected ShopState state and action', state, action);
    throw new Error('Unexpected ShopState action');
}