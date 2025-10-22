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

const bigBag = (): Chip[] => {
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
		{ style: 'gem', quantity: 1, id: getId() },
		{ style: 'fruit', quantity: 1, id: getId() },
		{ style: 'tree', quantity: 1, id: getId() },
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
			patternEffects: [
				{
					pattern: ['asteroid', 'asteroid'],
					effects: [
						{ type: 'money', moneyShift: 2 },
					],
				},
			],
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

export const initialGameState = <T>(campaign: ActivityManager<T>, initialCampaign: T, gameSettings = NORMAL_GAME_DATA): GameStateWithCampaign<T> => {
	return {
		bag: gameSettings.bag,
		energy: gameSettings.maxEnergy,
		maxEnergy: gameSettings.maxEnergy,
		hitPoints: gameSettings.maxHitPoints,
		maxHitPoints: gameSettings.maxHitPoints,
		money: 0,
		effectDeck: gameSettings.effectDeck,
		weights: gameSettings.weights,
		currentActivity: { type: 'start' },
		campaign,
		campaignData: initialCampaign,
	};
};
