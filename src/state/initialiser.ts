import type { Chip, EffectModule, Weight } from './types';

let startId = 0;
export const getId = () => {
	return startId++;
};

export const bigBag = (): Chip[] => {
	return [
		{ style: 'gear', quantity: 1, id: getId() },
		{ style: 'gear', quantity: 1, id: getId() },
		{ style: 'gear', quantity: 1, id: getId() },
		{ style: 'fuel', quantity: 1, id: getId() },
		{ style: 'fuel', quantity: 1, id: getId() },
		{ style: 'asteroid', quantity: 1, id: getId() },
		// { style: 'asteroid', quantity: 1, id: getId() },
		// { style: 'asteroid', quantity: 2, id: getId() },
		// { style: 'asteroid', quantity: 3, id: getId() },
		// { style: 'gem', quantity: 1, id: getId() },
		// { style: 'fruit', quantity: 1, id: getId() },
		{ style: 'tree', quantity: 1, id: getId() },
		// { style: 'red', quantity: 1, id: getId() },
		// { style: 'ice', quantity: 1, id: getId() },
		// { style: 'ice', quantity: 2, id: getId() },
		// { style: 'ice', quantity: 5, id: getId() },
	];
};

export const getDefaultWeights = (): Weight[] => {
	return [
		{ style: 'explosion', quantity: 1 },
	];
};

export const defaultEffectDeck = (): EffectModule[] => {
	return [
		{
			style: 'ice',
			// drawEffects: [{ type: 'add-to-bag', chips: [{ style: 'ice', quantity: 2 }] }],
			drawEffects: [{
				type: 'add-to-bag',
				chips: [{
					style: 'ice',
					quantity: { type: 'add', args: ['Y', 1] },
				}],
			}],
			text: 'When drawn, add another ice X+1 to your bag.',
		},
		{
			style: 'tree',
			drawEffects: [{
				type: 'add-to-bag',
				chips: [{
					style: 'fruit',
					quantity: 1,
				}],
			}],
			text: 'When drawn, add Fruit 1 to your bag.'
		},
		{
			style: 'fruit',
			drawEffects: [{ type: 'money', moneyShift: 100 }],
			playEffects: [{ type: 'energy', energyShift: 'Y' }],
			returnToBagEffects: [
				{
					type: 'add-to-bag',
					transform: true,
					chips: [{
						style: 'fruit',
						quantity: { type: 'add', args: [{ type: 'multiply', args: [2, 'Y'] }, 1] }
					}],
				},
			],
			text: 'Gain X energy. When drawn, gain $100. Increment number by 1 when returning to bag.',
		},
		{
			style: 'explosion',
			drawEffects: [{ type: 'health', healthShift: '-Y' }],
			playEffects: [{ type: 'move', distance: 1 }],
			text: 'Places 1 space further than normal. Lose X health when drawn.',
		},
		{
			style: 'red',
			drawEffects: [{ type: 'energy', energyShift: 1 }],
			text: 'Gain 1 energy when drawn.',
		},
		{
			style: 'gear',
			playEffects: [{ type: 'health', healthShift: 1 }],
			text: 'Restore 1 health.',
		},
		{
			style: 'fuel',
			playEffects: [{ type: 'energy', energyShift: 1 }],
			text: 'Gain 1 energy.',
		},
		{
			style: 'asteroid',
			playEffects: [{ type: 'money', moneyShift: 'Y' }],
			patternEffects: [
				{
					pattern: ['asteroid', 'asteroid'],
					effects: [
						{ type: 'money', moneyShift: 2 },
					],
				},
			],
			text: 'Gain X money. Gain an additional 2 money if placed after another asteroid.',
		},
		{
			style: 'blue',
			patternEffects: [
				{
					pattern: ['blue', 'explosion'],
					effects: [
						{ type: 'move', distance: 2 },
					],
				},
			],
			text: 'If followed by an explosion, it is placed 2 spaces further than normal.',
		},
	];
};
