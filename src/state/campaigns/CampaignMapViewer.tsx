import { useEffect, useRef } from 'react';

import { Sprite } from '../../common/Sprite';
import { useExternalStore } from '../../common/external-store';

import { X_SCALE, Y_SCALE } from './constants';
import { useCampaign } from './context';
import { drawCampaignMap } from './drawCampaignMap';

import './map-styles.css';

type Props = {
	hidden?: boolean;
};

export const CampaignMapViewer = ({ hidden }: Props) => {
	const campaign = useCampaign();
	const currentRef = useRef<HTMLButtonElement>(null);

	const regions = useExternalStore(campaign.mapWatcher);
	const { id: currentId, validNext } = useExternalStore(campaign.regionWatcher);

	const pastRegions = useExternalStore(campaign.pastRegionWatcher);

	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLCanvasElement>(null);

	const width = regions[0].length * X_SCALE;
	const height = regions.length * Y_SCALE;

	useEffect(() => {
		if (!mapRef.current || !containerRef.current) {
			return;
		}

		mapRef.current.width = width;
		mapRef.current.height = height;

		drawCampaignMap(mapRef.current, regions, pastRegions.map(v => v.id), currentId);
	}, [currentId, height, width, pastRegions, regions]);

	useEffect(() => {
		if (hidden) {
			return;
		}

		setTimeout(() => {
			currentRef.current?.scrollIntoView({ behavior: 'smooth' });
		}, 100);
	}, [hidden]);

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
										ref={currentId === region.id ? currentRef : undefined}
										data-visited={region.id === currentId || pastRegions.some(v => v.id === region.id)}
										onClick={() => {
											campaign.goTo(region.id);
										}}
										disabled={!validNext.includes(region.id)}
									>
										<Sprite type="chip" chip={{ style: 'red' }} size="48" />
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
