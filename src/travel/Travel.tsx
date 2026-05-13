import { DisplayEffect, EffectModule } from '../board/effect-module';
import { ChipDisplay } from '../common/ChipDisplay';
import { useExternalStore } from '../common/external-store';
import { Sprite } from '../common/Sprite';
import type { Chip, Style } from '../state/types';

import { Cell, DrawingState, PickingModuleState, Travel } from '.';

import './style.css';

type Props = {
	travel: Travel;
};

export const TravelComponent = ({ travel }: Props) => {
	const action = useExternalStore(travel.actionWatcher);

	const modules = useExternalStore(travel.moduleWatcher);

	return (
		<div className="stack gap-16px">
			<h1>Travel</h1>
			<State travel={travel} />
			{action.type === 'picking-modules' ? (
				<ModuleSelection travel={travel} action={action} />
			) : action.type === 'waiting' ? (
				<div className="inline gap-8px">
					<button onClick={() => travel.draw()}>Draw</button>
					<button>End</button>
				</div>
			) : action.type === 'drawing' ? (
				<Drawing action={action} travel={travel} />
			) : (
				<pre>{JSON.stringify(travel.currentAction)}</pre>
			)}
			<div id="effect-modules">
				{modules.map(mod => (
					<EffectModule key={mod.style} module={mod} />
				))}
			</div>
		</div>
	);
};

type StateProps = {
	travel: Travel;
};

const State = ({ travel }: StateProps) => {
	const state = useExternalStore(travel.stateWatcher);

	return (
		<div>
			<div id="board">
				<ul id="cells" className="board-list" style={{ width: travel.scale.width, height: travel.scale.height }}>
					{state.cells.map(cell => {
						const placement = state.played.find(([, pos]) => pos === cell.position);

						return (
							<CellComponent
								key={cell.position}
								cell={cell}
								chip={placement?.[0]}
								// isHovered={cell.position}
							/>
						);
					})}
				</ul>
			</div>
		</div>
	);
};

type DrawingProps = {
	travel: Travel;
	action: DrawingState;
};

const Drawing = ({ action, travel }: DrawingProps) => {
	return (
		<div className="inline gap-8px">
			{action.options.map(chip => (
				<button
					key={chip.id}
					className="inverted"
					onClick={() => {
						travel.choose(chip);
					}}
				>
					<ChipDisplay chip={chip} />
				</button>
			))}
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
							className="inverted"
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
