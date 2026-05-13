import { Travel } from '.';

type Props = {
	travel: Travel;
};

export const TravelComponent = ({ travel }: Props) => {
	return (
		<div className="stack">
			<h1>Travel</h1>
			<pre>{JSON.stringify(travel.currentAction)}</pre>
		</div>
	);
};
