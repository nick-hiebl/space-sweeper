import type { Chip } from '../state/types';

import { Sprite } from './Sprite';

type ChipDisplayProps = {
    chip: Omit<Chip, 'id'>;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export const ChipDisplay = ({ chip, ...handlers }: ChipDisplayProps) => {
    if (!chip) {
        return null;
    }

    return (
        <div className="cell-chip" {...handlers}>
            <Sprite type="chip" chip={chip} />
            <Sprite type="number" value={chip.quantity} />
        </div>
    );
};
