import { useReducer } from 'react';

import { Activity } from '../activity';
import { useExternalStore } from '../common/external-store';
import { JumpySprite, Sprite } from '../common/Sprite';
import { Campaign } from '../state/campaigns/campaign';
import { CampaignMapViewer } from '../state/campaigns/CampaignMapViewer';
// import { STARTER_GAME } from '../state/campaigns/intro-campaign';
import { initialCampaignData, MAIN_GAME } from '../state/campaigns/main-campaign';
import { initialGameState, SHORT_GAME_DATA } from '../state/initialiser';
import { GameStateManager } from '../state/state-manager';

import './index.css';

type Props = {
	campaign: Campaign;
};

export const Game = ({ campaign }: Props) => {
	const stats = useExternalStore(campaign.player.statsWatcher);

	// const [state, signal] = useReducer(GameStateManager, initialGameState(
	//     // STARTER_GAME, undefined, SHORT_GAME_DATA,
	//     MAIN_GAME, initialCampaignData, undefined,
	// ));

	return (
		<div id="game">
			<div id="player-info" className="inline gap-16px wrap">
				<div id="player-hp">
					HP:
					<div className="icon-bar hp">
						{new Array(stats.maxHitPoints).fill(0).map((_, index) => (
							<JumpySprite
								key={index}
								type="ui-icon"
								icon={index < stats.hitPoints ? 'heart' : 'heart-empty'}
								size="48"
								index={index}
							/>
						))}
					</div>
				</div>
				<div id="player-energy">
					Energy:
					<div className="icon-bar energy">
						{new Array(stats.maxEnergy).fill(0).map((_, index) => (
							<JumpySprite
								key={index}
								type="ui-icon"
								icon={index < stats.energy ? 'energy' : 'energy-empty'}
								size="48"
								index={index}
							/>
						))}
					</div>
				</div>
				<div id="player-money">
					Money: ${stats.money}
					<div className="icon-bar money">
						{stats.money > 0 ? (
							<div key={stats.money} className="money-container">
								<JumpySprite type="ui-icon" icon="money" size="48" index={0} />
								<div className="number-overlay">
									<Sprite type="number" value={stats.money} size="32" />
								</div>
							</div>
						) : (
							<div key={stats.money} className="money-container">
								<JumpySprite type="ui-icon" icon="no-money" size="48" index={0} />
								<div className="number-overlay">
									<Sprite type="number" value={stats.money} size="32" />
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<CampaignMapViewer regions={campaign.regions} />
			{/* <Activity state={state} onAction={signal} /> */}
		</div>
	);
};
