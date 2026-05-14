import { useEffect, useRef } from 'react';
import { useExternalStore } from '../../common/external-store';

import { useCampaign } from './context';

import './map-styles.css';
import { drawCampaignMap } from './drawCampaignMap';

export const CampaignMapViewer = () => {
	const campaign = useCampaign();

	const regions = useExternalStore(campaign.mapWatcher);
	const { validNext } = useExternalStore(campaign.regionWatcher);

	const pastRegions = useExternalStore(campaign.pastRegionWatcher);
	const { id } = useExternalStore(campaign.regionWatcher);

	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!mapRef.current || !containerRef.current) {
			return;
		}

		mapRef.current.width = regions[0].length * 80;
		mapRef.current.height = regions.length * 80;

		drawCampaignMap(mapRef.current, regions);
	}, [regions]);

	return (
		<div className="map-container" ref={containerRef}>
			<canvas className="map-background" ref={mapRef} />
			<table className="map-table">
				<tbody>
					{regions.map((row, index) => (
						<tr key={index}>
							{row.map(region => (
								<td key={region.id} className="map-table-cell">
									<div className="map-cell">
										<button
											data-visited={region.id === id || pastRegions.some(v => v.id === region.id)}
											onClick={() => {
												campaign.goTo(region.id);
											}}
											disabled={!validNext.includes(region.id)}
										>
											{region.id}
										</button>
									</div>
								</td>
							)
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
