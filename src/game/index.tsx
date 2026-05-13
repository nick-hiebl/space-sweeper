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

import { PlayerInfo } from './PlayerInfo';

import './index.css';

export const Game = () => {
	const campaign = useCampaign();

	// const [state, signal] = useReducer(GameStateManager, initialGameState(
	//     // STARTER_GAME, undefined, SHORT_GAME_DATA,
	//     MAIN_GAME, initialCampaignData, undefined,
	// ));

	const currentRegion = useExternalStore(campaign.regionWatcher);

	const dialogRef = useRef<HTMLDialogElement>(null);

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
						<Bag bag={campaign.player.bag} />
						<button
							onClick={() => {
								dialogRef.current?.close();
							}}
						>
							Close
						</button>
					</dialog>
				</div>
			</div>
			<CampaignMapViewer />
			<RegionComponent />
			{/* <Activity state={state} onAction={signal} /> */}
			<RenderActivity />
		</div>
	);
};
