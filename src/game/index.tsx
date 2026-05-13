import { useRef } from 'react';

import { RenderActivity } from '../activity';
import { Bag } from '../common/Bag';
import { useExternalStore } from '../common/external-store';
import { RegionComponent } from '../region';
import { CampaignMapViewer } from '../state/campaigns/CampaignMapViewer';
import { useCampaign } from '../state/campaigns/context';
// import { STARTER_GAME } from '../state/campaigns/intro-campaign';
import { TravelComponent } from '../travel/Travel';

import { PlayerInfo } from './PlayerInfo';

import './index.css';

export const Game = () => {
	const campaign = useCampaign();

	// const [state, signal] = useReducer(GameStateManager, initialGameState(
	//     // STARTER_GAME, undefined, SHORT_GAME_DATA,
	//     MAIN_GAME, initialCampaignData, undefined,
	// ));

	const activity = useExternalStore(campaign.activity);

	const bagDialogRef = useRef<HTMLDialogElement>(null);
	const mapDialogRef = useRef<HTMLDialogElement>(null);

	const closeAllDialogs = () => {
		bagDialogRef.current?.close();
		mapDialogRef.current?.close();
	};

	const { bag, weights } = useExternalStore(campaign.player.sourcesWatcher);

	return (
		<div id="game">
			<div className="inline-center spread gap-16px wrap">
				<PlayerInfo />
				<div className="inline gap-8px">
					<button
						onClick={() => {
							closeAllDialogs();
							bagDialogRef.current?.showModal();
						}}
					>
						Bag
					</button>
					<button
						onClick={() => {
							closeAllDialogs();
							mapDialogRef.current?.showModal();
						}}
						disabled={activity.type === 'map'}
					>
						Map
					</button>
					<dialog
						ref={bagDialogRef}
						onClose={() => {
							bagDialogRef.current?.close();
						}}
					>
						<Bag bag={bag} weights={weights} />
						<div className="inline inline-end">
							<button
								onClick={() => {
									bagDialogRef.current?.close();
								}}
							>
								Close
							</button>
						</div>
					</dialog>
					<dialog
						ref={mapDialogRef}
						onClose={() => {
							mapDialogRef.current?.close();
						}}
					>
						<div className="stack gap-16px">
							<div className="inline gap-16px spread">
								<h2>Map</h2>
								<button
									onClick={() => {
										mapDialogRef.current?.close();
									}}
								>
									Close
								</button>
							</div>
							<CampaignMapViewer />
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
