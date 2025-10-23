import type { TutorialKey } from '../activity/tutorial/types';
import type { BoardState } from '../board/types';
import type { SoldChip } from '../shop/types';

import type { HubActivity } from './campaigns/main-campaign';
import type { Effect, EffectModule, GameStateWithCampaign } from './types';

export type Activity =
    | { type: 'start' }
    | { type: 'board'; boardKey: string; scatteredEffects?: Effect[] }
    | { type: 'shop' }
    | { type: 'tutorial'; key: TutorialKey }
    | { type: 'combiner' }
    | HubActivity
    | { type: 'choice'; choices?: SoldChip[]; modules?: EffectModule[] }
    | { type: 'module-trash' };

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
