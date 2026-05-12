import { createExternalStore, type ExternalStore } from '../common/external-store';

export type PlayerStats = {
	money: number;
	hitPoints: number;
	maxHitPoints: number;
	energy: number;
	maxEnergy: number;
};

export class Player {
	stats: PlayerStats;

	statsWatcher: ExternalStore<PlayerStats>;

	constructor(hp: number, energy: number) {
		this.stats = {
			money: 10,
			hitPoints: hp,
			maxHitPoints: hp,
			energy,
			maxEnergy: energy,
		};

		this.statsWatcher = createExternalStore(() => this.stats);
	}
}
