import type { ReactNode } from 'react';

import { StartActivity as StartActivityComponent } from '../../activity2/start';
import { createExternalStore, ExternalStore } from '../../common/external-store';
import { Player } from '../player';

let n = 0;
const nextId = () => {
	return n++;
};

export type CampaignRegion = {
	activities: CampaignActivity<AllActivityTypes>[];
	name: string;
	id: number;
	row: number;
};

export type CurrentCampaignRegion = CampaignRegion & {
	energy: number;
	maxEnergy: number;
	completed: boolean;
	validNext: number[];
};

export type CampaignActivity<T> = {
	data: T;
	component: (props: T) => ReactNode;
	completed: boolean;
};

type AllActivityTypes =
	| StartActivity;

type StartActivity = { type: 'start' };

const createActivity = (): CampaignActivity<AllActivityTypes> => {
	return {
		data: { type: 'start' },
		component: StartActivityComponent,
		completed: false,
	};
};

const createRegion = (row: number): CampaignRegion => {
	const id = nextId();
	return {
		id,
		name: `World ${id}`,
		activities: [createActivity()],
		row,
	};
};

/**
 * I apologise to my future self in advance for not handling acts now.
 */
export class Campaign {
	regions: CampaignRegion[][];
	currentRegion: CurrentCampaignRegion;
	currentActivity: CampaignActivity<AllActivityTypes> | null;

	pastRegions: CurrentCampaignRegion[];

	player: Player;

	regionWatcher: ExternalStore<CurrentCampaignRegion>;
	mapWatcher: ExternalStore<CampaignRegion[][]>;
	activity: ExternalStore<CampaignActivity<AllActivityTypes> | null>;
	pastRegionWatcher: ExternalStore<CurrentCampaignRegion[]>;

	constructor() {
		this.regions = createMyMap(createRegion, 11, 5);
		this.pastRegions = [];

		this.currentRegion = {
			activities: [],
			id: nextId(),
			name: 'Start',
			row: this.regions.length,
			energy: 0,
			maxEnergy: 0,
			completed: true,
			validNext: this.regions[this.regions.length - 1].map(v => v.id),
		};
		this.currentActivity = this.currentRegion.activities[0];

		this.player = new Player(4, 8);

		this.regionWatcher = createExternalStore(() => this.currentRegion);
		this.mapWatcher = createExternalStore(() => this.regions);
		this.activity = createExternalStore(() => this.currentActivity);
		this.pastRegionWatcher = createExternalStore(() => this.pastRegions);
	}

	goTo(id: number, energy = 0) {
		const target = this.regions.flatMap(t => t).find(r => r.id === id);

		if (!target) {
			return;
		}

		this.pastRegions = this.pastRegions.concat(this.currentRegion);

		this.currentRegion = {
			...target,
			energy,
			maxEnergy: energy,
			validNext: this.regions[target.row - 1].map(v => v.id),
			completed: false,
		};

		this.pastRegionWatcher.triggerUpdate();
		this.regionWatcher.triggerUpdate();
	}

	completeRegion() {
		if (this.currentRegion.completed) {
			return;
		}

		this.currentRegion = {
			...this.currentRegion,
			completed: true,
		};

		this.regionWatcher.triggerUpdate();
	}
}

const createMyMap = <T>(fillSlot: (row: number) => T, rows: number, columns: number): T[][] => {
	const allRows = [];

	for (let i = 0; i < rows; i++) {
		const row = [];

		for (let j = 0; j < columns; j++) {
			row.push(fillSlot(i));
		}

		allRows.push(row);
	}

	return allRows;
};
