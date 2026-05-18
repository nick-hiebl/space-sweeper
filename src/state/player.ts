import { ChipDisplay } from '../common/ChipDisplay';
import { createExternalStore, type ExternalStore } from '../common/external-store';
import { clamp } from '../common/random';

import { bigBag, defaultEffectDeck, getDefaultWeights, getId } from './initialiser';
import { readQuantity } from './state-manager';
import type { Chip, Effect, EffectModule, Weight } from './types';

export type PlayerStats = {
	money: number;
	hitPoints: number;
	maxHitPoints: number;
	energy: number;
	maxEnergy: number;
};

export type Sources = {
	bag: Chip[];
	weights: Weight[];
	effects: EffectModule[];
};

const getDefaultSources = (): Sources => {
	return {
		bag: bigBag(),
		weights: getDefaultWeights(),
		effects: defaultEffectDeck(),
	};
};

export class Player {
	stats: PlayerStats;
	sources: Sources;

	statsWatcher: ExternalStore<PlayerStats>;
	sourcesWatcher: ExternalStore<Sources>;

	constructor(hp: number, energy: number, sources = getDefaultSources()) {
		this.stats = {
			money: 0,
			hitPoints: hp,
			maxHitPoints: hp,
			energy,
			maxEnergy: energy,
		};

		this.sources = sources;

		this.statsWatcher = createExternalStore(() => this.stats);
		this.sourcesWatcher = createExternalStore(() => this.sources);
	}

	triggerEffects(effects: Effect[]) {
		let hp = this.stats.hitPoints;
		let energy = this.stats.energy;
		let money = this.stats.money;

		effects.forEach(effect => {
			if (effect.type === 'money') {
				money += readQuantity(effect.moneyShift);
			} else if (effect.type === 'health') {
				hp += readQuantity(effect.healthShift);
			} else if (effect.type === 'energy') {
				energy += readQuantity(effect.energyShift);
			}
			// Other types of effects can be ignored as they may not apply to the player
		});

		this.stats = {
			...this.stats,
			money,
			energy: clamp(energy, 0, this.stats.maxEnergy),
			hitPoints: clamp(hp, 0, this.stats.maxHitPoints),
		};

		this.statsWatcher.triggerUpdate();
	}

	restoreEnergy() {
		this.stats = {
			...this.stats,
			energy: this.stats.maxEnergy,
		};

		this.statsWatcher.triggerUpdate();
	}

	removeChips(ids: number[]) {
		const newBag = this.sources.bag.filter(chip => !ids.includes(chip.id));

		this.sources = {
			...this.sources,
			bag: newBag,
		};

		this.sourcesWatcher.triggerUpdate();
	}

	addChips(chips: Omit<Chip, 'id'>[]) {
		this.sources = {
			...this.sources,
			bag: this.sources.bag.concat(chips.map(chip => ({ ...chip, id: getId() }))),
		};

		this.sourcesWatcher.triggerUpdate();
	}

	removeModules(modules: EffectModule[]) {
		const newModules = this.sources.effects.filter(mod => !modules.includes(mod));

		this.sources = {
			...this.sources,
			effects: newModules,
		};

		this.sourcesWatcher.triggerUpdate();
	}

	addModules(modules: EffectModule[]) {
		this.sources = {
			...this.sources,
			effects: this.sources.effects.concat(modules),
		};

		this.sourcesWatcher.triggerUpdate();
	}
}
