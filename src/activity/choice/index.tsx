import { useState } from 'react';
import { ChipDisplay } from '../../common/ChipDisplay';
import type { GameAction, GameState } from '../../state/types';

type Props = {
    state: GameState;
    onGameAction: (action: GameAction) => void;
};

export const Choice = ({ onGameAction, state }: Props) => {
    const [done, setDone] = useState(false);

    if (state.currentActivity.type !== 'choice') {
        return null;
    }

    const { choices } = state.currentActivity;

    return (
        <div>
            <h1>Choices</h1>
            <p>
                Choose one to add to your bag.
            </p>
            <div>
                {choices.map((choice, index) => (
                    <button
                        key={index}
                        disabled={done}
                        onClick={() => {
                            onGameAction({
                                type: 'add-chip',
                                chips: [choice],
                            });
                            setDone(true);
                        }}
                    >
                        <ChipDisplay chip={choice} />
                    </button>
                ))}
            </div>
            <div>
                <button disabled={done} onClick={() => setDone(true)}>Pass</button>
            </div>
            {done && (
                <div>
                    <button
                        onClick={() => {
                            onGameAction({
                                type: 'activity-signal',
                                signal: 'finish-shop',
                            });
                        }}
                    >
                        Move on
                    </button>
                </div>
            )}
        </div>
    )
};
