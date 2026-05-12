import { useEffect, useState } from 'react';

import { boardDataPromise } from './board/board-data';
import { imageReady } from './common/Sprite';
import { Game } from './game';

import './App.css';

export const App = () => {
	const [isSpritesheetReady, setReady] = useState(false);

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
			<Game />
		</div>
	);
};
