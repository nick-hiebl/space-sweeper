import { last } from '../common';
import { clamp } from '../../common/random';

import type { CampaignRegion } from './types';

type Vector = { x: number; y: number };

const dist = (v: Vector, v2: Vector): number => {
	return Math.hypot(v.x - v2.x, v.y - v2.y);
};

const closerLineCoords = <T extends Vector>(p1: T, p2: T, inset: number): Vector[] => {
	const lineVec = { x: p2.x - p1.x, y: p2.y - p1.y };

	const len = Math.hypot(lineVec.x, lineVec.y);

	const perpendicular = {
		x: -lineVec.y,
		y: lineVec.x,
	};

	const perpLen = Math.hypot(perpendicular.x, perpendicular.y);

	const pointAt = (atLength: number): Vector => {
		atLength = clamp(atLength, inset, len - inset);

		return {
			x: p1.x + lineVec.x * atLength / len,
			y: p1.y + lineVec.y * atLength / len,
		};
	};

	const path = [pointAt(inset)];

	const STEP = 12;
	const WIGGLE = 1;

	for (let d = inset + STEP; d < len - inset - STEP; d += STEP) {
		const nextPoint = pointAt(d);

		const offset = Math.random() * WIGGLE * 2 - WIGGLE;

		path.push({
			x: nextPoint.x + perpendicular.x * offset / perpLen,
			y: nextPoint.y + perpendicular.y * offset / perpLen,
		});
	}

	path.push(pointAt(len - inset));

	return path;
};

export const drawCampaignMap = (
	canvas: HTMLCanvasElement,
	regions: CampaignRegion[][],
	visited: number[],
	currentId: number,
) => {
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return;
	}

	const regionMap = new Map<number, CampaignRegion>();

	regions.flatMap(x => x).forEach(region => regionMap.set(region.id, region));

	ctx.fillStyle = 'rgb(255, 231, 134)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.lineCap = 'round';
	ctx.lineWidth = 4;

	regions.flatMap(x => x).forEach(region => {
		region.validNext.forEach(upper => {
			const upperRegion = regionMap.get(upper);

			if (!upperRegion) {
				return;
			}

			const trail = closerLineCoords(region, upperRegion, 28);

			ctx.strokeStyle = 'white';

			if (region.id === currentId) {
				ctx.strokeStyle = 'red';
			} else if (visited.includes(region.id) && (visited.includes(upperRegion.id) || upperRegion.id === currentId)) {
				ctx.strokeStyle = 'blue';
			} else {
				ctx.strokeStyle = 'pink';
			}

			const trailLen = dist(trail[0], last(trail));

			if (trailLen <= 10) {
				ctx.setLineDash([]);
			} else if (trailLen <= 17) {
				ctx.setLineDash([trailLen * 0.3, trailLen * 0.4]);
			} else {
				ctx.setLineDash([5, 7]);
			}

			ctx.beginPath();

			ctx.moveTo(trail[0].x, trail[0].y);
			trail.slice(1).forEach(point => {
				ctx.lineTo(point.x, point.y);
			});

			ctx.stroke();
		});
	});
};
