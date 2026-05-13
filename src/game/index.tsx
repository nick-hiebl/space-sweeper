import { useReducer, useRef } from 'react';

import { Activity, RenderActivity } from '../activity';
import { Bag } from '../common/Bag';
import { useExternalStore } from '../common/external-store';
import { JumpySprite, Sprite } from '../common/Sprite';
import { RegionComponent } from '../region';
import { Campaign } from '../state/campaigns/campaign';
import { CampaignMapViewer } from '../state/campaigns/CampaignMapViewer';
import { useCampaign } from '../state/campaigns/context';
// import { STARTER_GAME } from '../state/campaigns/intro-campaign';
import { initialCampaignData, MAIN_GAME } from '../state/campaigns/main-campaign';
import { initialGameState, SHORT_GAME_DATA } from '../state/initialiser';
import { GameStateManager } from '../state/state-manager';
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

	const dialogRef = useRef<HTMLDialogElement>(null);

	const { bag, weights } = useExternalStore(campaign.player.sourcesWatcher);

	return (
		<div id="game">
			<div className="inline-center spread gap-16px wrap">
				<PlayerInfo />
				<div>
					<button
						onClick={() => {
							dialogRef.current?.showModal();
						}}
					>
						Bag
					</button>
					<dialog
						ref={dialogRef}
						onClose={() => {
							dialogRef.current?.close();
						}}
					>
						<Bag bag={bag} weights={weights} />
						<div className="inline inline-end">
							<button
								onClick={() => {
									dialogRef.current?.close();
								}}
							>
								Close
							</button>
						</div>
					</dialog>
				</div>
			</div>
			<CampaignMapViewer />
			{activity.type !== 'travel' && (
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
