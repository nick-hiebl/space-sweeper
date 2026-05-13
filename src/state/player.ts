import { createExternalStore, type ExternalStore } from '../common/external-store';
import { clamp } from '../common/random';

import { bigBag, defaultEffectDeck, getDefaultWeights } from './initialiser';
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
			money: 10,
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
		});

		this.stats = {
			...this.stats,
			money,
			energy: clamp(energy, 0, this.stats.maxEnergy),
			hitPoints: clamp(hp, 0, this.stats.maxHitPoints),
		};

		this.statsWatcher.triggerUpdate();
	}
}
