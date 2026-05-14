import { SpecificCampaignActivity } from '../state/campaigns/types';

type RenderActivityProps = {
	activity: SpecificCampaignActivity;
};

export const RenderActivity = ({ activity }: RenderActivityProps) => {
	const Component = activity.Component as React.ComponentType<typeof activity.data>;

	return <Component {...activity.data} />;
};
