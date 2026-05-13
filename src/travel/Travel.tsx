import { useExternalStore } from '../common/external-store';

import { PickingModuleState, Travel } from '.';
import { EffectModule } from '../board/effect-module';

type Props = {
	travel: Travel;
};

export const TravelComponent = ({ travel }: Props) => {
	const action = useExternalStore(travel.actionWatcher);

	return (
		<div className="stack">
			<h1>Travel</h1>
			{action.type === 'picking-modules' && (
				<ModuleSelection travel={travel} action={action} />
			)}
			<pre>{JSON.stringify(travel.currentAction)}</pre>
		</div>
	);
};

type ModuleSelectionProps = {
	action: PickingModuleState;
	travel: Travel;
};

const ModuleSelection = ({ action, travel }: ModuleSelectionProps) => {
	return (
		<div className="stack">
			<h2>Picking modules</h2>
			<h3>Current options:</h3>
			<div className="inline gap-16px">
				{action.available
					.filter(mod => mod.style === action.style)
					.map((mod, index) => (
						<button
							key={index}
							className="inverted"
							onClick={() => {
								travel.selectModule(mod);
							}}
						>
							<EffectModule module={mod} />
						</button>
					))}
			</div>
		</div>
	);
};
