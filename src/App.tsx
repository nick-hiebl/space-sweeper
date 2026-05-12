import { useEffect, useState } from 'react';

import { boardDataPromise } from './board/board-data';
import { imageReady } from './common/Sprite';
import { Game } from './game';
import { Campaign } from './state/campaigns/campaign';
import { CampaignContextProvider } from './state/campaigns/context';

import './App.css';

export const App = () => {
	const [isSpritesheetReady, setReady] = useState(false);
	const [campaign] = useState(new Campaign());

	useEffect(() => {
		const allPromises = Promise.all([
			imageReady,
			boardDataPromise,
		]);

		allPromises.then(() => {
			setReady(true);
		});
	}, []);

	if (!isSpritesheetReady) {
		return <div>Loading...</div>
	}

	return (
		<div>
			<CampaignContextProvider campaign={campaign}>
				<Game />
			</CampaignContextProvider>
		</div>
	);
};
