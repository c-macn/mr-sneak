import Player from '../assets/phaserguy.png';
import TileMap from '../assets/levels/test_level.json';
import TileSet from '../assets/levels/factory_tileset.png';
import SokoTileset from '../assets/levels/sokoban_tilesheet.png';


import { Scene } from 'phaser';
import { CST } from '../constants';


class LoadGame extends Scene {
  constructor() {
    super({ key: CST.SCENES.LOAD });
  }

  public preload() {
    this.load.image('factory_tileset', TileSet);
    this.load.image('player', Player);
    this.load.image('soko_tileset', SokoTileset);
    this.load.tilemapTiledJSON('map', TileMap);

    this.load.on('fileprogress', (file) => {
      console.log(file.src);
    })

    this.load.on('progress', (val) => {
      console.log(val);
    });

    this.load.on('complete', () => {
      console.log('loaded assets');
    });
  }

  /**
   * create
   */
  public create() {
    this.scene.start(CST.SCENES.MENU);
  }
}

export default LoadGame;