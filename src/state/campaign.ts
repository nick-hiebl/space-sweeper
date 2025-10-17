import { TutorialKey } from '../activity/tutorial/types';
import { BoardState } from '../board/types';
import { HubActivity } from './campaigns/main-campaign';

import type { GameStateWithCampaign } from './types';

export type Activity =
    | { type: 'start' }
    | { type: 'board'; boardKey: string }
    | { type: 'shop' }
    | { type: 'tutorial'; key: TutorialKey }
    | { type: 'combiner' }
    | HubActivity;

type ActivitySignalCommon = { type: 'activity-signal' };

export type ActivitySignal = ActivitySignalCommon & (
    | { signal: 'finish-start' }
    | { signal: 'finish-tutorial' }
    | { signal: 'finish-board'; boardState: BoardState }
    | { signal: 'finish-shop' }
    | { signal: 'finish-combiner' }
    | { signal: 'hub-activity'; activity: Activity }
    | { signal: 'next-hub'; hub: string }
);

export type ActivityManager<T> = (gameState: GameStateWithCampaign<T>, signal: ActivitySignal) => { activity: Activity; campaignState: T };
