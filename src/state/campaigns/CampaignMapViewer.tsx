import { CampaignRegion } from './campaign';


type Props = {
	regions: CampaignRegion[][];
};

export const CampaignMapViewer = ({ regions }: Props) => {
	return (
		<table>
			<tbody>
				{regions.map((row, index) => {
					return (
						<tr key={index}>
							{row.map(region => {
								return (
									<td key={region.id}>
										<button>{region.id}</button>
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
