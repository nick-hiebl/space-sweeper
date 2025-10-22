import type { Activity, ActivityManager, ActivitySignal } from '../campaign';
import { EffectModule } from '../types';

type PartialRegion = {
    activities: Activity[];
    name: string;
};

type Region = {
    activities: {
        activity: Activity;
        chosen: boolean;
    }[];
    name: string;
    nextRegions: PartialRegion[];
};

export type HubActivity = { type: 'hub'; region: Region };

export type CampaignData = {
    currentRegion: Region;
    pastRegions: Region[];
};

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

const randomPartialRegion = (): PartialRegion => {
    const activities: Activity[] = [
        { type: 'combiner' },
        { type: 'shop' },
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
    ];

    return {
        name: Math.random().toString().slice(15),
        activities: activities.filter(() => Math.random() > 0.5),
    };
};

const randomRegion = (partial: PartialRegion): Region => {
    const activities: Region['activities'] = partial.activities.map(a => ({
        activity: a,
        chosen: false,
    }));
    return {
        name: partial.name,
        activities,
        nextRegions: new Array(3).fill(0).map(randomPartialRegion),
    };
};

export const initialCampaignData = (): CampaignData => {
    const firstRegion = randomRegion(randomPartialRegion());

    return {
        currentRegion: firstRegion,
        pastRegions: [],
    };
}

const FINISHED_ACTIVITY_SIGNAL: ActivitySignal['signal'][] = [
    'finish-shop',
    'finish-combiner',
];

export const MAIN_GAME: ActivityManager<CampaignData> = (state, signal) => {
    if (signal.signal === 'finish-start') {
        return {
            activity: {
                type: 'hub',
                region: state.campaignData.currentRegion,
            },
            campaignState: state.campaignData,
        };
    } else if (signal.signal === 'hub-activity') {
        const currentRegion = state.campaignData.currentRegion;

        if (!currentRegion.activities.some(a => signal.activity)) {
            throw new Error('Could not find requested activity');
        }

        const region: Region = {
            ...currentRegion,
            activities: currentRegion.activities.map(activity => {
                if (activity.activity === signal.activity) {
                    return {
                        ...activity,
                        chosen: true,
                    };
                }

                return activity;
            }),
        };

        return {
            activity: signal.activity,
            campaignState: {
                ...state.campaignData,
                currentRegion: region,
            },
        };
    } else if (FINISHED_ACTIVITY_SIGNAL.includes(signal.signal)) {
        return {
            activity: {
                type: 'hub',
                region: state.campaignData.currentRegion,
            },
            campaignState: state.campaignData,
        };
    } else if (signal.signal === 'next-hub') {
        const { currentRegion } = state.campaignData;
        const nextHub = currentRegion.nextRegions.find(hub => hub.name === signal.hub);

        if (!nextHub) {
            throw new Error('Could not find hub');
        }

        const newRegion = randomRegion(nextHub);

        return {
            activity: {
                type: 'board',
                boardKey: Math.random() < 0.5 ? 'SMALL' : 'Level_0',
            },
            campaignState: {
                currentRegion: newRegion,
                pastRegions: state.campaignData.pastRegions.concat(currentRegion),
            },
        };
    } else if (signal.signal === 'finish-board') {
        const { currentRegion } = state.campaignData;

        return {
            activity: {
                type: 'hub',
                region: currentRegion,
            },
            campaignState: state.campaignData,
        };
    }

    throw new Error('Unacceptable signal at this time');
};
