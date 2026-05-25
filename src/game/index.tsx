import { useEffect, useRef, useState } from 'react';

import { RenderActivity } from '../activity2';
import { Bag } from '../common/Bag';
import { useExternalStore } from '../common/external-store';
import { RegionComponent } from '../region';
import { CampaignMapViewer } from '../state/campaigns/CampaignMapViewer';
import { useCampaign } from '../state/campaigns/context';
import { TravelComponent } from '../travel/Travel';

import { PlayerInfo } from './PlayerInfo';

import './index.css';

export const Game = () => {
	const campaign = useCampaign();

	const [openDialog, setOpenDialog] = useState<'map' | 'bag' | undefined>(undefined);

	const activity = useExternalStore(campaign.activity);

	const bagDialogRef = useRef<HTMLDialogElement>(null);
	const mapDialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (openDialog === 'bag') {
			bagDialogRef.current?.showModal();
		} else {
			bagDialogRef.current?.close();
		}

		if (openDialog === 'map') {
			mapDialogRef.current?.showModal();
		} else {
			mapDialogRef.current?.close();
		}
	}, [openDialog])

	const { bag, weights } = useExternalStore(campaign.player.sourcesWatcher);

	return (
		<div id="game">
			<div className="header-bar inline-center spread gap-16px wrap">
				<PlayerInfo />
				<div className="inline gap-8px">
					<button
						className="button"
						onClick={() => {
							setOpenDialog('bag');
						}}
					>
						Bag
					</button>
					<button
						className="button"
						onClick={() => {
							setOpenDialog('map');
						}}
						disabled={activity.type === 'map'}
					>
						Map
					</button>
					<dialog
						ref={bagDialogRef}
						onClose={() => {
							setOpenDialog(undefined);
						}}
					>
						<Bag bag={bag} weights={weights} />
						<div className="inline inline-end">
							<button
								className="button"
								onClick={() => {
									setOpenDialog(undefined);
								}}
							>
								Close
							</button>
						</div>
					</dialog>
					<dialog
						ref={mapDialogRef}
						onClose={() => {
							setOpenDialog(undefined);
						}}
					>
						<div className="stack gap-16px">
							<div className="inline gap-16px spread">
								<h2>Map</h2>
								<button
									className="button"
									onClick={() => {
										setOpenDialog(undefined);
									}}
								>
									Close
								</button>
							</div>
							<CampaignMapViewer hidden={openDialog !== 'map'} />
						</div>
					</dialog>
				</div>
			</div>
			{activity.type === 'map' && (
				<CampaignMapViewer />
			)}
			{(activity.type === 'hub' || activity.type === 'browse') && (
				<RegionComponent />
			)}
			{/* <Activity state={state} onAction={signal} /> */}
			{activity.type === 'hub' ? (
				<RenderActivity activity={activity} />
			) : activity.type === 'travel' ? (
				<TravelComponent travel={activity.travel} />
			) : null}
		</div>
	);
};
