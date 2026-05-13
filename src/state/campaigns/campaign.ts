import type { ReactNode } from 'react';

import { StartActivity as StartActivityComponent } from '../../activity2/start';
import { createExternalStore, ExternalStore } from '../../common/external-store';
import { Travel } from '../../travel';
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
	type: 'hub',
	data: T;
	component: (props: T) => ReactNode;
	completed: boolean;
};

type AllActivityTypes =
	| StartActivity;

export type SpecificCampaignActivity =
	| CampaignActivity<StartActivity>;

type StartActivity = { type: 'start' };

type TravelActivity = {
	type: 'travel';
	travel: Travel;
	destination: number;
};

type PrimaryActivity =
	| CampaignActivity<AllActivityTypes>
	| TravelActivity
	| { type: '@hub' };

const createCampaignActivity = (): CampaignActivity<AllActivityTypes> => {
	return {
		type: 'hub',
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
		activities: [createCampaignActivity()],
		row,
	};
};

/**
 * I apologise to my future self in advance for not handling acts now.
 */
export class Campaign {
	regions: CampaignRegion[][];
	currentRegion: CurrentCampaignRegion;
	currentActivity: PrimaryActivity;

	pastRegions: CurrentCampaignRegion[];

	player: Player;

	regionWatcher: ExternalStore<CurrentCampaignRegion>;
	mapWatcher: ExternalStore<CampaignRegion[][]>;
	activity: ExternalStore<PrimaryActivity>;
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
		this.currentActivity = { type: '@hub' };

		this.player = new Player(4, 8);

		this.regionWatcher = createExternalStore(() => this.currentRegion);
		this.mapWatcher = createExternalStore(() => this.regions);
		this.activity = createExternalStore(() => this.currentActivity);
		this.pastRegionWatcher = createExternalStore(() => this.pastRegions);
	}

	goTo(id: number) {
		if (this.currentActivity.type !== '@hub') {
			return;
		}

		this.currentActivity = {
			type: 'travel',
			destination: id,
			travel: new Travel(
				this.player.sources,
			),
		};

		this.activity.triggerUpdate();
	}

	arrive(energy = 0) {
		if (this.currentActivity.type !== 'travel') {
			return;
		}

		const targetId = this.currentActivity.destination;

		const target = this.regions.flatMap(t => t).find(r => r.id === targetId);

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
