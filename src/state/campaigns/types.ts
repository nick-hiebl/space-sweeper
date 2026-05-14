import type { ComponentType } from 'react';

import { Travel } from '../../travel';

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
	| CampaignActivity<ShopActivity>
	| CampaignActivity<CombinerActivity>;

export type StartActivity = ActivityCommon & { type: 'start' };

export type CombinerActivity = ActivityCommon & { type: 'combiner' };

export type ShopActivity = ActivityCommon & {
	type: 'shop';
	healPrice: number;
};

export type TravelActivity = {
	type: 'travel';
	travel: Travel;
	destination: number;
};

export type PrimaryActivity =
	| SpecificCampaignActivity
	| TravelActivity
	| { type: 'browse' }
	| { type: 'map' };
