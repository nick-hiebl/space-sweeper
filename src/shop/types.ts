import type { Chip } from '../state/types';

export type SoldChip = Omit<Chip, 'id'>;

export type ChipForSale = {
    chip: SoldChip;
    price: number;
    remaining: number;
};

export type ShopState = {
    rebootPrice: number
    healPrice: number;
    sales: ChipForSale[];
};

export type ShopAction = { type: 'buy', chip: SoldChip };
