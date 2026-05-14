import type { ComponentType } from 'react';

import { ShopComponent } from '../../activity2/shop';
import { StartActivity as StartActivityComponent } from '../../activity2/start';
import { createExternalStore, ExternalStore } from '../../common/external-store';
import { createMyMap } from '../../common/grid-functions';
import { Travel } from '../../travel';
import { Player } from '../player';
import { selectRandomN } from '../../common/random';

let n = 0;
const regionId = () => {
	return n++;
};

let m = 0;
const activityId = () => {
	return m++;
};

export type CampaignRegion = {
	activities: SpecificCampaignActivity[];
	name: string;
	id: number;
	row: number;
	validNext: number[];
	x: number;
	y: number;
};

export type CurrentCampaignRegion = CampaignRegion & {
	energy: number;
	maxEnergy: number;
	completed: boolean;
};

export type ActivityCommon = {
	name: string;
	id: number;
	type: string;
};

export type CampaignActivity<T extends ActivityCommon> = {
	type: 'hub',
	data: T;
	Component: ComponentType<T>;
	completed: boolean;
};

export type SpecificCampaignActivity =
	| CampaignActivity<StartActivity>
	| CampaignActivity<ShopActivity>;

export type StartActivity = ActivityCommon & { type: 'start' };

export type ShopActivity = ActivityCommon & {
	type: 'shop';
	healPrice: number;
};

type TravelActivity = {
	type: 'travel';
	travel: Travel;
	destination: number;
};

type PrimaryActivity =
	| SpecificCampaignActivity
	| TravelActivity
	| { type: 'browse' }
	| { type: 'map' };

const createCampaignActivities = (): SpecificCampaignActivity[] => {
	return [
		{
			data: { type: 'start', name: 'Start', id: activityId() },
			Component: StartActivityComponent,
			type: 'hub',
			completed: false,
		},
		{
			data: {
				type: 'shop',
				name: 'Shop',
				id: activityId(),
				healPrice: 3,
			},
			Component: ShopComponent,
			type: 'hub',
			completed: false,
		},
	];
};

const createRegion = (row: number, column: number): CampaignRegion => {
	const id = regionId();
	return {
		id,
		name: `World ${id}`,
		activities: createCampaignActivities(),
		row,
		validNext: [],
		x: column * 80 + 40,
		y: row * 80 + 40,
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
		this.regions = setupMap();
		this.pastRegions = [];

		this.currentRegion = {
			activities: [],
			id: regionId(),
			name: 'Start',
			row: this.regions.length,
			energy: 0,
			maxEnergy: 0,
			completed: false,
			validNext: this.regions[this.regions.length - 1].map(v => v.id),
			x: this.regions[0].length * 40 + 40,
			y: this.regions.length * 80 + 40,
		};
		this.currentActivity = { type: 'map' };

		this.player = new Player(4, 8);

		this.regionWatcher = createExternalStore(() => this.currentRegion);
		this.mapWatcher = createExternalStore(() => this.regions);
		this.activity = createExternalStore(() => this.currentActivity);
		this.pastRegionWatcher = createExternalStore(() => this.pastRegions);
	}

	goTo(id: number) {
		if (this.currentActivity.type !== 'browse' && this.currentActivity.type !== 'map') {
			return;
		}

		this.currentActivity = {
			type: 'travel',
			destination: id,
			travel: new Travel(this.player),
		};

		this.activity.triggerUpdate();
	}

	gameEnd() {
		if (this.currentActivity.type !== 'travel') {
			throw new Error('Trying to gameEnd whilst not travelling');
		}

		window.location.reload();
	}

	completeTravel(energy: number) {
		if (this.currentActivity.type !== 'travel') {
			throw new Error('Not currently travelling');
		}

		this.arrive(energy);
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

		this.currentActivity = {
			type: 'browse',
		};

		this.currentRegion = {
			...target,
			energy,
			maxEnergy: energy,
			completed: false,
		};

		this.pastRegionWatcher.triggerUpdate();
		this.regionWatcher.triggerUpdate();
		this.activity.triggerUpdate();
	}

	startActivity(activity: SpecificCampaignActivity) {
		if (this.currentActivity.type !== 'browse') {
			throw new Error('Not in state to choose an activity');
		}

		if (!this.currentRegion.activities.includes(activity)) {
			throw new Error('Could not find this activity');
		}

		if (activity.completed) {
			throw new Error('Activity already completed');
		}

		if (this.currentRegion.energy <= 0) {
			throw new Error('No energy for these activities!');
		}

		this.currentActivity = {
			...activity,
		};
		this.currentRegion = {
			...this.currentRegion,
			energy: this.currentRegion.energy - 1,
		};

		this.activity.triggerUpdate();
		this.regionWatcher.triggerUpdate();
	}

	completeCurrentActivity() {
		const currentActivity = this.currentActivity;

		if (currentActivity.type !== 'hub') {
			throw new Error('Not in an activity currently');
		}

		this.currentRegion = {
			...this.currentRegion,
			activities: this.currentRegion.activities.map(activity => {
				if (activity.data.id !== currentActivity.data.id) {
					return activity;
				}

				return {
					...activity,
					completed: true,
				};
			}),
		};

		this.currentActivity = {
			type: 'browse',
		};

		this.regionWatcher.triggerUpdate();
		this.activity.triggerUpdate();
	}

	completeRegion() {
		if (this.currentRegion.completed) {
			return;
		}

		this.currentRegion = {
			...this.currentRegion,
			completed: true,
		};

		this.currentActivity = {
			type: 'map',
		};

		this.regionWatcher.triggerUpdate();
		this.activity.triggerUpdate();

		this.player.restoreEnergy();
	}
}

const setupMap = (): CampaignRegion[][] => {
	const map = createMyMap(createRegion, 11, 5);

	for (let i = 1; i < map.length; i++) {
		for (let j = 0; j < map[i].length; j++) {
			map[i][j].validNext = selectRandomN(map[i - 1], 2).map(r => r.id);
		}
	}

	return map;
};
