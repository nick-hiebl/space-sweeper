import { useReducer } from 'react';

import { EffectModule } from '../board/effect-module';
import { ChipDisplay } from '../common/ChipDisplay';
import { GameAction, GameState } from '../state/types';

import { getDefaultShop, ShopStateManager } from './state-manager';

import './index.css';

type Props = {
    state: GameState;
    onGameAction: (action: GameAction) => void;
};

export const Shop = ({ state, onGameAction }: Props) => {
    const [shopState, onShopAction] = useReducer(ShopStateManager, getDefaultShop(state));

    return (
        <div id="shop">
            <h2>Heal</h2>
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
            </div>
            {shopState.sales.length > 0 && (
                <div>
                    <h2>Buy chips</h2>
                    <div id="buy-chips">
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
                                        chips: [sale.chip],
                                    });
                                }}
                            >
                                <div className="stack-center">
                                    <ChipDisplay chip={sale.chip} />
                                    {sale.remaining === -1 ? 'No limit' : `${sale.remaining} left`} (${sale.price})
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {shopState.modules.length > 0 && (
                <div>
                    <h2>Buy modules</h2>
                    <div id="buy-modules">
                        {shopState.modules.map((sale, index) => (
                            <button
                                key={index}
                                disabled={sale.price > state.money || sale.sold}
                                onClick={() => {
                                    onGameAction({
                                        type: 'trigger-effects',
                                        effects: [{ type: 'money', moneyShift: -sale.price }],
                                    });
                                    onShopAction({
                                        type: 'buy-module',
                                        module: sale.module,
                                    });
                                    onGameAction({
                                        type: 'add-module',
                                        modules: [sale.module],
                                    });
                                }}
                            >
                                <EffectModule module={sale.module} />
                                {sale.sold ? 'Sold' : `$${sale.price}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div id="actions">
                <button
                    onClick={() => {
                        onGameAction({
                            type: 'trigger-effects',
                            effects: [{ type: 'energy', energyShift: state.maxEnergy }],
                        });
                        onGameAction({
                            type: 'activity-signal',
                            signal: 'finish-shop',
                        });
                    }}
                >
                    Leave shop
                </button>
            </div>
            <h2>Bag</h2>
            <div id="bag">
                {state.bag.map(chip => (
                    <ChipDisplay key={chip.id} chip={chip} />
                ))}
            </div>
            <h2>Always present in your bag</h2>
            <div id="weights">
                {state.weights.map((weight, index) => (
                    <ChipDisplay key={index} chip={weight} />
                ))}
            </div>
        </div>
    );
};
