import type { Activity, ActivityManager, ActivitySignal } from '../campaign';
import { GameState } from '../types';

type CampaignKeys =
    | 'intro'
    | 'first-board'
    | 'intro-2'
    | 'second-board'
    | 'shop-1'
    | 'game-over';

type ActivityWithCondition = {
    activity: Activity;
    key: CampaignKeys;
} & (
        | { next: CampaignKeys; exitCondition?: never }
        | { exitCondition: (signal: ActivitySignal, state: GameState) => CampaignKeys; next?: never }
    );

const ACTIVITY_MAP: Record<CampaignKeys, ActivityWithCondition> = {
    intro: {
        key: 'intro',
        activity: { type: 'tutorial', key: 'intro' },
        next: 'first-board',
    },
    'first-board': {
        key: 'first-board',
        activity: { type: 'board', boardKey: 'SMALL' },
        exitCondition: signal => {
            if (signal.type !== 'activity-signal' || signal.signal !== 'finish-board') {
                throw new Error('Invalid signal received');
            }

            if (signal.boardState.played.some(([_, pos]) => pos >= 5)) {
                return 'intro-2';
            } else {
                return 'intro';
            }
        },
    },
    'intro-2': {
        key: 'intro-2',
        activity: { type: 'tutorial', key: 'explosions' },
        next: 'second-board',
    },
    'second-board': {
        key: 'second-board',
        activity: { type: 'board', boardKey: 'Level_0' },
        exitCondition: (signal, state) => {
            if (signal.type !== 'activity-signal' || signal.signal !== 'finish-board') {
                throw new Error('Invalid signal received');
            }

            if (state.hitPoints === 0 && state.money === 0) {
                return 'game-over';
            }

            return 'shop-1';
        },
    },
    'shop-1': {
        key: 'shop-1',
        activity: { type: 'shop' },
        exitCondition: (signal, state) => {
            if (signal.type !== 'activity-signal' || signal.signal !== 'finish-shop') {
                throw new Error('Invalid signal received');
            }

            if (state.hitPoints === 0) {
                return 'game-over';
            }

            return 'second-board';
        },
    },
    'game-over': {
        key: 'game-over',
        activity: { type: 'tutorial', key: 'game-over' },
        // Technically this is a dead-end state, so not relevant
        next: 'intro',
    },
};

export const STARTER_GAME: ActivityManager = (gameState, signal) => {
    if (signal.signal === 'finish-start') {
        return ACTIVITY_MAP.intro.activity;
    }

    const currentActivity = Array.from(Object.values(ACTIVITY_MAP)).find(act => act.activity === gameState.currentActivity);

    if (!currentActivity) {
        console.error('Current activity is:', gameState.currentActivity);
        throw new Error('Cannot find current activity!');
    }

    if (gameState.currentActivity !== currentActivity.activity) {
        console.error('Given activity, currentActivity', gameState.currentActivity, currentActivity);
        throw new Error('Not currently at expected activity!');
    }

    let nextActivity;

    if ('exitCondition' in currentActivity && currentActivity.exitCondition) {
        nextActivity = currentActivity.exitCondition(signal, gameState);
    } else {
        nextActivity = currentActivity.next;
    }

    return ACTIVITY_MAP[nextActivity].activity;
};
