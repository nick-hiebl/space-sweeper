import { EffectModule } from '../../../board/effect-module';
import { Bag } from '../../../common/Bag';
import { ChipDisplay } from '../../../common/ChipDisplay';
import type { TutorialProps } from '../types';

import '../index.css';

export const GameOver = ({ gameState }: TutorialProps) => {
    return (
        <div className="tutorial">
            <h1>Game over</h1>
            <p>This game can be tough.</p>
            <p>Maybe you got unlucky, maybe you pushed it too far.</p>
            <p>Either way, you ran out of health and didn't restore it in the shop.</p>
            <h2>Actions</h2>
            <button onClick={() => window.location.reload()}>
                Restart
            </button>
            <p>Here was your game state:</p>
            <h2>Bag</h2>
            <Bag bag={gameState.bag} />
            <h2>Always present in your bag</h2>
            <div id="weights">
                {gameState.weights.map((weight, index) => (
                    <ChipDisplay key={index} chip={weight} />
                ))}
            </div>
            <h2>Modules</h2>
            <div id="effect-modules">
                {gameState.effectDeck.map((effectModule, index) => (
                    <EffectModule key={index} module={effectModule} />
                ))}
            </div>
        </div>
    );
};
