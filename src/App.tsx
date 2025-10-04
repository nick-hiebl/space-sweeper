import { useEffect, useState } from 'react';

import { imageReady } from './common/Sprite';
import { Game } from './game';

import './App.css';

export const App = () => {
  const [isSpritesheetReady, setReady] = useState(false);

  useEffect(() => {
    imageReady.then(() => {
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
