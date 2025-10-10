import { useReducer } from 'react';

import { Activity } from '../activity';
import { JumpySprite, Sprite } from '../common/Sprite';
import { initialGameState } from '../state/initialiser';
import { GameStateManager } from '../state/state-manager';

import './index.css';

export const Game = () => {
    const [state, signal] = useReducer(GameStateManager, initialGameState());

    return (
        <div id="game">
            <div id="player-info" className="inline gap-16px wrap">
                <div id="player-hp">
                    HP:
                    <div className="icon-bar hp">
                        {new Array(state.maxHitPoints).fill(0).map((_, index) => (
                            <JumpySprite
                                key={index}
                                type="ui-icon"
                                icon={index < state.hitPoints ? 'heart' : 'heart-empty'}
                                size="48"
                                index={index}
                            />
                        ))}
                    </div>
                </div>
                <div id="player-energy">
                    Energy:
                    <div className="icon-bar energy">
                        {new Array(state.maxEnergy).fill(0).map((_, index) => (
                            <JumpySprite
                                key={index}
                                type="ui-icon"
                                icon={index < state.energy ? 'energy' : 'energy-empty'}
                                size="48"
                                index={index}
                            />
                        ))}
                    </div>
                </div>
                <div id="player-money">
                    Money: ${state.money}
                    <div className="icon-bar money">
                        {state.money > 0 ? (
                            <div key={state.money} className="money-container">
                                <JumpySprite type="ui-icon" icon="money" size="48" index={0} />
                                <div className="number-overlay">
                                    <Sprite type="number" value={state.money} size="48" />
                                </div>
                            </div>
                        ) : (
                            <div key={state.money} className="money-container">
                                <JumpySprite type="ui-icon" icon="no-money" size="48" index={0} />
                                <div className="number-overlay">
                                    <Sprite type="number" value={state.money} size="48" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Activity state={state} onAction={signal} />
        </div>
    );
};
