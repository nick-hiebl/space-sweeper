import type { Chip, EffectModule, GameState, Weight } from './types';

let startId = 0;
export const getId = () => {
	return startId++;
};

const defaultBag = (): Chip[] => {
	return [
		{ style: 'gear', quantity: 1, id: getId() },
		{ style: 'gear', quantity: 1, id: getId() },
		{ style: 'gear', quantity: 1, id: getId() },
		{ style: 'fuel', quantity: 1, id: getId() },
		{ style: 'fuel', quantity: 1, id: getId() },
		{ style: 'asteroid', quantity: 1, id: getId() },
		{ style: 'asteroid', quantity: 1, id: getId() },
		{ style: 'asteroid', quantity: 2, id: getId() },
		{ style: 'asteroid', quantity: 3, id: getId() },
	];
};

const getDefaultWeights = (): Weight[] => {
	return [
		{ style: 'explosion', quantity: 1 },
	];
};

const defaultEffectDeck = (): EffectModule[] => {
	return [
		{
			style: 'explosion',
			effects: [{ type: 'forced' }, { type: 'health', healthShift: '-quantity' }],
		},
		{
			style: 'gear',
			effects: [{ type: 'health', healthShift: 1 }],
		},
		{
			style: 'fuel',
			effects: [{ type: 'energy', energyShift: 1 }],
		},
		{
			style: 'fuel',
			effects: [{ type: 'energy', energyShift: 'quantity' }],
		},
		{
			style: 'asteroid',
			effects: [{ type: 'money', moneyShift: 'quantity' }],
		},
	];
};

export const initialGameState = (): GameState => {
    return {
		bag: defaultBag(),
		energy: 8,
		maxEnergy: 8,
		hitPoints: 4,
		maxHitPoints: 4,
		money: 0,
		effectDeck: defaultEffectDeck(),
		weights: getDefaultWeights(),
		currentActivity: 'start',
    };
};
