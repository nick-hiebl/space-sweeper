import { useExternalStore } from '../../common/external-store';

import { useCampaign } from './context';

export const CampaignMapViewer = () => {
	const campaign = useCampaign();

	const regions = useExternalStore(campaign.mapWatcher);

	return (
		<table>
			<tbody>
				{regions.map((row, index) => {
					return (
						<tr key={index}>
							{row.map(region => {
								return (
									<td key={region.id}>
										<button
											onClick={() => {
												campaign.goTo(region.id);
											}}
										>
											{region.id}
										</button>
									</td>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
