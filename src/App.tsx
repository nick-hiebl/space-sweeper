import { useEffect, useState } from 'react';

import { boardDataPromise } from './board/board-data';
import { imageReady } from './common/Sprite';
import { Game } from './game';
import { Campaign } from './state/campaigns/campaign';

import './App.css';

export const App = () => {
	const [isSpritesheetReady, setReady] = useState(false);
	const [campaign] = useState(new Campaign());

	useEffect(() => {
		console.log('Effect');
		const allPromises = Promise.all([
			imageReady,
			boardDataPromise,
		]);

		imageReady.then(() => console.log('images loaded'));
		boardDataPromise.then(() => console.log('board loaded'));

		allPromises.then(() => {
			setReady(true);
		});
	}, []);

	if (!isSpritesheetReady) {
		return <div>Loading...</div>
	}

	return (
		<div>
			<Game campaign={campaign} />
		</div>
	);
};
