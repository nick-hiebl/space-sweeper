import type { Campaign, CampaignRegion } from './campaign';


type Props = {
	campaign: Campaign;
	regions: CampaignRegion[][];
};

export const CampaignMapViewer = ({ campaign, regions }: Props) => {
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
