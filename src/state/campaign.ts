import { TutorialKey } from '../activity/tutorial/types';

export type Activity =
    | { type: 'start' }
    | { type: 'board' }
    | { type: 'shop' }
    | { type: 'tutorial'; key: TutorialKey };
