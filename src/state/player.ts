import { createExternalStore, type ExternalStore } from '../common/external-store';

import { bigBag } from './initialiser';
import { Chip } from './types';

export type PlayerStats = {
	money: number;
	hitPoints: number;
	maxHitPoints: number;
	energy: number;
	maxEnergy: number;
};

export class Player {
	stats: PlayerStats;
	bag: Chip[];

	statsWatcher: ExternalStore<PlayerStats>;
	bagWatcher: ExternalStore<Chip[]>;

	constructor(hp: number, energy: number, bag = bigBag()) {
		this.stats = {
			money: 10,
			hitPoints: hp,
			maxHitPoints: hp,
			energy,
			maxEnergy: energy,
		};

		this.bag = bag;

		this.statsWatcher = createExternalStore(() => this.stats);
		this.bagWatcher = createExternalStore(() => this.bag);
	}
}
