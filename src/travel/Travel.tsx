import { useState } from 'react';

import { DisplayEffect, EffectModule } from '../board/effect-module';
import { ChipDisplay } from '../common/ChipDisplay';
import { useExternalStore } from '../common/external-store';
import { Sprite } from '../common/Sprite';
import { useCampaign } from '../state/campaigns/context';
import { last } from '../state/common';
import type { Chip, Style } from '../state/types';

import { Cell, DrawingState, PickingModuleState, Travel } from '.';

import './style.css';

type Props = {
	travel: Travel;
};

export const TravelComponent = ({ travel }: Props) => {
	const campaign = useCampaign();

	const { hitPoints } = useExternalStore(travel.player.statsWatcher);
	const action = useExternalStore(travel.actionWatcher);

	const modules = useExternalStore(travel.moduleWatcher);

	const [hoveredStyle, setHoveredStyle] = useState<Style | undefined>(undefined);
	const [hoveredPlace, setHoveredPlace] = useState<number | undefined>(undefined);

	return (
		<div className="stack gap-16px">
			<h1>Travel</h1>
			<State
				travel={travel}
				hoveredPlace={hoveredPlace}
				hoveredStyle={hoveredStyle}
				setHoveredStyle={setHoveredStyle}
			/>
			{hitPoints <= 0 ? (
				<div>
					<button
						onClick={() => {
							campaign.gameEnd();
						}}
					>
						Move on
					</button>
				</div>
			) : action.type === 'picking-modules' ? (
				<ModuleSelection travel={travel} action={action} />
			) : action.type === 'waiting' ? (
				<Waiting travel={travel} />
			) : action.type === 'drawing' ? (
				<Drawing
					action={action}
					travel={travel}
					setHoveredStyle={setHoveredStyle}
					setHoveredPlace={setHoveredPlace}
				/>
			) : (
				<pre>{JSON.stringify(travel.currentAction)}</pre>
			)}
			<div id="effect-modules">
				{modules.map(mod => (
					<EffectModule
						key={mod.style}
						module={mod}
						isHighlighted={!hoveredStyle ? undefined : mod.style === hoveredStyle}
					/>
				))}
			</div>
		</div>
	);
};

type StateProps = {
	travel: Travel;
	hoveredStyle: Style | undefined;
	hoveredPlace: number | undefined;
	setHoveredStyle: (style: Style | undefined) => void;
};

const State = ({ hoveredPlace, hoveredStyle, setHoveredStyle, travel }: StateProps) => {
	const state = useExternalStore(travel.stateWatcher);

	return (
		<div>
			<div id="board">
				<ul id="cells" className="board-list" style={{ width: travel.scale.width, height: travel.scale.height }}>
					{state.cells.map(cell => {
						const placement = state.played.find(([, pos]) => pos === cell.position);

						const chip = placement?.[0];

						return (
							<CellComponent
								key={cell.position}
								cell={cell}
								chip={chip}
								hoveredStyle={hoveredStyle}
								isHovered={cell.position === hoveredPlace}
								onMouseEnter={chip ? () => setHoveredStyle(chip.style) : undefined}
								onMouseLeave={chip ? () => setHoveredStyle(undefined) : undefined}
							/>
						);
					})}
				</ul>
			</div>
		</div>
	);
};

type WaitingProps = {
	travel: Travel;
};

const Waiting = ({ travel }: WaitingProps) => {
	const campaign = useCampaign();

	const { energy } = useExternalStore(travel.player.statsWatcher);
	const { cells, played } = useExternalStore(travel.stateWatcher);
	const { bag, weights } = useExternalStore(travel.sourceWatcher);

	const nothingToDraw = bag.length === 0 && weights.length === 0;

	const lastPlace = last(cells);

	const anythingPlacedInLast = played.some(([_, index]) => index === lastPlace.position);

	return (
		<div className="inline gap-8px">
			<button
				className="button disable-able-button"
				onClick={() => travel.draw()}
				disabled={energy <= 0 || anythingPlacedInLast || nothingToDraw}
			>
				Draw
			</button>
			<button className="button" onClick={() => travel.complete(campaign)}>
				End
			</button>
		</div>
	);
};

type DrawingProps = {
	travel: Travel;
	action: DrawingState;
	setHoveredStyle: (style: Style | undefined) => void;
	setHoveredPlace: (number: number | undefined) => void;
};

const Drawing = ({ action, travel, setHoveredStyle, setHoveredPlace }: DrawingProps) => {
	return (
		<div className="inline gap-8px">
			{action.options.map(chip => {
				const willLandOn = travel.resolvePlacementDistance(chip);

				const onFocus = () => {
					setHoveredStyle(chip.style);
					setHoveredPlace(willLandOn);
				};

				const onBlur = () => {
					setHoveredStyle(undefined);
					setHoveredPlace(undefined);
				};

				return (
					<button
						key={chip.id}
						className="button inverted"
						onClick={() => {
							travel.choose(chip);
						}}
						onMouseEnter={onFocus}
						onMouseLeave={onBlur}
						onFocus={onFocus}
						onBlur={onBlur}
					>
						<ChipDisplay chip={chip} />
					</button>
				);
			})}
		</div>
	);
};

type CellComponentProps = {
	cell: Cell;
	chip?: Chip;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	isHovered?: boolean;
	hoveredStyle?: Style;
};

const CellComponent = ({ cell, chip, hoveredStyle, isHovered, onMouseEnter, onMouseLeave }: CellComponentProps) => {
	return (
		<li className="grid-item">
			<div className="cell" style={{ top: cell.offset.y, left: cell.offset.x }}>
				{cell.effects.length > 0 && (
					<div className="cell-effects-container">
						{cell.effects.map((effect, index) => (
							<DisplayEffect key={index} effect={effect} size="small" />
						))}
					</div>
				)}
				{cell.markerNumber && (
					<div className="cell-effects-container">
						<div className="marker-number">
							{cell.markerNumber}
						</div>
					</div>
				)}
				{chip && (
					<ChipDisplay
						size="64"
						chip={chip}
						onMouseEnter={() => onMouseEnter?.()}
						onMouseLeave={() => onMouseLeave?.()}
					/>
				)}
				{!chip && isHovered && hoveredStyle && (
					<div className="hover-preview">
						<Sprite type="chip" chip={{ style: hoveredStyle }} size="48" />
					</div>
				)}
			</div>
		</li>
	);
};

type ModuleSelectionProps = {
	action: PickingModuleState;
	travel: Travel;
};

const ModuleSelection = ({ action, travel }: ModuleSelectionProps) => {
	return (
		<div className="stack">
			<h2>Picking modules</h2>
			<h3>Current options:</h3>
			<div className="inline gap-16px">
				{action.available
					.filter(mod => mod.style === action.style)
					.map((mod, index) => (
						<button
							key={index}
							className="button inverted"
							onClick={() => {
								travel.selectModule(mod);
							}}
						>
							<EffectModule module={mod} />
						</button>
					))}
			</div>
		</div>
	);
};
