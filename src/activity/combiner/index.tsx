import { useCallback, useMemo, useState } from 'react';

import { Chip, type GameAction, type GameState, type Style } from '../../state/types';
import { ChipDisplay } from '../../common/ChipDisplay';

type Props = {
    state: GameState;
    onGameAction: (action: GameAction) => void;
};

type IdentityKey = `${Style}:${number}`;

type ChipCore = Pick<Chip, 'style' | 'quantity'>;

type Identity = ChipCore & {
    key: IdentityKey;
};

export const Combiner = ({ onGameAction, state }: Props) => {
    const { bag } = state;
    const [newChip, setNewChip] = useState<ChipCore | undefined>();

    const dupes = useMemo<Identity[]>(() => {
        const counts: Record<IdentityKey, number> = {};

        bag.forEach(chip => {
            const key = `${chip.style}:${chip.quantity}` as const;

            counts[key] = (counts[key] ?? 0) + 1;
        });

        const identities = Object.entries(counts).filter(([, count]) => count >= 2) as [IdentityKey, number][];

        return identities.map(([key]) => ({
            key,
            style: key.split(':')[0] as Style,
            quantity: parseInt(key.split(':')[1], 10),
        }));
    }, [bag]);

    const onCombine = useCallback((duplicate: Identity) => {
        const matches = bag
            .filter(chip => chip.style === duplicate.style && chip.quantity === duplicate.quantity);

        const toDelete = matches.slice(0, 2).map(chip => chip.id);

        onGameAction({
            type: 'remove-chip',
            chips: toDelete,
        });

        const hybrid = {
            style: duplicate.style,
            quantity: duplicate.quantity * 2,
        };

        onGameAction({
            type: 'add-chip',
            chips: [hybrid],
        });

        onGameAction({
            type: 'trigger-effects',
            effects: [{ type: 'health', healthShift: 1 }],
        });

        setNewChip(hybrid);
    }, [bag, onGameAction]);

    return (
        <div className="stack gap-8px">
            <h2>The Combiner</h2>
            {newChip ? (
                <div className="stack gap-8px">
                    <p>
                        Here is your new chip!
                    </p>
                    <div>
                        <ChipDisplay chip={newChip} />
                    </div>
                </div>
            ) : (
                <div className="stack gap-8px">
                    <p>
                        Here are your items we can combine.
                    </p>
                    <div className="inline wrap gap-8px">
                        {dupes.map(duplicate => (
                            <button
                                key={duplicate.key}
                                onClick={() => onCombine(duplicate)}
                            >
                                <ChipDisplay chip={duplicate} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <p>Once you're ready...</p>
            <div className="inline">
                <button
                    onClick={() => {
                        onGameAction({
                            type: 'trigger-effects',
                            effects: [{ type: 'energy', energyShift: state.maxEnergy }],
                        });

                        onGameAction({ type: 'activity-signal', signal: 'finish-combiner' });
                    }}
                >
                    {newChip ? 'Move on' : 'Pass for now'}
                </button>
            </div>
        </div>
    );
};
