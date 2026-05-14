import type { ComponentType } from 'react';

import { ShopComponent } from '../../activity2/shop';
import { StartActivity as StartActivityComponent } from '../../activity2/start';
import { createExternalStore, ExternalStore } from '../../common/external-store';
import { createMyMap } from '../../common/grid-functions';
import { Travel } from '../../travel';
import { Player } from '../player';
import { selectRandom, selectRandomN } from '../../common/random';
import { Region } from './hub-worlds/types';
import { last } from '../common';

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
	column: number;
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
		activities: [],
		row,
		column,
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
		const { regions, initialRegion } = setupMap();
		this.regions = regions;
		this.pastRegions = [];

		this.currentRegion = initialRegion;
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

type Edge = { low: CampaignRegion; high: CampaignRegion };

const overlaps = (edge1: Edge, edge2: Edge) => {
	return (edge1.low.x < edge2.low.x && edge1.high.x > edge2.high.x)
		|| (edge1.low.x > edge2.low.x && edge1.high.x < edge2.high.x);
};

const candidateAbove = <T>(index: number, above: T[]): T => {
	return selectRandom(above.slice(Math.max(0, index - 1), index + 2));
};

const setupMap = (): { regions: CampaignRegion[][]; initialRegion: CurrentCampaignRegion } => {
	const map = createMyMap(createRegion, 15, 7);

	const regionMap = new Map<number, CampaignRegion>();

	map.flatMap(x => x).forEach(region => regionMap.set(region.id, region));

	const included = new Set<CampaignRegion>();

	for (let i = map.length - 1; i > 0; i--) {
		const above = map[i - 1];
		const below = map[i].filter(v => i === map.length - 1 || included.has(v));

		const edges: Edge[] = [];

		while (edges.length < 6) {
			const regionBelow = selectRandom(below);

			if (!regionBelow) {
				break;
			}

			const regionAbove = candidateAbove(regionBelow.column, above);

			const newEdge = { low: regionBelow, high: regionAbove };

			if (regionBelow.validNext.includes(regionAbove.id)) {
				continue;
			}
			if (edges.some(e => overlaps(e, newEdge))) {
				continue;
			}

			edges.push(newEdge);

			regionBelow.validNext.push(regionAbove.id);
		}

		edges.forEach(({ low, high }) => {
			included.add(low);
			included.add(high);
		});
	}

	const deleted = new Set<number>();

	for (let i = 1; i < map.length; i++) {
		for (let j = 0; j < map[i].length; j++) {
			const region = map[i][j];

			if (!included.has(region)) {
				continue;
			}

			region.validNext = region.validNext.filter(x => !deleted.has(x));

			if (region.validNext.length === 0) {
				deleted.add(region.id);
				included.delete(region);
			}
		}
	}

	Array.from(included).forEach(region => {
		region.activities = createCampaignActivities();
	});

	const finalParents = map[map.length - 1].filter(r => included.has(r));

	const initialRegion: CurrentCampaignRegion = {
		activities: [
			{
				data: { type: 'start', name: 'Start', id: activityId() },
				Component: StartActivityComponent,
				type: 'hub',
				completed: false,
			},
		],
		id: regionId(),
		name: 'Start',
		row: map.length,
		column: 0,
		// column: Math.floor(map[0].length / 2),
		energy: 0,
		maxEnergy: 0,
		completed: true,
		validNext: finalParents.map(r => r.id),
		x: Math.floor((finalParents[0].x + last(finalParents).x) / 2),
		y: map.length * 80 + 40,
	};

	map.push([initialRegion]);

	return {
		regions: map,
		initialRegion,
	};
};
