import { useReducer } from 'react';

import { Board } from '../board';
import { initialGameState } from '../state/initialiser';
import { GameStateManager } from '../state/state-manager';

export const Game = () => {
    const [state, signal] = useReducer(GameStateManager, initialGameState());

    return (
        <div id="game">
            <div id="player-info">
                <div id="player-hp">HP: {state.hitPoints} / {state.maxHitPoints}</div>
                <div id="player-energy">Energy: {state.energy} / {state.maxEnergy}</div>
                <div id="player-hp">Money: ${state.money}</div>
            </div>
            <Board state={state} onGameAction={signal} />
        </div>
    );
};
