import { useCallback, useMemo, useRef, useState } from 'react';

import { useExternalStore } from '../../common/external-store';
import { useCampaign } from '../../state/campaigns/context';
import type { CombinerActivity } from '../../state/campaigns/types';
import type { Chip, Style } from '../../state/types';
import { ChipDisplay } from '../../common/ChipDisplay';

import './style.css';

type Props = CombinerActivity;

type IdentityKey = `${Style}:${number}`;

type ChipCore = Pick<Chip, 'style' | 'quantity'>;

type Identity = ChipCore & {
	key: IdentityKey;
};

export const CombinerComponent = (props: Props) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	const campaign = useCampaign();

	const [animating, setAnimating] = useState(false);
	const [selectedChip, setSelectedChip] = useState<ChipCore | undefined>(undefined);
	const [newChip, setNewChip] = useState<ChipCore | undefined>(undefined);

	const { bag } = useExternalStore(campaign.player.sourcesWatcher);

	const dupes = useMemo<Identity[]>(() => {
		const counts: Record<IdentityKey, number> = {};

		bag.forEach(chip => {
			const key = `${chip.style}:${chip.quantity}` as const;

			counts[key] = (counts[key] ?? 0) + 1;
		});

		const identities = Object.entries(counts).filter(([, count]) => count >= 2) as [IdentityKey, number][];

		return identities.map(([key]) => ({
			key,
			style: key.split(':')[0] as Style,
			quantity: parseInt(key.split(':')[1], 10),
		}));
	}, [bag]);

	const onCombine = useCallback((duplicate: Identity) => {
		const matches = bag
			.filter(chip => chip.style === duplicate.style && chip.quantity === duplicate.quantity);

		const toDelete = matches.slice(0, 2).map(chip => chip.id);

		campaign.player.removeChips(toDelete);

		const combined = {
			style: duplicate.style,
			quantity: duplicate.quantity * 2,
		};

		campaign.player.addChips([combined]);

		setSelectedChip(duplicate);
		setNewChip(combined);
		setAnimating(true);

		setTimeout(() => {
			dialogRef.current?.showModal();
		});
	}, [bag, campaign.player]);

	return (
		<div className="stack gap-16px">
			<h2>Combiner: {props.name}</h2>
			{newChip ? (
				<div className="stack gap-8px">
					<p>Here is your new chip!</p>
					<div>
						<ChipDisplay chip={newChip} />
					</div>
					<p>Once you're ready...</p>
					<div>
						<button
							onClick={() => {
								campaign.completeCurrentActivity();
							}}
						>
							Move on
						</button>
					</div>
				</div>
			) : (
				<div className="stack gap-8px">
					<p>Here are your items we can combine.</p>
					<div className="inline wrap gap-8px">
						{dupes.map(duplicate => (
							<button
								key={duplicate.key}
								onClick={() => onCombine(duplicate)}
							>
								<ChipDisplay chip={duplicate} />
							</button>
						))}
					</div>
				</div>
			)}
			{newChip && animating && (
				<dialog
					id="combiner-dialog"
					className="stack gap-16px"
					ref={dialogRef}
					onClose={() => {
						setAnimating(false);
					}}
				>
					<div className="anim-container">
						{selectedChip && (
							<>
								<div className="float-in-left">
									<ChipDisplay chip={selectedChip} />
								</div>
								<div className="float-in-right">
									<ChipDisplay chip={selectedChip} />
								</div>
							</>
						)}
						{newChip && (
							<div className="float-result">
								<ChipDisplay chip={newChip} />
							</div>
						)}
					</div>
					<div className="combiner-action">
						<button onClick={() => setAnimating(false)}>Dismiss</button>
					</div>
				</dialog>
			)}
		</div>
	);
};
