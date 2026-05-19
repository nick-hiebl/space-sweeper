import type { Chip, Effect, Quantity } from './types';

const readQuantity = (quantity: Quantity, chip: Chip): number => {
    if (typeof quantity === 'number') {
        return quantity;
    } else if (quantity === 'Y') {
        return chip.quantity;
    } else if (quantity === '-Y') {
        return -chip.quantity;
    } else if (quantity.type === 'add') {
        return quantity.args
            .map(q => readQuantity(q, chip))
            .reduce((a, b) => a + b, 0);
    } else if (quantity.type === 'multiply') {
        return quantity.args
            .map(q => readQuantity(q, chip))
            .reduce((a, b) => a * b, 1);
    }

    throw new Error('Unexpected type of quantity received');
};

export const resolveEffect = (effect: Effect<number | Quantity>, chip: Chip): Effect<number> => {
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
    } else if (effect.type === 'add-to-bag') {
        return {
            ...effect,
            chips: effect.chips.map(effectChip => {
                if (typeof effectChip.quantity === 'number') {
                    return effectChip as Omit<Chip, 'id'>;
                }

                return {
                    ...effectChip,
                    quantity: readQuantity(effectChip.quantity, chip),
                };
            }),
        }
    }

    return effect;
};

export function isDefined<T>(item: T | undefined | null): item is T {
    return !!item;
}

export function last<T>(list: T[]): T {
    return list[list.length - 1];
}
