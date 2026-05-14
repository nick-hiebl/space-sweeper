import { useEffect, useRef } from 'react';

import { useExternalStore } from '../../common/external-store';

import { useCampaign } from './context';
import { drawCampaignMap } from './drawCampaignMap';

import './map-styles.css';

export const CampaignMapViewer = () => {
	const campaign = useCampaign();

	const regions = useExternalStore(campaign.mapWatcher);
	const { validNext } = useExternalStore(campaign.regionWatcher);

	const pastRegions = useExternalStore(campaign.pastRegionWatcher);
	const { id } = useExternalStore(campaign.regionWatcher);

	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLCanvasElement>(null);

	const width = regions[0].length * 80;
	const height = regions.length * 80;

	useEffect(() => {
		if (!mapRef.current || !containerRef.current) {
			return;
		}

		mapRef.current.width = width;
		mapRef.current.height = height;

		drawCampaignMap(mapRef.current, regions);
	}, [height, width, regions]);

	return (
		<div className="map-container" ref={containerRef}>
			<canvas className="map-background" ref={mapRef} />
			<div className="map-table" role="table" style={{ width, height }}>
				<div role="rowgroup">
					{regions.map((row, index) => (
						<div role="row" key={index}>
							{row.filter(r => r.activities.length > 0).map(region => (
								<div role="cell" key={region.id} className="map-table-cell" style={{ top: region.y, left: region.x }}>
									<button
										className="map-cell"
										data-visited={region.id === id || pastRegions.some(v => v.id === region.id)}
										onClick={() => {
											campaign.goTo(region.id);
										}}
										disabled={!validNext.includes(region.id)}
									>
										{region.id}
									</button>
								</div>
							)
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
