import type { GameAction, GameState } from '../../state/types';

export type TutorialKey = 'intro' | 'explosions' | 'game-over';

export type TutorialProps = {
    gameState: GameState;
    onComplete: () => void;
    onGameAction: (action: GameAction) => void;
};
