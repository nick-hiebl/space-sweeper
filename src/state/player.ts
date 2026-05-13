import { createExternalStore, type ExternalStore } from '../common/external-store';

import { bigBag, defaultEffectDeck, getDefaultWeights } from './initialiser';
import type { Chip, EffectModule, Weight } from './types';

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
}
