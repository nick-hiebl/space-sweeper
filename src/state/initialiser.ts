import type { Chip, EffectModule, GameState } from './types';

let startId = 0;
const getId = () => {
	return startId++;
};

const defaultBag = (): Chip[] => {
	return [
		{ style: 'explosion', quantity: 1, id: getId() },
		{ style: 'explosion', quantity: 1, id: getId() },
		{ style: 'explosion', quantity: 1, id: getId() },
		{ style: 'explosion', quantity: 2, id: getId() },
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

const defaultEffectDeck = (): EffectModule[] => {
	return [
		{
			style: 'explosion',
			effects: [{ type: 'forced' }, { type: 'health', healthShift: '-quantity' }],
		},
		{
			style: 'gear',
			effects: [],
		},
		{
			style: 'fuel',
			effects: [{ type: 'energy', energyShift: 1 }],
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
    };
};
