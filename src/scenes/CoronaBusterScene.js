import Phaser from "phaser";

import FallingObject from "../ui/FallingObject.js";

import Laser from "../ui/Laser.js";
import ScoreLabel from "../ui/ScoreLabel.js";
import LifeLabel from "../ui/LifeLabel.js";
export default class CoronaBusterScene extends Phaser.Scene {
  constructor() { 
    super("corona-buster-scene");
  }

  init() {
    this.cloud = undefined;
    this.nav_left = false;
    this.nav_right = false;
    this.shoot = false;
    this.player = undefined;
    this.speed = 100;
    this.cursors = undefined;
    this.enemies = undefined;
    this.enemySpeed = 60;
    this.lasers = undefined;
    this.lastFired = 0;
    this.scoreLabel = undefined;
    this.lifeLabel = undefined;
    this.handsanitizers = undefined;
    this.backsound = undefined;
  }

  preload() {
    this.load.image("background", "images/bg-1.png");
    this.load.image("cloud", "images/saturn.png");
    this.load.image("left-btn", "images/left-btn.png");
    this.load.image("right-btn", "images/right-btn.png");
    this.load.image("shoot-btn", "images/shoot-btn.png");
    this.load.spritesheet("player", "images/ship.png", {
      frameWidth: 66,
      frameHeight: 66,
    });
    this.load.image("enemy", "images/batu1.png");
    this.load.spritesheet("laser", "images/laser-bolts.png", {
      frameWidth: 16,
      frameHeight: 32,
      startFrame: 16,
      endFrame: 32,
    });
    this.load.image("handsanitizer", "images/obeng1.png");
    this.load.audio("laserSound", "sfx/sfx_laser.ogg");
    this.load.audio("destroySound", "sfx/destroy.mp3");
    this.load.audio("handsanitizerSound", "sfx/handsanitizer.mp3");
    this.load.audio("backsound", "sfx/backsound/SkyFire.ogg");
    this.load.audio("gameOverSound", "sfx/gameover.wav");
  }

  create() {
    const gameWidth = this.scale.width * 0.5;
    const gameHeight = this.scale.height * 0.5;
    this.add.image(gameWidth, gameHeight, "background");

    this.clouds = this.physics.add.group({
      key: "cloud",
      //ulangi tampilkan awan
      repeat: 10,
    });

    Phaser.Actions.RandomRectangle(
      this.clouds.getChildren(),
      this.physics.world.bounds
    );

    this.createButton();

    this.player = this.createPlayer();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.enemies = this.physics.add.group({
      classType: FallingObject,
      //banyaknya enemy dalam satu kali grup
      maxSize: 10,
      runChildUpdate: true,
    });

    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.lasers = this.physics.add.group({
      classType: Laser,
      maxSize: 10,
      runChildUpdate: true,
    });

    this.physics.add.overlap(
      this.lasers,
      this.enemies,
      this.hitEnemy,
      undefined,
      this
    );

    this.scoreLabel = this.createScoreLabel(16, 16, 0);

    this.lifeLabel = this.createLifeLabel(16, 43, 3);

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.decreaseLife,
      null,
      this
    );

    this.handsanitizers = this.physics.add.group({
      classType: FallingObject,
      runChildUpdate: true,
    });

    this.time.addEvent({
      delay: 10000,
      callback: this.spawnHandsanitizer,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.overlap(
      this.player,
      this.handsanitizers,
      this.increaseLife,
      null,
      this
    );

    this.backsound = this.sound.add("backsound");
    var soundConfig = {
      loop: true,
    };
    this.backsound.play(soundConfig);
  }

  update(time) {
    this.clouds.children.iterate((child) => {
      //arah gerak awan ke bawah
      child.setVelocityY(20);
      if (child.y > this.scale.height) {
        child.x = Phaser.Math.Between(10, 400);
        child.y = child.displayHeight * -1;
      }
    });

    this.movePlayer(this.player, time);
  }

  createButton() {
    this.input.addPointer(3);

    let shoot = this.add
      .image(320, 550, "shoot-btn")
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8);

    let nav_left = this.add
      .image(50, 550, "left-btn")
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8);

    let nav_right = this.add
      .image(nav_left.x + nav_left.displayWidth + 20, 550, "right-btn")
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8);

    nav_left.on(
      "pointerdown",
      () => {
        this.nav_left = true;
      },
      this
    );
    nav_left.on(
      "pointerout",
      () => {
        this.nav_left = false;
      },
      this
    );
    nav_right.on(
      "pointerdown",
      () => {
        this.nav_right = true;
      },
      this
    );
    nav_right.on(
      "pointerout",
      () => {
        this.nav_right = false;
      },
      this
    );
    shoot.on(
      "pointerdown",
      () => {
        this.shoot = true;
      },
      this
    );
    shoot.on(
      "pointerout",
      () => {
        this.shoot = false;
      },
      this
    );
  }

  createPlayer() {
    const player = this.physics.add.sprite(200, 450, "player");
    player.setCollideWorldBounds(true);
    this.anims.create({
      key: "turn",
      frames: [{ key: "player", frame: 0 }],
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 1, end: 2 }),
      frameRate: 10,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 1, end: 2 }),
      frameRate: 10,
    });
    return player;
  }

  movePlayer(player, time) {
    if (this.cursors.left.isDown || this.nav_left) {
      this.player.setVelocityX(this.speed * -1);
      this.player.anims.play("left", true);
      this.player.setFlipX(false);
    } else if (this.cursors.right.isDown || this.nav_right) {
      this.player.setVelocityX(this.speed);
      this.player.anims.play("right", true);
      this.player.setFlipX(true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(this.speed * -1);
      this.player.anims.play("turn", true);
      this.player.setFlipY(false);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.speed);
      this.player.anims.play("turn", true);
      this.player.setFlipY(false);
    } else {
      this.player.setVelocityY(0);
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if ((this.cursors.space.isDown || this.shoot) && time > this.lastFired) {
      const laser = this.lasers.get(0, 0, "laser");
      if (laser) {
        laser.fire(this.player.x, this.player.y);
        this.lastFired = time + 150;
        //tambahkan kode di bawah ini
        this.sound.play("laserSound");
      }
    }
  }

  spawnEnemy() {
    const config = {
      speed: this.enemySpeed,
      rotation: 0.06,
    };
    const enemy = this.enemies.get(0, 0, "enemy", config);
    const enemyWidth = enemy.displayWidth;
    const positionX = Phaser.Math.Between(
      enemyWidth,
      this.scale.width - enemyWidth
    );
    if (enemy) {
      enemy.spawn(positionX);
    }
  }

  hitEnemy(laser, enemy) {
    laser.erase(); //destroy laser yg bersentuhan
    enemy.die(); //destroy enemy yg bersentuhan

    //tambahkan kode di bawah ini
    this.sound.play("destroySound");

    //Score Bertambah
    this.scoreLabel.add(100);
    if (this.scoreLabel.getScore() % 100 == 0) {
      this.enemySpeed += 30;
    } else if (this.scoreLabel.getScore() > 200) {
      this.enemySpeed += 10000;
    }
  }

  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#E0FFFF" };
    const label = new ScoreLabel(this, x, y, score, style).setDepth(1);
    this.add.existing(label);
    return label;
  }

  createLifeLabel(x, y, life) {
    const style = { fontSize: "32px", fill: "#ADFF2F" };
    const label = new LifeLabel(this, x, y, life, style).setDepth(1);
    this.add.existing(label);
    return label;
  }

  decreaseLife(player, enemy) {
    enemy.die();
    this.lifeLabel.subtract(1);
    if (this.lifeLabel.getLife() == 2) {
      player.setTint(0xff0000);
    } else if (this.lifeLabel.getLife() == 1) {
      player.setTint(0xff0000).setAlpha(0.2);
    } else if (this.lifeLabel.getLife() == 0) {
      this.scene.start("game-over-scene", {
        score: this.scoreLabel.getScore(),
      });
      //tambahkan kode di bawah ini
      this.sound.stopAll();
      this.sound.play("gameOverSound");
    }
  }

  spawnHandsanitizer() {
    const config = {
      speed: 60,
      rotation: 0,
    };
    const handsanitizer = this.handsanitizers.get(
      0,
      0,
      "handsanitizer",
      config
    );
    const handsanitizerWidth = handsanitizer.displayWidth;
    const positionX = Phaser.Math.Between(
      handsanitizerWidth,
      this.scale.width - handsanitizerWidth
    );
    if (handsanitizer) {
      handsanitizer.spawn(positionX);
    }
  }

  increaseLife(player, handsanitizer) {
    handsanitizer.die();
    this.lifeLabel.add(1);

    //tambahkan kode di bawah ini
    this.sound.play("handsanitizerSound");

    if (this.lifeLabel.getLife() >= 1) {
      player.clearTint().setAlpha(2);
    }
  }
}