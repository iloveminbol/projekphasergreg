import Phaser from "phaser";

export default class CoronaBusterScene extends Phaser.Scene {
  constructor() {
    super("corona-buster-scene");
  }

  init() {}

  preload() {
    this.load.image("background", "images/bg_layer1.png");
  }

  create() {
    const gameWidth = this.scale.width * 0.5;
    const gameHeight = this.scale.height * 0.5;
    this.add.image(gameWidth, gameHeight, "background");
  }

  update() {}
}
