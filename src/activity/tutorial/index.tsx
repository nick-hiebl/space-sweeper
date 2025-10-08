import { JSX } from 'react';

import { Explosions } from './entries/Explosions';
import { GameOver } from './entries/GameOver';
import { Intro } from './entries/Intro';
import type { TutorialKey, TutorialProps } from './types';

const TUTORIAL_MAP: Record<TutorialKey, (props: TutorialProps) => JSX.Element> = {
    intro: Intro,
    explosions: Explosions,
    'game-over': GameOver,
};

export const Tutorial = (props: TutorialProps) => {
    const { gameState } = props;

    if (gameState.currentActivity.type !== 'tutorial') {
        return null;
    }

    const Component = TUTORIAL_MAP[gameState.currentActivity.key];

    return <Component {...props} />;
};
