import type { ActivityManager } from './campaign';
import type { Chip, EffectModule, GameState, GameStateWithCampaign, Weight } from './types';

let startId = 0;
export const getId = () => {
	return startId++;
};

const smallBag = (): Chip[] => {
	return [
		{ style: 'gear', quantity: 1, id: getId() },
		{ style: 'fuel', quantity: 1, id: getId() },
		{ style: 'asteroid', quantity: 1, id: getId() },
		{ style: 'asteroid', quantity: 2, id: getId() },
		{ style: 'asteroid', quantity: 3, id: getId() },
	];
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
		// { style: 'explosion', quantity: 1 },
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
			playEffects: [{ type: 'money', moneyShift: { type: 'add', args: ['Y', 2] } }],
			text: 'Gain X+2 money.',
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

type GamePrefill = Pick<GameState, 'bag' | 'maxEnergy' | 'maxHitPoints' | 'effectDeck' | 'weights'>;

export const SHORT_GAME_DATA: GamePrefill = {
	bag: smallBag(),
	maxEnergy: 5,
	maxHitPoints: 3,
	effectDeck: defaultEffectDeck(),
	weights: [],
};

const NORMAL_GAME_DATA: GamePrefill = {
	bag: bigBag(),
	maxEnergy: 8,
	maxHitPoints: 4,
	effectDeck: defaultEffectDeck(),
	weights: getDefaultWeights(),
};

export const initialGameState = <T>(
	campaign: ActivityManager<T>,
	initialCampaign: (initialState: GameState) => T,
	gameSettings = NORMAL_GAME_DATA,
): GameStateWithCampaign<T> => {
	const state: GameState = {
		bag: gameSettings.bag,
		energy: gameSettings.maxEnergy,
		maxEnergy: gameSettings.maxEnergy,
		hitPoints: gameSettings.maxHitPoints,
		maxHitPoints: gameSettings.maxHitPoints,
		money: 0,
		effectDeck: gameSettings.effectDeck,
		weights: gameSettings.weights,
		currentActivity: { type: 'start' },
	};

	return {
		...state,
		campaign,
		campaignData: initialCampaign(state),
	};
};
