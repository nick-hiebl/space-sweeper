import { selectRandom, selectRandomN } from '../../../common/random';
import type { Activity } from '../../campaign';
import type { EffectModule, GameState, GameStateWithCampaign } from '../../types';
import type { CampaignData } from '../main-campaign';

import type { PartialRegion } from './types';

const FRUIT_MODULE: EffectModule = {
    style: 'fruit',
    patternEffects: [
        {
            pattern: ['fruit', 'tree'],
            effects: [{ type: 'health', healthShift: 2 }],
        },
        {
            pattern: ['fruit', 'fuel'],
            effects: [{ type: 'money', moneyShift: 3 }],
        },
    ],
};

const BLUE_MODULE: EffectModule = {
    style: 'blue',
    playEffects: [
        { type: 'move', distance: 'quantity' },
    ],
};

const randomIslandName = (): string => {
    const descriptor = selectRandom('Warm Sunny Coastal Tropical Relaxing Pleasant Humid Summery'.split(' '));
    const place = selectRandom('Shores Waters Islands Archipelago Tropics Coast Seas Jungle Paradise'.split(' '));
    const name = selectRandom(['Wa', 'Sun', 'the Outer Rim', 'Haven-62', 'Paradina', 'Sol']);

    return `${descriptor} ${place} of ${name}`;
};

export const randomIslandRegion = (state: GameState | GameStateWithCampaign<CampaignData>): PartialRegion => {
    const activities: Activity[] = [
        { type: 'combiner' },
        {
            type: 'choice',
            choices: [
                { style: 'tree', quantity: 1 },
                { style: 'fruit', quantity: 1 },
                { style: 'blue', quantity: 1 },
            ],
        },
        {
            type: 'choice',
            modules: [FRUIT_MODULE, BLUE_MODULE],
        },
        {
            type: 'shop',
            data: {
                medic: {
                    healPrice: 1,
                    rebootPrice: 4,
                },
                chips: [
                    { price: 3, remaining: 2, chip: { style: 'blue', quantity: 2 } },
                    { price: 4, remaining: 1, chip: { style: 'fruit', quantity: 1 } },
                    { price: 2, remaining: 2, chip: { style: 'tree', quantity: 1 } },
                ],
            },
        },
    ];

    return {
        name: randomIslandName(),
        activities: selectRandomN(activities, 2),
    };
};
