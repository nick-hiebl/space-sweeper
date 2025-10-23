import type { Chip, EffectModule } from '../state/types';

export type SoldChip = Omit<Chip, 'id'>;

export type ChipForSale = {
    chip: SoldChip;
    price: number;
    remaining: number;
};

export type ModuleForSale = {
    module: EffectModule;
    price: number;
    sold: boolean;
};

export type ShopState = {
    rebootPrice?: number;
    healPrice?: number;
    sales: ChipForSale[];
    modules: ModuleForSale[];
};

export type ShopAction =
    | { type: 'buy'; chip: SoldChip }
    | { type: 'buy-module'; module: EffectModule };
