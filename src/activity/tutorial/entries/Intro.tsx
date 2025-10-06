import { ChipDisplay } from '../../../common/ChipDisplay';
import type { Chip, EffectModule as EffectModuleType } from '../../../state/types';
import type { TutorialProps } from '../types';

import '../index.css';
import { Sprite } from '../../../common/Sprite';
import { EffectModule } from '../../../board/effect-module';
import { useState } from 'react';

const SAMPLE_BOARD: (Chip | undefined)[] = [
    { id: 0, style: 'asteroid', quantity: 1 },
    { id: 0, style: 'fuel', quantity: 1 },
    undefined,
    undefined,
    { id: 0, style: 'asteroid', quantity: 3 },
    undefined,
    { id: 0, style: 'asteroid', quantity: 2 },
    { id: 0, style: 'fuel', quantity: 1 },
];

const SAMPLE_FUEL_MODULE: EffectModuleType = {
    style: 'fuel',
    playEffects: [
        { type: 'energy', energyShift: 1 },
    ],
};

const SAMPLE_BLUE_MODULE: EffectModuleType = {
    style: 'blue',
};

const SAMPLE_ASTEROID_MODULE: EffectModuleType = {
    style: 'asteroid',
    playEffects: [
        { type: 'money', moneyShift: 'quantity' },
    ],
};

const Slide1 = (props: TutorialProps) => {
    return (
        <div className="tutorial">
            <h1>Welcome to Space Sweeper!</h1>
            <p className="gap-4px">
                Above you can see your current HP
                <span className="inline inline-end">
                    (<Sprite type="ui-icon" icon="heart" size="16" />),
                </span>
                energy
                <span className="inline inline-end">
                    (<Sprite type="ui-icon" icon="energy" size="16" />),
                </span>
                and that you don't have any money
                <span  className="inline inline-end">
                    (<Sprite type="ui-icon" icon="no-money" size="16" />).
                </span>
            </p>
            <p>
                Below is your bag of items:
            </p>
            <h2>Bag</h2>
            <div id="bag">
                {props.gameState.bag.map(chip => (
                    <ChipDisplay key={chip.id} chip={chip} />
                ))}
            </div>
            <p>
                The game is played by repeatedly drawing three items from your bag and selecting
                one to place on the board. Items can have different numbers on them. An item
                numbered 1 will be placed on the next open space on the board, an item numbered 2
                will skip one place a head, an item numbered 3 will skip two places and so on.
            </p>
            <p>
                Here's an example:
            </p>
            <div>
                <ul className="sample-board">
                    {SAMPLE_BOARD.map((maybeChip, index) => (
                        <li key={index}>
                            <div className="faux-cell" />
                            {maybeChip && (
                                <ChipDisplay chip={maybeChip} />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <button onClick={props.onComplete}>Next</button>
            </div>
        </div>
    );
};

const Slide2 = (props: TutorialProps) => {
    return (
        <div className="tutorial">
            <p>
                Each time you draw costs 1 energy. You may stop at any time, but you are forced to
                if your energy or health drops to zero.
            </p>
            <p>
                Items can have different effects. Most trigger when they are played onto the board,
                but some trigger immediately when an item is drawn to your hand.
            </p>
            <div className="stack-center">
                <div className="inline-center gap-16px">
                    <div className="stack-center">
                        <Sprite type="ui-icon" icon="play" />
                        <div>When played to board effect</div>
                    </div>
                    <div className="stack-center">
                        <Sprite type="ui-icon" icon="draw" />
                        <div>On draw effect</div>
                    </div>
                </div>
            </div>
            <p>
                A module controls what effects a given item type has. If you have multiple to
                choose from for an item type, you will get to select them at the start of a round.
            </p>
            <div className="stack-center">
                <div className="inline-center gap-16px">
                    <div className="stack-center gap-4px">
                        <EffectModule module={SAMPLE_FUEL_MODULE} />
                        <div>When this item is played, you will gain 1 energy.</div>
                    </div>
                    <div className="stack-center gap-4px">
                        <EffectModule module={SAMPLE_BLUE_MODULE} />
                        <div>This item will have no effect.</div>
                    </div>
                </div>
            </div>
            <p>
                Items can also have effects labelled with question marks. These effects get their
                value from the number on the item itself.
            </p>
            <div className="stack-center">
                <div className="inline-center gap-16px">
                    <div className="stack-center gap-4px">
                        <EffectModule module={SAMPLE_ASTEROID_MODULE} />
                        <div>This item will grant money equal to its number.</div>
                    </div>
                </div>
            </div>
            <div>
                <button onClick={props.onComplete}>I'm ready to go!</button>
            </div>
        </div>
    );
};

export const Intro = (props: TutorialProps) => {
    const [frame, setFrame] = useState<'slide-1' | 'slide-2'>('slide-1');

    if (frame === 'slide-1') {
        return (
            <Slide1 {...props} onComplete={() => setFrame('slide-2')} />
        );
    } else {
        return <Slide2 {...props} />;
    }
};
