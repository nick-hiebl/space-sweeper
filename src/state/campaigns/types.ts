import type { ComponentType } from 'react';

import type { Travel } from '../../travel';
import type { Chip, EffectModule } from '../types';

import { Campaign } from './campaign';

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
	| CampaignActivity<CombinerActivity>
	| CampaignActivity<ChoiceActivity>;

export type StartActivity = ActivityCommon & { type: 'start' };

export type CombinerActivity = ActivityCommon & { type: 'combiner' };

export type ChoiceActivity = ActivityCommon & {
	type: 'choice';
	choices: IndividualChoice[];
};

export type IndividualChoice = {
	onSelect: (campaign: Campaign) => void;
	text: string;
	chips?: Omit<Chip, 'id'>[];
	modules?: EffectModule[];
};

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
