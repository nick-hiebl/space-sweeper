import { useExternalStore } from '../common/external-store';
import { useCampaign } from '../state/campaigns/context';

export const RegionComponent = () => {
	const campaign = useCampaign();

	const { completed, energy, maxEnergy, name, activities } = useExternalStore(campaign.regionWatcher);
	const act = useExternalStore(campaign.activity);

	const inHubActivity = act.type === 'hub';

	return (
		<div className="stack gap-16px">
			<h2>Region: {name}</h2>
			<div>Activity energy: {energy}/{maxEnergy}</div>
			<div className="inline gap-8px">
				{activities.map(a => (
					<button
						className="button"
						key={a.data.type}
						disabled={a.completed || inHubActivity || energy <= 0}
						onClick={() => {
							campaign.startActivity(a);
						}}
					>
						{a.data.name}
					</button>
				))}
			</div>
			{!inHubActivity && (
				<div>
					<button
						className="button"
						disabled={completed}
						onClick={() => {
							campaign.completeRegion();
						}}
					>
						Leave planet
					</button>
				</div>
			)}
		</div>
	);
};
