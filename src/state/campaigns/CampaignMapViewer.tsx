import { useExternalStore } from '../../common/external-store';

import { useCampaign } from './context';

import './map-styles.css';

export const CampaignMapViewer = () => {
	const campaign = useCampaign();

	const regions = useExternalStore(campaign.mapWatcher);
	const { validNext } = useExternalStore(campaign.regionWatcher);

	const pastRegions = useExternalStore(campaign.pastRegionWatcher);
	const { id } = useExternalStore(campaign.regionWatcher);

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
											data-visited={region.id === id || pastRegions.some(v => v.id === region.id)}
											onClick={() => {
												campaign.goTo(region.id);
											}}
											disabled={!validNext.includes(region.id)}
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
