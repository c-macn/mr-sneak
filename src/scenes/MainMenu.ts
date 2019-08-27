import { Scene } from 'phaser';
import { CST } from '../constants';

class MainMenu extends Scene {
  constructor() {
    super({ key: CST.SCENES.MENU });
  }

  /**
   * create
   */
  public create(): void {
    console.log('Hello from Main Menu');
    this.scene.start(CST.SCENES.GAME);
  }
}

export default MainMenu;