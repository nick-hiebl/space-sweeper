import type { ReactNode } from 'react';

import { StartActivity as StartActivityComponent } from '../../activity/start';
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
};

export type CampaignActivity<T> = {
	data: T;
	component: (props: T) => ReactNode;
};

type AllActivityTypes =
	| StartActivity;

type StartActivity = { type: 'start' };

const createActivity = (): CampaignActivity<AllActivityTypes> => {
	return {
		data: { type: 'start' },
		component: StartActivityComponent,
	};
};

const createRegion = (): CampaignRegion => {
	const id = nextId();
	return {
		id,
		name: `World ${id}`,
		activities: [createActivity()],
	};
};

/**
 * I apologise to my future self in advance for not handling acts now.
 */
export class Campaign {
	regions: CampaignRegion[][];
	currentRegion: CampaignRegion;
	currentActivity: CampaignActivity<AllActivityTypes>;

	pastRegions: number[];

	player: Player;

	regionWatcher: ExternalStore<CampaignRegion>;

	constructor() {
		this.regions = createMyMap(createRegion, 11, 5);
		this.pastRegions = [];

		this.currentRegion = this.regions[0][0];
		this.currentActivity = this.currentRegion.activities[0];

		this.player = new Player(4, 8);

		this.regionWatcher = createExternalStore(() => this.currentRegion);
	}

	goTo(id: number) {
		const target = this.regions.flatMap(t => t).find(r => r.id === id);

		if (!target) {
			return;
		}

		this.currentRegion = target;

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
