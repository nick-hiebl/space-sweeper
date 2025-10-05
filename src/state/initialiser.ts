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
			drawEffects: [{ type: 'health', healthShift: '-quantity' }],
			playEffects: [{ type: 'move', distance: 1 }],
		},
		{
			style: 'gear',
			playEffects: [{ type: 'health', healthShift: 1 }],
		},
		{
			style: 'fuel',
			playEffects: [{ type: 'energy', energyShift: 1 }],
		},
		{
			style: 'asteroid',
			playEffects: [{ type: 'money', moneyShift: 'quantity' }],
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
