import { JumpySprite, Sprite } from '../common/Sprite';
import { useExternalStore } from '../common/external-store';
import { useCampaign } from '../state/campaigns/context';

export const PlayerInfo = () => {
	const campaign = useCampaign();

	const stats = useExternalStore(campaign.player.statsWatcher);

	return (
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
	);
};