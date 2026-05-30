import { selectRandom } from '../common/random';
import { resolveEffect } from '../state/common';
import { getId } from '../state/initialiser';
import type { Chip, Effect, EffectModule, Style, Weight } from '../state/types';
import type { Position } from '../travel';

type getPlayEffectsFromPlacingState = {
    effectModules: EffectModule[];
    played: [Chip, Position][];
};

export const getPlayEffectsFromPlacing = (state: getPlayEffectsFromPlacingState, chip: Omit<Chip, 'id'>): Effect[] => {
    const thisRule = state.effectModules.find(({ style }) => style === chip.style);

    const playEffects = (thisRule?.playEffects ?? []);

    const alreadyPlayed = state.played.slice();
    alreadyPlayed.reverse();

    const stack: Style[] = alreadyPlayed.map(([{ style }]) => style);

    const patternEffects: Effect[] = [];

    alreadyPlayed.forEach(([priorChip], index) => {
        const relevantRule = state.effectModules.find(({ style }) => style === priorChip.style);

        const triggeredPatterns = (relevantRule?.patternEffects ?? []).filter(patternEffect => {
            const matchingFragment = stack.slice(0, patternEffect.pattern.length);

            // Lengths must match
            if (matchingFragment.length !== patternEffect.pattern.length) {
                return false;
            }

            // The chip must be most recent instance of this style in the stack
            if (index > matchingFragment.findIndex(style => style === priorChip.style)) {
                return false;
            }

            return matchingFragment.every((style, index) => patternEffect.pattern[index] === style);
        });

        patternEffects.push(...triggeredPatterns.flatMap(patternEffect => patternEffect.effects.map(e => resolveEffect(e, priorChip))));
    });

    return playEffects.concat(patternEffects);
};

export function selectN(items: Chip[], count: number, weights: Weight[]): Chip[] {
    const bagItems = items.reduce((chosen: Chip[], current: Chip, index: number) => {
        const stillNeeded = count - chosen.length;
        const remainingOptions = items.length + weights.length - index;
        if (Math.random() < stillNeeded / remainingOptions) {
            return chosen.concat(current);
        } else {
            return chosen;
        }
    }, []);

    let selectableWeights = weights.slice();

    while (bagItems.length < count && selectableWeights.length > 0) {
        const chosenWeight = selectRandom(selectableWeights);
        selectableWeights = selectableWeights.filter(w => w !== chosenWeight);

        bagItems.push({ ...chosenWeight, id: getId() });
    }

    return bagItems;
}
