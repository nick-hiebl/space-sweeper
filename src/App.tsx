import { useEffect, useState } from 'react';

import { boardDataPromise } from './board/board-data';
import { imageReady } from './common/Sprite';
import { Game } from './game';

import './App.css';

export const App = () => {
  const [isSpritesheetReady, setReady] = useState(false);

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
      <Game />
    </div>
  );
};
