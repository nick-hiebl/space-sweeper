import { createExternalStore, ExternalStore } from '../common/external-store';
import { selectRandom } from '../common/random';
import { Sources } from '../state/player';
import type { Chip, Effect, EffectModule, Style, Weight } from '../state/types';

export type Position = number;

export type Cell = {
	position: Position;
	effects: Effect[];
	markerNumber?: number;
};

export type PickingModuleState = {
	type: 'picking-modules';
	style: Style;
	chosen: EffectModule[];
	available: EffectModule[];
};

export type WaitingState = { type: 'waiting' };

export type DrawingState = { type: 'drawing', options: Chip[] };

export type EndedState = { type: 'ended' };

export type ImmediateState =
	| PickingModuleState
	| WaitingState
	| DrawingState
	| EndedState;

const DEFAULT_MODULE = (style: Style): EffectModule => {
	return {
		style,
	};
};

const initialAction = (chosen: EffectModule[], sources: Sources): PickingModuleState | WaitingState => {
	const { bag, weights, effects: modules } = sources;

	const unresolvedStyles = new Set<Style>();
	bag.forEach(chip => {
		unresolvedStyles.add(chip.style);
	});
	weights.forEach(weight => {
		unresolvedStyles.add(weight.style);
	});

	chosen.forEach(mod => {
		unresolvedStyles.delete(mod.style);
	});

	const effectModules: EffectModule[] = chosen.slice();

	const available: EffectModule[] = [];

	Array.from(unresolvedStyles).forEach(style => {
		const relevant = modules.filter(mod => mod.style === style);
		if (relevant.length === 1) {
			effectModules.push(relevant[0]);
			unresolvedStyles.delete(style);
		} else if (relevant.length === 0) {
			effectModules.push(DEFAULT_MODULE(style));
			unresolvedStyles.delete(style);
		} else {
			available.push(...relevant);
		}
	});

	if (unresolvedStyles.size > 0) {
		return {
			type: 'picking-modules',
			style: selectRandom(Array.from(unresolvedStyles)),
			chosen: effectModules,
			available,
		};
	}

	return { type: 'waiting' };
};

export class Travel {
	bag: Chip[];
	modules: EffectModule[];
	cells: Cell[];
	played: [Chip, Position][];
	weights: Weight[];

	currentAction: ImmediateState;

	actionWatcher: ExternalStore<ImmediateState>;

	constructor(sources: Sources) {
		this.bag = sources.bag.slice();
		this.modules = [];
		this.cells = new Array(20).fill(0).map((_, index) => ({
			position: index,
			effects: [],
			markerNumber: index % 5 === 0 && index > 0 ? index / 5 : undefined,
		}));
		this.played = [];
		this.weights = sources.weights.slice();

		this.currentAction = initialAction([], sources);

		this.actionWatcher = createExternalStore(() => this.currentAction);
	}

	selectModule(mod: EffectModule) {
		if (this.currentAction.type !== 'picking-modules') {
			throw new Error('Chose module whilst not picking-modules!');
		}

		if (this.currentAction.style !== mod.style || !this.currentAction.available.includes(mod)) {
			throw new Error('Chose module of wrong style!');
		}

		const chosen = this.currentAction.chosen.concat(mod);

		this.currentAction = initialAction(
			this.currentAction.chosen.concat(mod),
			{
				bag: this.bag,
				weights: this.weights,
				effects: chosen.concat(this.currentAction.available),
			},
		);

		this.actionWatcher.triggerUpdate();
	}
}
