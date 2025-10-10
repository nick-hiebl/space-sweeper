import { TutorialKey } from '../activity/tutorial/types';
import { BoardState } from '../board/types';

import { GameState } from './types';

export type Activity =
    | { type: 'start' }
    | { type: 'board'; boardKey: string }
    | { type: 'shop' }
    | { type: 'tutorial'; key: TutorialKey }
    | { type: 'combiner' };

type ActivitySignalCommon = { type: 'activity-signal' };

export type ActivitySignal = ActivitySignalCommon & (
    | { signal: 'finish-start' }
    | { signal: 'finish-tutorial' }
    | { signal: 'finish-board'; boardState: BoardState }
    | { signal: 'finish-shop' }
    | { signal: 'finish-combiner' }
);

export type ActivityManager = (gameState: GameState, signal: ActivitySignal) => Activity;
