import * as easystarjs from 'easystarjs';

import { Scene, Geom } from 'phaser';
import { CST } from '../constants';

class GameScene extends Scene {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private map: Phaser.Tilemaps.Tilemap;
  private finder: easystarjs.js;
  private marker: Phaser.GameObjects.Graphics;
  private player: Phaser.GameObjects.Image;
  private playerRect: Geom.Rectangle;
  private enemy: Phaser.GameObjects.Image;

  constructor() {
    super({key: CST.SCENES.GAME});
  }

  public create(): void {
    this.input.on('pointerup', this.handleClick.bind(this));
    this.map = this.make.tilemap({ key: 'map' });
    this.finder = new easystarjs.js();
    this.camera = this.cameras.main;
   
    this.camera.setBounds(0, 0, 10*32, 20*32);
    this.map.createStaticLayer(0, this.map.addTilesetImage('factory_tileset', 'factory_tileset'), 0.0);

    this.marker = this.add.graphics();
    this.marker.lineStyle(3, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

    this.player = this.add.image(32, 32, 'player');
    this.player.setDepth(1);
    this.player.setOrigin(0, 0.5);
    this.camera.startFollow(this.player);
    
    this.enemy = this.add.image(32 * 6, 32 * 8, 'player');
    this.enemy.setDepth(1);
    this.enemy.setOrigin(0, 0.5);

    const grid = this.populatePathfindingGrid(this.map);
    this.finder.setGrid(grid);

    const acceptableTiles = this.setAcceptableTiles(this.map, this.finder);
    this.finder.setAcceptableTiles(acceptableTiles);
  }

  public update() {
    const worldPoint: any = this.input.activePointer.positionToCamera(this.camera);

    const pointerTileX = this.map.worldToTileX(worldPoint.x);
    const pointerTileY = this.map.worldToTileX(worldPoint.y);

    this.marker.x = this.map.tileToWorldX(pointerTileX);
    this.marker.y = this.map.tileToWorldY(pointerTileY);
    this.marker.setVisible(!this.checkCollision(this.map, pointerTileX, pointerTileY));

    // player colliderRectangle
    const { x, y, width, height } = this.player;
    this.playerRect = new Geom.Rectangle(x, y, width, height);

    // raycasting
    const visionEndY = this.enemy.y + (32 * 4);
    const ray: Geom.Line = new Geom.Line(this.enemy.x, this.enemy.y, this.enemy.x, visionEndY);
    
    if (Geom.Intersects.LineToRectangle(ray, this.playerRect)) {
      console.log(`You've been spooted`);
    }

  }

  private getTileID(map: Phaser.Tilemaps.Tilemap, x: number, y: number): number {
    const tile = map.getTileAt(x, y);
    return tile ? tile.index : null;
  }

  private checkCollision(map: Phaser.Tilemaps.Tilemap, x: number, y: number) {
    const tile = map.getTileAt(x, y);
    return tile ? tile.properties.isCollider === true : false;
  }

  private handleClick(pointer: Phaser.Input.Pointer) {
    const x = this.camera.scrollX + pointer.x;
    const y = this.camera.scrollY + pointer.y;
    const toX = Math.floor(x / 32);
    const toY = Math.floor(y / 32);
    const fromX = Math.floor(this.player.x / 32);
    const fromY = Math.floor(this.player.y / 32);

    console.log(`finder a path from (x: ${fromX}, y: ${fromY}) to (x: ${toX}, y: ${toY})`);

    this.finder.findPath(fromX, fromY, toX, toY, (path) => {
      path === null ? console.warn('No Path found') : this.movePlayer(this.player, path, this.map);
    });

    this.finder.calculate();
  }

  private movePlayer(player: Phaser.GameObjects.Image, path: any[], map: Phaser.Tilemaps.Tilemap): void {
    const tweens = [];

    for (let i = 0; i < path.length - 1; i++) {
      const moveToX = path[i + 1].x;
      const moveToY = path[i + 1].y;
      tweens.push({
        targets: player,
        x: { value: moveToX * map.tileWidth, duration: 200 },
        y: { value: moveToY * map.tileHeight, duration: 200 }
      });
    }

    this.tweens.timeline({tweens});
  }
  private populatePathfindingGrid(map: Phaser.Tilemaps.Tilemap): number[][] {
    const grid = [];
    for (let y = 0; y < map.height; y++) {
      const col = [];
      for (let x = 0; x < map.width; x++) {
        const tile = this.getTileID(map, x, y);
        if (tile) {
          col.push(tile);
        }
      }
      grid.push(col);
    }

    return grid;
  }

  private setAcceptableTiles(map: Phaser.Tilemaps.Tilemap, finder: easystarjs.js) {
    const tileset = map.tilesets[0];
    const { tileProperties, total, firstgid } = tileset;
    const acceptableTiles = [];

    for (let i = firstgid -1; i < total; i++) {
      if (!tileProperties.hasOwnProperty(i)) {
        acceptableTiles.push(i + 1);
        continue;
      }

      if (!tileProperties[i].isCollider) { acceptableTiles.push(i + 1); }
      if (tileProperties[i].cost) { finder.setTileCost(i + 1, tileProperties[i].cost); }
    }

    return acceptableTiles;
  }
}

export default GameScene;