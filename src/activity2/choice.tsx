import { useState } from 'react';

import { ChipDisplay } from '../common/ChipDisplay';
import { useCampaign } from '../state/campaigns/context';
import { ChoiceActivity, IndividualChoice } from '../state/campaigns/types';

type Props = ChoiceActivity;

export const ChoiceComponent = (props: Props) => {
	const campaign = useCampaign();

	const [done, setDone] = useState(false);

	return (
		<div className="stack gap-16px">
			<h2>Choice: {props.name}</h2>
			{done ? (
				<div>
					<button className="button" onClick={() => campaign.completeCurrentActivity()}>Proceed</button>
				</div>
			) : (
				<ul className="stack gap-8px">
					{props.choices.map((choice, index) => (
						<SingleChoice choice={choice} onSelect={() => setDone(true)} key={index} />
					))}
				</ul>
			)}
		</div>
	);
};

const SingleChoice = ({ choice, onSelect }: { choice: IndividualChoice; onSelect: () => void }) => {
	const campaign = useCampaign();

	return (
		<li>
			<button
				className="button inline gap-16px inline-center"
				onClick={() => {
					choice.onSelect(campaign);

					onSelect();
				}}
			>
				{choice.text}
				{choice.chips && (
					<ul>
						{choice.chips.map((chip, index) => (
							<li key={index}>
								<ChipDisplay chip={chip} />
							</li>
						))}
					</ul>
				)}
			</button>
		</li>
	);
};
