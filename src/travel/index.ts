import { getPlayEffectsFromPlacing, selectN } from '../board/state-manager';
import { createExternalStore, ExternalStore } from '../common/external-store';
import { selectRandom } from '../common/random';
import { Campaign } from '../state/campaigns/campaign';
import { last, resolveEffect } from '../state/common';
import { getId } from '../state/initialiser';
import { Player, Sources } from '../state/player';
import type { Chip, Effect, EffectModule, MoveEffect, Style } from '../state/types';

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
		text: '',
	};
};

const initialAction = (
	chosen: EffectModule[],
	sources: Sources,
): [PickingModuleState | WaitingState, EffectModule[]] => {
	const { bag, weights, effects: modules } = sources;

	const unresolvedStyles = new Set<Style>();
	bag.forEach(chip => {
		unresolvedStyles.add(chip.style);
	});
	weights.forEach(weight => {
		unresolvedStyles.add(weight.style);
	});
	sources.effects.forEach(module => {
		unresolvedStyles.add(module.style);
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
		return [
			{
				type: 'picking-modules',
				style: selectRandom(Array.from(unresolvedStyles)),
				available,
			},
			effectModules,
		];
	}

	return [{ type: 'waiting' }, effectModules];
};

type State = {
	cells: Cell[];
	played: [Chip, Position][];
};

const CHIPS_TO_CHOOSE_FROM = 3;

const getTargetFor = (level: number) => {
	return Math.round(7 + 1.4 * level);
};

const getSpreadFor = (level: number) => {
	return Math.round(5 + 0.3 * level);
};

const createCells = (level: number): Cell[] => {
	const columns = 10;
	const n = 100;

	const target = getTargetFor(level);
	const spread = getSpreadFor(level);

	return new Array(n).fill(0).map((_, index, arr) => {
		const row = Math.floor(index / columns);
		const indexInRow = index - row * columns;

		const specialOffset =
			index === 0 || index === arr.length - 1
				? 0
				: indexInRow === 0
					? -4
					: indexInRow === columns - 1
						? 4
						: 0;

		const column = row % 2 === 0
			? indexInRow
			: columns - indexInRow - 1;

		const marker = index === target
			? 1
			: index === target + spread
				? 2
				: index === target + 2 * spread
					? 3
					: undefined;

		return {
			offset: { x: column * (64 + 4), y: row * (64 + 12) + specialOffset },
			position: index,
			effects: [],
			markerNumber: marker,
		};
	})
};

export class Travel {
	player: Player;

	sources: Sources;

	state: State;

	scale: { width: number; height: number };

	currentAction: ImmediateState;

	actionWatcher: ExternalStore<ImmediateState>;
	stateWatcher: ExternalStore<State>;
	moduleWatcher: ExternalStore<EffectModule[]>;
	sourceWatcher: ExternalStore<Sources>;

	constructor(player: Player, layer: number) {
		this.player = player;
		const { sources } = player;

		this.state = {
			cells: createCells(layer),
			played: [],
		};

		this.scale = {
			width: Math.max(...this.state.cells.map(cell => cell.offset.x)) + 64,
			height: Math.max(...this.state.cells.map(cell => cell.offset.y)) + 64,
		};

		const [action, chosen] = initialAction([], sources);

		this.currentAction = action;

		this.sources = {
			effects: chosen,
			bag: sources.bag.slice(),
			weights: sources.weights.slice(),
		};

		this.actionWatcher = createExternalStore(() => this.currentAction);
		this.stateWatcher = createExternalStore(() => this.state);
		this.moduleWatcher = createExternalStore(() => this.sources.effects);
		this.sourceWatcher = createExternalStore(() => this.sources);
	}

	selectModule(mod: EffectModule) {
		if (this.currentAction.type !== 'picking-modules') {
			throw new Error('Chose module whilst not picking-modules!');
		}

		if (this.currentAction.style !== mod.style || !this.currentAction.available.includes(mod)) {
			throw new Error('Chose module of wrong style!');
		}

		const chosen = this.sources.effects.concat(mod);

		const [action] = initialAction(
			chosen,
			{
				bag: this.sources.bag,
				weights: this.sources.weights,
				effects: chosen.concat(this.currentAction.available),
			},
		);

		this.currentAction = action;

		this.sources = {
			...this.sources,
			effects: chosen,
		};

		this.actionWatcher.triggerUpdate();
		this.moduleWatcher.triggerUpdate();
		this.sourceWatcher.triggerUpdate();
	}

	draw() {
		if (this.currentAction.type !== 'waiting') {
			throw new Error('Drawing out of turn!');
		}

		const drawnChips = selectN(this.sources.bag, CHIPS_TO_CHOOSE_FROM, this.sources.weights);

		this.currentAction = {
			type: 'drawing',
			options: drawnChips,
		};

		this.actionWatcher.triggerUpdate();

		const DEFAULT_ENERGY_COST: Effect<number> = {
			type: 'energy',
			energyShift: -1,
		};

		const drawEffects = drawnChips
			.flatMap(chip => (
				(this.sources.effects
					.find(module => module.style === chip.style)?.drawEffects ?? [])
					.map(effect => resolveEffect(effect, chip))
			))
			.concat(DEFAULT_ENERGY_COST);

		this.triggerEffects(drawEffects);
	}

	findRelevantRule(style: Style) {
		const relevantRule = this.sources.effects.find(module => module.style === style);

		if (!relevantRule) {
			throw new Error('No relevant rule!');
		}

		return relevantRule;
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

		if (this.state.played.some(([, index]) => index === placedPosition)) {
			throw new Error('Trying to place new chip on top of an existing one!');
		}

		this.state.played = this.state.played.concat([[chip, placedPosition]]);
		this.state = { ...this.state };

		this.sources = {
			...this.sources,
			bag: this.sources.bag.filter(c => c !== chip),
		};

		// I think this is just used to verify that there is a rule in this scope
		this.findRelevantRule(chip.style);

		const effectsFromPlay = getPlayEffectsFromPlacing({
			effectModules: this.sources.effects,
			played: this.state.played,
		}, chip)
			.map(effect => resolveEffect(effect, chip));

		const effects: Effect<number>[] = effectsFromPlay;

		this.currentAction.options.forEach(option => {
			// Don't trigger returnToBag effects for the chosen chip
			if (option.id === chip.id) {
				return;
			}

			const relevantRule = this.findRelevantRule(option.style);

			if (relevantRule.returnToBagEffects) {
				const returnToBagEffects = relevantRule.returnToBagEffects
					.map(effect => resolveEffect(effect, option));

				effects.push(...returnToBagEffects);

				const isDeletingEffect = (effect: Effect) =>
					effect.type === 'discard' ||
					(effect.type === 'add-to-bag' && effect.transform);

				// Need to discard in this case
				if (returnToBagEffects.some(isDeletingEffect)) {
					this.sources = {
						...this.sources,
						bag: this.sources.bag.filter(c => c !== option),
					};
				}
			}
		});

		const landedCell = this.state.cells.find(c => c.position === placedPosition);
		if (landedCell && (landedCell?.effects?.length ?? 0) > 0) {
			effects.concat(landedCell.effects.map(effect => resolveEffect(effect, chip)));
		}

		if (effects.length > 0) {
			this.triggerEffects(effects);
		}

		this.currentAction = { type: 'waiting' };

		this.stateWatcher.triggerUpdate();
		this.actionWatcher.triggerUpdate();
		this.sourceWatcher.triggerUpdate();
	}

	triggerEffects(effects: Effect<number>[]) {
		this.player.triggerEffects(effects);

		let anySourceChanges = false;

		effects.forEach(effect => {
			if (effect.type === 'add-to-bag') {
				anySourceChanges = true;

				this.sources.bag = this.sources.bag.concat(effect.chips.map(c => ({ ...c, id: getId() })));
			}
		});

		if (anySourceChanges) {
			this.sources = {
				...this.sources,
			};

			this.sourceWatcher.triggerUpdate();
		}
	}

	resolvePlacementDistance(chip: Omit<Chip, 'id'>): Position {
		const { cells } = this.state;
		const lastCellPosition = last(cells).position;

		const playBonusDistance = getPlayEffectsFromPlacing({
			effectModules: this.sources.effects,
			played: this.state.played,
		}, chip)
			.filter(effect => effect.type === 'move')
			.map(effect => resolveEffect(effect, chip))
			.reduce((total, effect) => {
				return total + ((effect as MoveEffect).distance as number);
			}, 0);

		const drawBonusDistance = (this.currentAction.type === 'drawing' ? this.currentAction.options : [])
			.map<[Chip, Effect[]]>(chip => [chip, this.sources.effects.find(module => module.style === chip.style)?.drawEffects ?? []])
			.filter(([_, effects]) => effects.length > 0)
			.map<[Chip, Effect[]]>(([chip, effects]) => [chip, effects.filter(effect => effect.type === 'move')])
			.flatMap(([chip, effects]) => effects.map(effect => resolveEffect(effect, chip)))
			.reduce((total, effect) => {
				return total + ((effect as MoveEffect).distance as number);
			}, 0);

		const [, lastPosition] = last(this.state.played) ?? [undefined, -1];

		return Math.min(lastPosition + chip.quantity + playBonusDistance + drawBonusDistance, lastCellPosition);
	}

	complete(campaign: Campaign) {
		const lastPlay = last(this.state.played) ?? [undefined, -1];

		const lastPlayedIndex = lastPlay[1];

		const energy = this.state.cells.reduce((score, cell) => {
			if (cell.position > lastPlayedIndex) {
				return score;
			}

			if (!cell.markerNumber) {
				return score;
			}

			return Math.max(score, cell.markerNumber);
		}, 0);

		campaign.completeTravel(energy);
	}
}
