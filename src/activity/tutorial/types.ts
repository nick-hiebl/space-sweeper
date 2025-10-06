import type { GameState } from '../../state/types';

export type TutorialKey = 'intro';

export type TutorialProps = {
    gameState: GameState;
    onComplete: () => void;
};
