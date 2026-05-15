import { useMemo, useState } from 'react';

import { useCampaign } from '../state/campaigns/context';
import { ModuleTrashActivity } from '../state/campaigns/types';
import { useExternalStore } from '../common/external-store';
import { EffectModule } from '../board/effect-module';
import { Style } from '../state/types';

type Props = ModuleTrashActivity;

const MONEY_REWARD = 10;

export const ModuleTrashComponent = (props: Props) => {
	const campaign = useCampaign();

	const [done, setDone] = useState(false);

	const { effects } = useExternalStore(campaign.player.sourcesWatcher);

	const duplicateModules = useMemo(() => {
		const styles = new Set<Style>();
		const duplicateStyles = new Set<Style>();

		effects.forEach(({ style }) => {
			if (styles.has(style)) {
				duplicateStyles.add(style);
			} else {
				styles.add(style);
			}
		});

		return effects.filter(({ style }) => duplicateStyles.has(style));
	}, [effects]);

	if (done || duplicateModules.length === 0) {
		return (
			<div className="stack gap-8px">
				<h2>Module trasher: {props.name}</h2>
				{!done && duplicateModules.length === 0 && (
					<p>No duplicate modules to sell.</p>
				)}
				<div>
					<button
						onClick={() => {
							campaign.completeCurrentActivity();
						}}
					>
						Proceed
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="stack gap-8px">
			<h2>Module trasher: {props.name}</h2>
			<p>Pick a module to trash for ${MONEY_REWARD}.</p>
			<ul className="inline gap-8px wrap">
				{duplicateModules.map((module, index) => (
					<li key={index}>
						<button
							className="inverted"
							onClick={() => {
								campaign.player.removeModules([module]);

								campaign.player.triggerEffects([{
									type: 'money',
									moneyShift: MONEY_REWARD,
								}]);

								setDone(true);
							}}
						>
							<EffectModule module={module} />
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};
