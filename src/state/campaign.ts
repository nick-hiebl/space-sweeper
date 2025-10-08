import { TutorialKey } from '../activity/tutorial/types';
import { BoardState } from '../board/types';

export type Activity =
    | { type: 'start' }
    | { type: 'board'; boardKey: string }
    | { type: 'shop' }
    | { type: 'tutorial'; key: TutorialKey };

type ActivitySignalCommon = { type: 'activity-signal' };

export type ActivitySignal = ActivitySignalCommon & (
    | { signal: 'finish-start' }
    | { signal: 'finish-tutorial' }
    | { signal: 'finish-board'; boardState: BoardState }
    | { signal: 'finish-shop' }
);

export type ActivityManager = (currentActivity: Activity, signal: ActivitySignal) => Activity;
