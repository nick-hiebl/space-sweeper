import { getPlayEffectsFromPlacing, selectN } from '../board/state-manager';
import { createExternalStore, ExternalStore } from '../common/external-store';
import { selectRandom } from '../common/random';
import { last, resolveEffect } from '../state/common';
import { Sources } from '../state/player';
import type { Chip, Effect, EffectModule, MoveEffect, Style, Weight } from '../state/types';

export type Position = number;

export type Cell = {
	offset: { x: number; y: number };
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

type State = {
	cells: Cell[];
	played: [Chip, Position][];
};

const CHIPS_TO_CHOOSE_FROM = 3;

export class Travel {
	bag: Chip[];
	modules: EffectModule[];
	weights: Weight[];

	state: State;

	scale: { width: number; height: number };

	currentAction: ImmediateState;

	actionWatcher: ExternalStore<ImmediateState>;
	stateWatcher: ExternalStore<State>;
	moduleWatcher: ExternalStore<EffectModule[]>;

	constructor(sources: Sources) {
		this.bag = sources.bag.slice();
		this.weights = sources.weights.slice();

		this.state = {
			cells: new Array(20).fill(0).map((_, index) => {
				const COLUMNS = 8;
				const row = Math.floor(index / COLUMNS);
				const indexInRow = index - row * COLUMNS;

				const column = row % 2 === 0
					? indexInRow
					: COLUMNS - indexInRow - 1;

				return ({
					offset: { x: column * (64 + 4), y: row * (64 + 4) + index },
					position: index,
					effects: [],
					markerNumber: index % 5 === 0 && index > 0 ? index / 5 : undefined,
				})
			}),
			played: [],
		};

		this.scale = {
			width: Math.max(...this.state.cells.map(cell => cell.offset.x)) + 64,
			height: Math.max(...this.state.cells.map(cell => cell.offset.y)) + 64,
		};

		this.currentAction = initialAction([], sources);
		this.modules = this.currentAction.type === 'picking-modules'
			? this.currentAction.chosen
			: sources.effects;

		this.actionWatcher = createExternalStore(() => this.currentAction);
		this.stateWatcher = createExternalStore(() => this.state);
		this.moduleWatcher = createExternalStore(() => this.modules);
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

		this.modules = chosen;

		this.actionWatcher.triggerUpdate();
		this.moduleWatcher.triggerUpdate();
	}

	draw() {
		if (this.currentAction.type !== 'waiting') {
			throw new Error('Drawing out of turn!');
		}

		this.currentAction = {
			type: 'drawing',
			options: selectN(this.bag, CHIPS_TO_CHOOSE_FROM, this.weights),
		};

		this.actionWatcher.triggerUpdate();
	}

	choose(chip: Chip) {
		if (this.currentAction.type !== 'drawing') {
			throw new Error('Choosing a chip out of turn!');
		}

		if (!this.currentAction.options.includes(chip)) {
			throw new Error('Chose a chip outside of the available options!');
		}

		const alreadyPlayed = this.state.played.some(([playedChip]) => playedChip === chip);

		console.assert(!alreadyPlayed, 'Chip was already played!');

		const placedPosition = this.resolvePlacementDistance(chip);

		this.state.played = this.state.played.concat([[chip, placedPosition]]);
		this.state = { ...this.state };

		this.bag = this.bag.filter(c => c !== chip);

		this.currentAction = { type: 'waiting' };

		this.stateWatcher.triggerUpdate();
		this.actionWatcher.triggerUpdate();
	}

	resolvePlacementDistance(chip: Chip): Position {
		if (this.currentAction.type !== 'drawing' || !this.currentAction.options.includes(chip)) {
			throw new Error('Calculating placement distance outside of intended resolution phase');
		}

		const { cells } = this.state;
		const lastCellPosition = last(cells).position;

		const playBonusDistance = getPlayEffectsFromPlacing({
			effectModules: this.modules,
			played: this.state.played,
		}, chip)
			.filter(effect => effect.type === 'move')
			.map(effect => resolveEffect(effect, chip))
			.reduce((total, effect) => {
				return total + ((effect as MoveEffect).distance as number);
			}, 0);

		const drawBonusDistance = this.currentAction.options
			.map<[Chip, Effect[]]>(chip => [chip, this.modules.find(module => module.style === chip.style)?.drawEffects ?? []])
			.filter(([_, effects]) => effects.length > 0)
			.map<[Chip, Effect[]]>(([chip, effects]) => [chip, effects.filter(effect => effect.type === 'move')])
			.flatMap(([chip, effects]) => effects.map(effect => resolveEffect(effect, chip)))
			.reduce((total, effect) => {
				return total + ((effect as MoveEffect).distance as number);
			}, 0);

		const [, lastPosition] = last(this.state.played) ?? [undefined, -1];

		console.assert(lastPosition < lastCellPosition, 'Something already placed in final cell but tried to place another!');

		return Math.min(lastPosition + chip.quantity + playBonusDistance + drawBonusDistance, lastCellPosition);
	}
}
