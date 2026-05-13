import type { Chip, Weight } from '../state/types';

import { ChipDisplay } from './ChipDisplay';

type BagProps = {
    bag: Chip[];
    weights?: Weight[];
};

export const Bag = ({ bag, weights }: BagProps) => {
    return (
        <div className="stack-center">
            <h2>Chips</h2>
            <div className="inline wrap gap-4px">
                {bag.map(chip => (
                    <ChipDisplay key={chip.id} chip={chip} />
                ))}
            </div>
            {weights && (
                <>
                    <h2>Weights</h2>
                    <div className="inline wrap gap-4px">
                        {weights.map(weight => (
                            <ChipDisplay chip={weight} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
