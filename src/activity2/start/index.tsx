import { useCampaign } from '../../state/campaigns/context';

export const StartActivity = () => {
	const campaign = useCampaign();

	return (
		<div className="stack gap-16px">
			<h3>Hello</h3>
			<div>
				<button
					className="button"
					onClick={() => campaign.completeCurrentActivity()}
				>
					Done
				</button>
			</div>
		</div>
	);
};
