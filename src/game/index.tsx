import { useReducer } from 'react';

import { Activity } from '../activity';
import { Sprite } from '../common/Sprite';
import { initialGameState } from '../state/initialiser';
import { GameStateManager } from '../state/state-manager';

import './index.css';

export const Game = () => {
    const [state, signal] = useReducer(GameStateManager, initialGameState());

    return (
        <div id="game">
            <div id="player-info">
                <div id="player-hp">
                    HP:
                    <div className="icon-bar hp">
                        {new Array(state.maxHitPoints).fill(0).map((_, index) => (
                            <Sprite
                                key={index}
                                type="ui-icon"
                                icon={index < state.hitPoints ? 'heart' : 'heart-empty'}
                            />
                        ))}
                    </div>
                </div>
                <div id="player-energy">
                    Energy:
                    <div className="icon-bar energy">
                        {new Array(state.maxEnergy).fill(0).map((_, index) => (
                            <Sprite
                                key={index}
                                type="ui-icon"
                                icon={index < state.energy ? 'energy' : 'energy-empty'}
                            />
                        ))}
                    </div>
                    {state.energy} / {state.maxEnergy}
                </div>
                <div id="player-hp">
                    Money:
                    <div className="icon-bar money">
                        {new Array(state.money).fill(0).map((_, index) => (
                            <Sprite key={index} type="ui-icon" icon="money" />
                        ))}
                    </div>
                </div>
            </div>
            <Activity state={state} onAction={signal} />
        </div>
    );
};
