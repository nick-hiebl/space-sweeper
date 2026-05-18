import { ChoiceComponent } from '../../activity2/choice';
import { CombinerComponent } from '../../activity2/combiner';
import { ModuleTrashComponent } from '../../activity2/module-trash';
import { ShopComponent } from '../../activity2/shop';
import { StartActivity as StartActivityComponent } from '../../activity2/start';
import { createMyMap } from '../../common/grid-functions';
import { selectRandom } from '../../common/random';
import { last } from '../common';

import type { Campaign } from './campaign';

import { X_SCALE, Y_SCALE } from './constants';
import type { CampaignRegion, CurrentCampaignRegion, SpecificCampaignActivity } from './types';

type Edge = { low: CampaignRegion; high: CampaignRegion };

let n = 0;
const regionId = () => {
	return n++;
};

let m = 0;
const activityId = () => {
	return m++;
};

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
		{
			data: {
				type: 'combiner',
				name: 'Combiner',
				id: activityId(),
			},
			Component: CombinerComponent,
			type: 'hub',
			completed: false,
		},
		{
			data: {
				type: 'choice',
				choices: [
					{
						text: 'Take a red chip',
						chips: [{ style: 'red', quantity: 1 }],
						onSelect: (campaign: Campaign) => {
							campaign.player.addChips([{ style: 'red', quantity: 1 }]);
						},
					},
					{
						text: 'Take a blue chip',
						chips: [{ style: 'blue', quantity: 1 }],
						onSelect: (campaign: Campaign) => {
							campaign.player.addChips([{ style: 'blue', quantity: 1 }]);
						},
					},
				],
				name: 'Choice',
				id: activityId(),
			},
			Component: ChoiceComponent,
			type: 'hub',
			completed: false,
		},
		{
			data: {
				type: 'module-trash',
				id: activityId(),
				name: 'Module bin',
			},
			Component: ModuleTrashComponent,
			type: 'hub',
			completed: false,
		},
	];
};

const WIGGLE = 0.2;

const createRegion = (row: number, column: number): CampaignRegion => {
	const id = regionId();

	return {
		id,
		name: `World ${id}`,
		activities: [],
		row,
		column,
		validNext: [],
		icon: selectRandom(['earth', 'black-hole', 'ice', 'gas-giant', 'moon', 'quasar', 'belt']),
		x: Math.round((column + 1/2 + Math.random() * WIGGLE - WIGGLE / 2) * X_SCALE),
		y: Math.round((row + 1/2 + Math.random() * WIGGLE - WIGGLE / 2) * Y_SCALE),
	};
};

const overlaps = (edge1: Edge, edge2: Edge) => {
	return (edge1.low.x < edge2.low.x && edge1.high.x > edge2.high.x)
		|| (edge1.low.x > edge2.low.x && edge1.high.x < edge2.high.x);
};

const candidateAbove = <T>(index: number, above: T[]): T => {
	return selectRandom(above.slice(Math.max(0, index - 1), index + 2));
};

const WIDTH = 7;
const HEIGHT = 15;
const EDGES = 6;

export const setupMap = (): { regions: CampaignRegion[][]; initialRegion: CurrentCampaignRegion } => {
	const map = createMyMap(createRegion, HEIGHT, WIDTH);

	const regionMap = new Map<number, CampaignRegion>();

	map.flatMap(x => x).forEach(region => regionMap.set(region.id, region));

	const included = new Set<CampaignRegion>();

	for (let i = map.length - 1; i > 0; i--) {
		const above = map[i - 1];
		const below = map[i].filter(v => i === map.length - 1 || included.has(v));

		const edges: Edge[] = [];

		let trials = 0;

		while (edges.length < EDGES) {
			trials++;

			if (trials > 1000) {
				throw new Error('Could not create map');
			}

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
		activities: createCampaignActivities(),
		id: regionId(),
		name: 'Start',
		row: map.length,
		column: 0,
		energy: 1,
		maxEnergy: 1,
		completed: false,
		validNext: finalParents.map(r => r.id),
		icon: 'earth',
		x: Math.floor((finalParents[0].x + last(finalParents).x) / 2),
		y: (map.length + 1/2) * Y_SCALE,
	};

	map.push([initialRegion]);

	return {
		regions: map,
		initialRegion,
	};
};
