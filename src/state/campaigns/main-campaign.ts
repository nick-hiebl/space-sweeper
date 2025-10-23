import { Cell } from '../../board/types';
import type { ActivityManager, ActivitySignal } from '../campaign';
import { last } from '../common';
import { selectRandom } from '../../common/random';
import { Effect, GameState, GameStateWithCampaign } from '../types';

import { randomPartialRegion, randomRegion } from './hub-worlds';
import type { Region } from './hub-worlds/types';

export type HubActivity = { type: 'hub'; region: Region };

export type CampaignData = {
    currentRegion: Region;
    pastRegions: Region[];
};

export const initialCampaignData = (state: GameState): CampaignData => {
    const firstRegion = randomRegion(randomPartialRegion(state), 2, state);

    return {
        currentRegion: firstRegion,
        pastRegions: [],
    };
}

const FINISHED_ACTIVITY_SIGNAL: ActivitySignal['signal'][] = [
    'finish-shop',
    'finish-combiner',
];

const randomBoard = () => {
    return selectRandom(['Level_0', 'SMALL', 'Swirl']);
};

const randomOnBoardEffect = () => {
    return selectRandom<Effect>([
        { type: 'energy', energyShift: Math.random() < 0.5 ? -1 : 1 },
        { type: 'health', healthShift: Math.random() < 0.5 ? -1 : 1 },
        { type: 'money', moneyShift: Math.random() < 0.5 ? -2 : 2 },
    ]);
};

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

        if (!currentRegion.activities.some(a => a.activity === signal.activity)) {
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

        const newRegion = randomRegion(nextHub, 0, state);

        return {
            activity: {
                type: 'board',
                boardKey: randomBoard(),
                scatteredEffects: new Array(3).fill(0).map(randomOnBoardEffect),
            },
            campaignState: {
                currentRegion: newRegion,
                pastRegions: state.campaignData.pastRegions.concat(currentRegion),
            },
        };
    } else if (signal.signal === 'finish-board') {
        const { currentRegion } = state.campaignData;

        const lastPlayedIndex = last(signal.boardState.played)?.[1] ?? -1;

        const passedMarkers = signal.boardState.board.cells
            .map<[Cell, number]>((cell, index) => [cell, index])
            .filter(([cell]) => (cell.markerNumber ?? 0) > 0)
            .filter(([, index]) => index <= lastPlayedIndex);

        const greatestPassedMarker = last(passedMarkers)?.[0]?.markerNumber ?? 0;

        const updatedRegion = {
            ...currentRegion,
            energy: greatestPassedMarker,
        };

        return {
            activity: {
                type: 'hub',
                region: updatedRegion,
            },
            campaignState: {
                ...state.campaignData,
                currentRegion: updatedRegion,
            },
        };
    }

    throw new Error('Unacceptable signal at this time');
};
