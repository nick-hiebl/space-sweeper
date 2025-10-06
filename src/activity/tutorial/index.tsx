import { JSX } from 'react';

import { Intro } from './entries/Intro';
import type { TutorialKey, TutorialProps } from './types';

const TUTORIAL_MAP: Record<TutorialKey, (props: TutorialProps) => JSX.Element> = {
    intro: Intro,
};

export const Tutorial = (props: TutorialProps) => {
    const { gameState } = props;

    if (gameState.currentActivity.type !== 'tutorial') {
        return null;
    }

    const Component = TUTORIAL_MAP[gameState.currentActivity.key];

    return <Component {...props} />;
};
