import type { Activity, ActivityManager, ActivitySignal } from '../campaign';

type CampaignKeys =
    | 'intro'
    | 'first-board'
    | 'intro-2'
    | 'second-board'
    | 'shop-1';

type ActivityWithCondition = {
    activity: Activity;
    key: CampaignKeys;
} & (
        | { next: CampaignKeys; exitCondition?: never }
        | { exitCondition: (signal: ActivitySignal) => CampaignKeys; next?: never }
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
        exitCondition: signal => {
            if (signal.type !== 'activity-signal' || signal.signal !== 'finish-board') {
                throw new Error('Invalid signal received');
            }

            return 'shop-1';
        },
    },
    'shop-1': {
        key: 'shop-1',
        activity: { type: 'shop' },
        next: 'second-board',
    },
};

export const STARTER_GAME: ActivityManager = (activity, signal) => {
    console.log('Called with', activity, signal);

    if (signal.signal === 'finish-start') {
        return ACTIVITY_MAP.intro.activity;
    }

    const currentActivity = Array.from(Object.values(ACTIVITY_MAP)).find(act => act.activity === activity);

    if (!currentActivity) {
        console.error('Current activity is:', activity);
        throw new Error('Cannot find current activity!');
    }

    if (activity !== currentActivity.activity) {
        console.error('Given activity, currentActivity', activity, currentActivity);
        throw new Error('Not currently at expected activity!');
    }

    let nextActivity;

    if ('exitCondition' in currentActivity && currentActivity.exitCondition) {
        nextActivity = currentActivity.exitCondition(signal);
    } else {
        nextActivity = currentActivity.next;
    }

    return ACTIVITY_MAP[nextActivity].activity;
};
