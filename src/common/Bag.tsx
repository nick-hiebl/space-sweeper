import { GameState } from '../state/types';

import { ChipDisplay } from './ChipDisplay';

type BagProps = Pick<GameState, 'bag'>;

export const Bag = ({ bag }: BagProps) => {
    return (
        <div className="inline wrap gap-4px">
            {bag.map(chip => (
                <ChipDisplay key={chip.id} chip={chip} />
            ))}
        </div>
    );
};
