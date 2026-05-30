import type { Effect, EffectModule } from './types';

type ShopData = {
    chips: object[];
    modules?: {
        module: EffectModule;
        price: number;
    }[];
};

export type Activity =
    | { type: 'start' }
    | { type: 'board'; boardKey: string; scatteredEffects?: Effect[] }
    | { type: 'shop'; data: ShopData }
    | { type: 'combiner' }
    | { type: 'choice'; choices?: object[]; modules?: EffectModule[] }
    | { type: 'module-trash' };
