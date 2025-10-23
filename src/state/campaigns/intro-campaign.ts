import { defaultShopData } from '../../shop/state-manager';
import type { Activity, ActivityManager, ActivitySignal } from '../campaign';
import { GameState } from '../types';

type CampaignKeys =
    | 'intro'
    | 'first-board'
    | 'intro-2'
    | 'second-board'
    | 'shop-1'
    | 'combiner'
    | 'game-over';

type ActivityWithCondition = {
    activity: ((state: GameState) => Activity) | Activity;
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

            const nextUp = Math.random() < 0.5 ? 'shop-1' : 'combiner';

            const canEscapeAtShop = nextUp === 'shop-1' && state.money >= 2;

            if (state.hitPoints === 0 && !canEscapeAtShop) {
                return 'game-over';
            }

            return nextUp;
        },
    },
    'shop-1': {
        key: 'shop-1',
        activity: (state) => ({ type: 'shop', data: defaultShopData(state) }),
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
    'combiner': {
        key: 'combiner',
        activity: { type: 'combiner' },
        next: 'second-board',
    },
    'game-over': {
        key: 'game-over',
        activity: { type: 'tutorial', key: 'game-over' },
        // Technically this is a dead-end state, so not relevant
        next: 'intro',
    },
};

export const STARTER_GAME: ActivityManager<undefined> = (gameState, signal) => {
    if (signal.signal === 'finish-start') {
        const act = ACTIVITY_MAP.intro.activity;
        return {
            activity: typeof act === 'function' ? act(gameState) : act,
            campaignState: undefined,
        };
    }

    const currentActivity = Array.from(Object.values(ACTIVITY_MAP)).find(act => act.activity === gameState.currentActivity);

    if (!currentActivity) {
        console.error('Current activity is:', gameState.currentActivity);
        throw new Error('Cannot find current activity!');
    }

    let nextActivity;

    if ('exitCondition' in currentActivity && currentActivity.exitCondition) {
        nextActivity = currentActivity.exitCondition(signal, gameState);
    } else {
        nextActivity = currentActivity.next;
    }

    const activity = ACTIVITY_MAP[nextActivity].activity;

    return {
        activity: typeof activity === 'function' ? activity(gameState) : activity,
        campaignState: undefined,
    };
};
