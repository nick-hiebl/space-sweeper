import { useState } from 'react';

import { EffectModule } from '../../board/effect-module';
import { ChipDisplay } from '../../common/ChipDisplay';
import { useExternalStore } from '../../common/external-store';
import { useCampaign } from '../../state/campaigns/context';
import type { ShopActivity } from '../../state/campaigns/types';

type ShopProps = ShopActivity;

export const ShopComponent = (props: ShopProps) => {
    const { healPrice, sales } = props;

    const campaign = useCampaign();

    const { money, hitPoints, maxHitPoints } = useExternalStore(campaign.player.statsWatcher);

    const [realSales, setRealSales] = useState(sales.map(sale => ({ ...sale, sold: 0 })));

    return (
        <div className="stack gap-16px">
            <h2>Shop: {props.name}</h2>
            <div>
                <button
                    className="button"
                    disabled={money < healPrice || hitPoints >= maxHitPoints}
                    onClick={() => {
                        campaign.player.triggerEffects([
                            { type: 'money', moneyShift: -healPrice },
                            { type: 'health', healthShift: 1 },
                        ]);
                    }}
                >
                    Heal: ${healPrice}
                </button>
            </div>
            {realSales.length > 0 && (
                <ul className="inline gap-16px wrap">
                    {realSales.map(realSale => (
                        <button
                            className="button inline-center gap-16px"
                            disabled={
                                realSale.sold >= realSale.repeats ||
                                realSale.cost > money
                            }
                            onClick={() => {
                                campaign.player.triggerEffects([{ type: 'money', moneyShift: -realSale.cost }]);

                                if (realSale.chips) {
                                    campaign.player.addChips(realSale.chips);
                                }

                                if (realSale.modules) {
                                    campaign.player.addModules(realSale.modules);
                                }

                                setRealSales(current =>
                                    current.map(sale =>
                                        sale === realSale
                                            ? ({ ...sale, sold: sale.sold + 1 })
                                            : sale,
                                    ),
                                );
                            }}
                        >
                            <span>${realSale.cost}</span>
                            {realSale.repeats < 99 && (
                                <span>({realSale.sold}/{realSale.repeats})</span>
                            )}
                            <ul>
                                {realSale.chips && (
                                    realSale.chips.map((chip, index) => (
                                        <ChipDisplay key={index} chip={chip} />
                                    ))
                                )}
                                {realSale.modules && (
                                    realSale.modules.map((module, index) => (
                                        <EffectModule key={index} module={module} />
                                    ))
                                )}
                            </ul>
                        </button>
                    ))}
                </ul>
            )}
            <div>
                <button
                    className="button"
                    onClick={() => {
                        campaign.completeCurrentActivity();
                    }}
                >
                    Leave
                </button>
            </div>
        </div>
    );
};
