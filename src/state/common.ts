import type { Chip, Effect, Quantity } from './types';

const readQuantity = (quantity: Quantity, chip: Chip): number => {
    if (quantity === 'quantity') {
        return chip.quantity;
    } else if (quantity === '-quantity') {
        return -chip.quantity;
    }

    return quantity;
};

export const resolveEffect = (effect: Effect, chip: Chip): Effect => {
    if (effect.type === 'energy') {
        return {
            ...effect,
            energyShift: readQuantity(effect.energyShift, chip),
        };
    } else if (effect.type === 'health') {
        return {
            ...effect,
            healthShift: readQuantity(effect.healthShift, chip),
        };
    } else if (effect.type === 'money') {
        return {
            ...effect,
            moneyShift: readQuantity(effect.moneyShift, chip),
        };
    } else if (effect.type === 'move') {
        return {
            ...effect,
            distance: readQuantity(effect.distance, chip),
        };
    }

    return effect;
};

export function isDefined<T>(item: T | undefined | null): item is T {
    return !!item;
}

export function last<T>(list: T[]): T {
    return list[list.length - 1];
}
