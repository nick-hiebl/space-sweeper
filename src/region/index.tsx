import { useExternalStore } from '../common/external-store';
import { useCampaign } from '../state/campaigns/context';

export const RegionComponent = () => {
	const campaign = useCampaign();

	const { completed, energy, maxEnergy, name } = useExternalStore(campaign.regionWatcher);

	return (
		<div className="stack gap-16px">
			<h2>Region: {name}</h2>
			<div>Activity energy: {energy}/{maxEnergy}</div>
			<div>
				<button
					disabled={completed}
					onClick={() => {
						campaign.completeRegion();
					}}
				>
					Finish up
				</button>
			</div>
		</div>
	);
};
