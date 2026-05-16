import { useExternalStore } from '../../common/external-store';
import { useCampaign } from '../../state/campaigns/context';
import type { ShopActivity } from '../../state/campaigns/types';

type ShopProps = ShopActivity;

export const ShopComponent = (props: ShopProps) => {
    const { healPrice } = props;

    const campaign = useCampaign();

    const stats = useExternalStore(campaign.player.statsWatcher);

    return (
        <div className="stack gap-16px">
            <h2>Shop: {props.name}</h2>
            <div>
                <button
					className="button"
                    disabled={stats.money < healPrice || stats.hitPoints >= stats.maxHitPoints}
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
