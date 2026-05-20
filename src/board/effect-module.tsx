import { ChipDisplay } from '../common/ChipDisplay';
import { LABEL_DATA, Sprite } from '../common/Sprite';
import { readQuantity } from '../state/common';
import type { Effect as EffectType, EffectModule as EffectModuleType, Effect, PatternEffect, Style } from '../state/types';

import './index.css';

type EffectModuleProps = {
	module: EffectModuleType;
	isHighlighted?: boolean;
	previewQuantity?: number;
};

type DisplayEffectProps = {
	effect: EffectType;
	size?: 'regular' | 'small';
	previewQuantity?: number;
};

export const DisplayEffect = ({ effect, previewQuantity, size }: DisplayEffectProps) => {
	const iSize = size === 'regular' ? '80' : '48';

	if (effect.type === 'discard') {
		return <div className="effect">discard</div>;
	} else if (effect.type === 'energy') {
		const value = previewQuantity
			? readQuantity(effect.energyShift, { quantity: previewQuantity })
			: effect.energyShift;

		return (
			<div className="effect">
				<Sprite type="ui-icon" icon="energy" size={iSize} />
				<div className="number-overlay">
					<Sprite type="number" value={value} size={size === 'regular' ? '48' : '32'} />
				</div>
			</div>
		);
	} else if (effect.type === 'health') {
		const value = previewQuantity
			? readQuantity(effect.healthShift, { quantity: previewQuantity })
			: effect.healthShift;

		return (
			<div className="effect">
				<Sprite type="ui-icon" icon="heart" size={iSize} />
				<div className="number-overlay">
					<Sprite type="number" value={value} size={size === 'regular' ? '48' : '32'} />
				</div>
			</div>
		);
	} else if (effect.type === 'money') {
		const value = previewQuantity
			? readQuantity(effect.moneyShift, { quantity: previewQuantity })
			: effect.moneyShift;

		return (
			<div className="effect">
				<Sprite type="ui-icon" icon="money" size={iSize} />
				<div className="number-overlay">
					<Sprite type="number" value={value} size={size === 'regular' ? '48' : '32'} />
				</div>
			</div>
		);
	} else if (effect.type === 'forced') {
		return (
			<div className="effect">
				<Sprite type="ui-icon" icon="forced" size={iSize} />
			</div>
		);
	} else if (effect.type === 'move') {
		const value = previewQuantity
			? readQuantity(effect.distance, { quantity: previewQuantity })
			: effect.distance;

		return (
			<div className="effect">
				<Sprite type="ui-icon" icon="arrow" size={iSize} />
				<div className="number-overlay">
					<Sprite type="number" value={value} size={size === 'regular' ? '48' : '32'} />
				</div>
			</div>
		)
	} else if (effect.type === 'add-to-bag') {
		return (
			<div className="inline-center">
				<Sprite type="ui-icon" icon={effect.transform ? 'transform' : 'add-to-bag'} size={iSize} />
				{effect.chips.map((chip, index) => {
					const shownChip = {
						...chip,
						quantity: previewQuantity
							? readQuantity(chip.quantity, { quantity: previewQuantity })
							: chip.quantity,
					};

					return (
						<ChipDisplay key={index} chip={shownChip} size="64" />
					);
				})}
			</div>
		)
	}

	return null;
};

const isEffectQuantityBased = (effect: Effect): boolean => {
	if (effect.type === 'add-to-bag') {
		return effect.chips.some(chip => typeof chip.quantity !== 'number');
	}

	const values = Object.values(effect);

	return values.includes('Y') || values.includes('-Y') || values.some(v => typeof v === 'object');
};

export const EffectModule = ({ isHighlighted, module, previewQuantity }: EffectModuleProps) => {
	const anyEffects = (module.playEffects ?? [] as (Effect | PatternEffect)[])
		.concat(module.drawEffects ?? [])
		.concat(module.patternEffects ?? [])
		.concat(module.returnToBagEffects ?? []);

	const someEffectIsQuantity = (module.playEffects ?? []).concat(module.drawEffects ?? [])
		.some(isEffectQuantityBased) ||
		module.patternEffects?.some(patternEffect => {
			return patternEffect.effects.some(isEffectQuantityBased);
		});

	return (
		<div className="effect-module stack-center" data-ishighlighted={isHighlighted}>
			<h3>{LABEL_DATA[`chip:${module.style}`]}</h3>
			<div className="effect">
				<Sprite type="chip" chip={{ style: module.style }} />
				{someEffectIsQuantity && (
					<div className="number-overlay">
						<Sprite type="number" value="Y" size="48" />
					</div>
				)}
			</div>
			<div className="effect-description">{module.text}</div>
			{module.playEffects && (
				<div className="inline-center">
					<Sprite type="ui-icon" icon="play" />
					<Sprite type="ui-icon" icon="arrow" size="32" />
					{module.playEffects.map((effect, index) => (
						<DisplayEffect key={index} effect={effect} previewQuantity={previewQuantity} />
					))}
				</div>
			)}
			{module.drawEffects && (
				<div className="inline-center">
					<Sprite type="ui-icon" icon="draw" />
					<Sprite type="ui-icon" icon="arrow" size="32" />
					{module.drawEffects.map((effect, index) => (
						<DisplayEffect key={index} effect={effect} previewQuantity={previewQuantity} />
					))}
				</div>
			)}
			{module.returnToBagEffects && (
				<div className="inline-center">
					<Sprite type="ui-icon" icon="return-to-bag" />
					<Sprite type="ui-icon" icon="arrow" size="32" />
					{module.returnToBagEffects.map((effect, index) => (
						<DisplayEffect key={index} effect={effect} previewQuantity={previewQuantity} />
					)).flatMap((v, i, arr) => i === arr.length - 1 ? v : [v, ','])}
				</div>
			)}
			{module.patternEffects && (
				<div className="stack">
					{module.patternEffects.map((patternEffect, index) => (
						<div className="inline-center" key={index}>
							<div className="inline-center">
								{patternEffect.pattern.reduce((iter: Style[], style: Style) => {
									return [style].concat(iter);
								}, []).map((style, index) => (
									<Sprite key={index} type="chip" chip={{ style }} size="32" />
								))}
							</div>
							<Sprite type="ui-icon" icon="arrow" size="32" />
							{patternEffect.effects.map((effect, index) => (
								<DisplayEffect key={index} effect={effect} previewQuantity={previewQuantity} />
							))}
						</div>

					))}
				</div>
			)}
			{anyEffects.length === 0 && (
				<Sprite type="ui-icon" icon="do-nothing" />
			)}
		</div>
	);
};
