import { selectRandom, selectRandomN } from '../../../common/random';
import type { Activity } from '../../campaign';
import type { EffectModule, GameState, GameStateWithCampaign } from '../../types';
import type { CampaignData } from '../main-campaign';

import type { PartialRegion } from './types';

const BETTER_FUEL_MODULE: EffectModule = {
    style: 'fuel',
    playEffects: [{ type: 'energy', energyShift: 'quantity' }],
    patternEffects: [
        {
            pattern: ['fuel', 'fuel'],
            effects: [{ type: 'energy', energyShift: 'quantity' }],
        },
    ],
};

const GEM_MODULE: EffectModule = {
    style: 'gem',
    patternEffects: [
        {
            pattern: ['gem', 'asteroid'],
            effects: [{ type: 'money', moneyShift: 4 }],
        },
    ]
};

const randomMineName = (): string => {
    const descriptor = selectRandom('Shattered Bored Flattened Crushed Leveled'.split(' '));
    const place = selectRandom(['Mines', 'Caves', 'Veins', 'Mining Site', 'Asteroid Belt', 'Extraction']);
    const suffix = `${selectRandom([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])}-${selectRandom(Array.from('ABCDX'))}`;

    return `${descriptor} ${place} ${suffix}`;
};

export const randomMineRegion = (state: GameState | GameStateWithCampaign<CampaignData>): PartialRegion => {
    const activities: Activity[] = [
        { type: 'combiner' },
        {
            type: 'choice',
            choices: [
                { style: 'fuel', quantity: 2 },
                { style: 'asteroid', quantity: 2 },
                { style: 'gear', quantity: 1 },
            ],
        },
        { type: 'module-trash' },
        {
            type: 'shop',
            data: {
                medic: {
                    healPrice: 2,
                    rebootPrice: 1,
                },
                chips: [
                    { price: 10, remaining: 2, chip: { style: 'asteroid', quantity: 3 } },
                    { price: 8, remaining: 1, chip: { style: 'gem', quantity: 1 } },
                    { price: 2, remaining: 2, chip: { style: 'tree', quantity: 1 } },
                ],
                modules: [
                    { price: 6, module: GEM_MODULE },
                    { price: 8, module: BETTER_FUEL_MODULE },
                ],
            },
        },
    ];

    return {
        name: randomMineName(),
        activities: selectRandomN(activities, 2),
    };
};
