import { selectRandom, selectRandomN } from '../../../common/random';
import { defaultShopData } from '../../../shop/state-manager';
import { Activity } from '../../campaign';
import type { EffectModule, GameState, GameStateWithCampaign } from '../../types';
import { CampaignData } from '../main-campaign';

import { randomIslandRegion } from './islands';
import { randomMineRegion } from './mines';
import type { PartialRegion, Region } from './types';

const FUEL_2_MODULE: EffectModule = { style: 'fuel', playEffects: [{ type: 'energy', energyShift: 2 }] };
const BLUE_CHOICE_MODULE: EffectModule = {
    style: 'blue',
    patternEffects: [
        {
            pattern: ['asteroid', 'blue'],
            effects: [{ type: 'health', healthShift: 1 }],
        },
        {
            pattern: ['fuel', 'blue'],
            effects: [{ type: 'money', moneyShift: 'quantity' }],
        },
    ],
};

const codeName = (): string => {
    const letter1 = selectRandom(Array.from('ABCDEFGHILMNOPRUW'));
    const letter2 = selectRandom(Array.from('JKQSTVXYZ'));

    const number = Math.floor(Math.random() * Math.random() * 99 + 1);

    return `${letter1}${letter2}-${number}`;
};

const randomOfName = (): string => {
    const descriptor = selectRandom('Flooded Hot Irradiated Drowned Frozen Isolated Shattered Dredged Excavated Temperate Polar Outer Remote'.split(' '));
    const locationType = selectRandom('Planet Moon System Outpost Station'.split(' '));
    const name = selectRandom('Hoth Titan Jupiter Io Calypso Ral Keros Ceres Makemake Outar Torren Kaynar'.split(' '));

    return `${descriptor} ${locationType} of ${name}`;
};

const randomPlaceName = (): string => {
    return selectRandom([codeName(), randomOfName()]);
};

const genericPartialRegion = (state: GameState | GameStateWithCampaign<CampaignData>): PartialRegion => {
    const activities: Activity[] = [
        { type: 'combiner' },
        {
            type: 'shop',
            data: defaultShopData(state),
        },
        {
            type: 'choice',
            choices: [
                { style: 'red', quantity: 1 },
                { style: 'blue', quantity: 1 },
                { style: 'gear', quantity: 1 },
            ],
        },
        {
            type: 'choice',
            modules: [FUEL_2_MODULE, BLUE_CHOICE_MODULE],
        },
        {
            type: 'module-trash',
        },
    ];

    const numActivities = Math.floor(Math.random() * 3 + 3);

    return {
        name: randomPlaceName(),
        activities: selectRandomN(activities, numActivities),
    };
};

export const randomPartialRegion = (state: GameState | GameStateWithCampaign<CampaignData>): PartialRegion => {
    const generator = selectRandom([randomIslandRegion, randomMineRegion, genericPartialRegion]);
    return generator(state);
};

export const randomRegion = (
    partial: PartialRegion,
    energy: number,
    state: GameState | GameStateWithCampaign<CampaignData>,
): Region => {
    const activities: Region['activities'] = partial.activities.map(a => ({
        activity: a,
        chosen: false,
    }));
    return {
        name: partial.name,
        activities,
        nextRegions: new Array(3).fill(0).map(() => randomPartialRegion(state)),
        energy,
    };
};
