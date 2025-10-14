import type { Chip } from '../state/types';

import { Sprite } from './Sprite';

import './index.css';

type ChipDisplayProps = {
    chip: Omit<Chip, 'id'>;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    size?: '64';
}

export const ChipDisplay = ({ chip, size, ...handlers }: ChipDisplayProps) => {
    if (!chip) {
        return null;
    }

    return (
        <div className="cell-chip" {...handlers} data-size={size}>
            <Sprite type="chip" chip={chip} size={size} />
            <div className="number-overlay">
                <Sprite type="number" value={chip.quantity} size={size} />
            </div>
        </div>
    );
};
