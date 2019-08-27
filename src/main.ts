import { Game } from 'phaser';
import { CST } from './constants';

import GameScene from './scenes/Game';
import LoadGame from './scenes/LoadGame';
import MainMenu from './scenes/MainMenu';

const game = new Game({
  width: CST.GAME.WIDTH,
  height: CST.GAME.HEIGHT,
  type: Phaser.WEBGL,
  scene: [LoadGame, MainMenu, GameScene],
  title: 'Stealthoban',
  parent: 'game'
});

// This is for preventing re-run multiple scenes
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
}
