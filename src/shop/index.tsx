import { useReducer } from 'react';

import { getDefaultShop, ShopStateManager } from './state-manager';
import { GameAction, GameState } from '../state/types';
import { ChipDisplay } from '../common/ChipDisplay';

type Props = {
    state: GameState;
    onGameAction: (action: GameAction) => void;
};

export const Shop = ({ state, onGameAction }: Props) => {
    const [shopState, onShopAction] = useReducer(ShopStateManager, getDefaultShop(state));

    return (
        <div id="shop">
            <div id="healing">
                <button
                    disabled={state.hitPoints > 0 || state.money < shopState.rebootPrice}
                    onClick={() => {
                        onGameAction({
                            type: 'trigger-effects',
                            effects: [
                                { type: 'money', moneyShift: -shopState.rebootPrice },
                                { type: 'health', healthShift: 1 },
                            ],
                        });
                    }}
                >
                    Reboot (${shopState.rebootPrice})
                </button>
                <button
                    disabled={
                        state.hitPoints <= 0 || state.hitPoints >= state.maxHitPoints || state.money < shopState.healPrice
                    }
                    onClick={() => {
                        onGameAction({
                            type: 'trigger-effects',
                            effects: [
                                { type: 'money', moneyShift: -shopState.healPrice },
                                { type: 'health', healthShift: 1 },
                            ],
                        });
                    }}
                >
                    Heal (${shopState.healPrice})
                </button>
                {shopState.sales.map((sale, index) => (
                    <button
                        key={index}
                        disabled={sale.price > state.money || sale.remaining === 0}
                        onClick={() => {
                            onGameAction({
                                type: 'trigger-effects',
                                effects: [{ type: 'money', moneyShift: -sale.price }],
                            });
                            onShopAction({
                                type: 'buy',
                                chip: sale.chip,
                            });
                            onGameAction({
                                type: 'add-chip',
                                partialChip: sale.chip,
                            });
                        }}
                    >
                        <ChipDisplay chip={sale.chip} />
                        {sale.remaining === -1 ? 'No limit' : `${sale.remaining} left`} (${sale.price})
                    </button>
                ))}
                <button
                    onClick={() => {
                        onGameAction({
                            type: 'trigger-effects',
                            effects: [{ type: 'energy', energyShift: state.maxEnergy }],
                        });
                        onGameAction({ type: 'leave-shop' });
                    }}
                >
                    Leave shop
                </button>
            </div>
        </div>
    );
};
