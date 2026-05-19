import { createExternalStore, type ExternalStore } from '../../common/external-store';
import { Travel } from '../../travel';
import { Player } from '../player';

import { setupMap } from './createCampaignMap';

import type { CampaignRegion, CurrentCampaignRegion, PrimaryActivity, SpecificCampaignActivity } from './types';

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
		this.player = new Player(4, 8);
		
		this.currentActivity = { type: 'travel', travel: new Travel(this.player), destination: initialRegion.id };

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
