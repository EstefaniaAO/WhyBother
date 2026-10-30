/**
 * Transition Manager & Finite State Machine — WHY BOTHER?
 * Coordinates the full narrative flow, cinematic falls, spatial retractions,
 * transitions between eras, and the interactive CREATE stage.
 *
 * Sequence:
 * 1. OPENING_BOOK (Book appears, opening story written)
 * 2. FALLING_0 -> ERA_0_ACTIVE (Book Tunnel 1865, Tenniel engraving)
 * 3. RETRACTING_0 -> TEXT_1_DISNEY (1951 adaptation text)
 * 4. FALLING_1 -> ERA_1_ACTIVE (Movie Tunnel 1951, soft watercolor)
 * 5. RETRACTING_1 -> TEXT_2_GAME (2011 video game text)
 * 6. FALLING_2 -> ERA_2_ACTIVE (Game Tunnel 2011, dark gothic watercolor)
 * 7. RETRACTING_2 -> TEXT_3_CREATE (Transition to user creation)
 * 8. CREATE_ACTIVE (Autonomous + user interactive composition)
 * 9. CONTEMPLATING (Artwork preserved + WHY BOTHER? final reflection)
 *
 * Every world opens through a keyhole (the tiny door Alice finds at the bottom of
 * the well) and every forward exit is a dive deeper into the hole: the camera
 * plunges, the scene zoom-blurs, speed lines streak and the keyhole closes.
 */
import { TunnelRings } from './systems/tunnelRings.js';
import { WonderObjects } from './systems/wonderObjects.js';

export const States = {
  OPENING_BOOK: 'OPENING_BOOK',
  FALLING_0: 'FALLING_0',
  ERA_0_ACTIVE: 'ERA_0_ACTIVE',
  RETRACTING_0: 'RETRACTING_0',
  TEXT_1_DISNEY: 'TEXT_1_DISNEY',
  FALLING_1: 'FALLING_1',
  ERA_1_ACTIVE: 'ERA_1_ACTIVE',
  RETRACTING_1: 'RETRACTING_1',
  TEXT_2_GAME: 'TEXT_2_GAME',
  FALLING_2: 'FALLING_2',
  ERA_2_ACTIVE: 'ERA_2_ACTIVE',
  RETRACTING_2: 'RETRACTING_2',
  TEXT_3_CREATE: 'TEXT_3_CREATE',
  CREATE_ACTIVE: 'CREATE_ACTIVE',
  CONTEMPLATING: 'CONTEMPLATING',
  RETRACTING_BACKWARD: 'RETRACTING_BACKWARD'
};

export class TransitionManager {
  constructor(aliceController, bookTunnel, movieTunnel, gameTunnel, createStage, lightWaves, pocketWatch, callbacks = {}, fx = null, sfx = null) {
    this.fx = fx;
    this.sfx = sfx;
    this.alice = aliceController;
    this.tunnels = [bookTunnel, movieTunnel, gameTunnel];
    this.createStage = createStage;
    this.lightWaves = lightWaves;
    this.watch = pocketWatch;
    this.callbacks = callbacks;

    this.state = States.OPENING_BOOK;
    this.activeEra = 0; // 0: Book, 1: Movie, 2: Game, 3: Create
    this.tunnelSpeedMultiplier = 1.0;

    // Retraction state
    this.isRetractingTunnel = false;
    this.retractTime = 0;
    this.retractDuration = 1.5;
    this.retractDirection = 1;
    this.currentRetractEra = 0;

    // Live depth layers per era (rings rushing past + Wonderland objects)
    const styles = ['ink', 'toon', 'gothic'];
    this.eraLayers = styles.map((st, i) => ({
      rings: new TunnelRings(st),
      objects: new WonderObjects({ style: st, mode: 'tunnel', maxObjects: [11, 14, 12][i] })
    }));
    this.rimColors = [[235, 196, 120], [140, 235, 230], [235, 50, 90]];
  }

  /** Index of the tunnel currently on screen, or -1 */
  activeTunnelIndex() {
    if (this.isRetractingTunnel) return this.currentRetractEra;
    switch (this.state) {
      case States.FALLING_0: case States.ERA_0_ACTIVE: return 0;
      case States.FALLING_1: case States.ERA_1_ACTIVE: return 1;
      case States.FALLING_2: case States.ERA_2_ACTIVE: return 2;
      default: return -1;
    }
  }

  isInterludeState() {
    return this.state === States.OPENING_BOOK || this.state === States.TEXT_1_DISNEY ||
      this.state === States.TEXT_2_GAME || this.state === States.TEXT_3_CREATE;
  }

  /** Open a world through the keyhole */
  openWorld(era) {
    if (!this.fx) return;
    this.fx.setLook(era);
    this.fx.irisTo(1, 1.7, { from: 0, shape: 'keyhole', rim: this.rimColors[era] || [235, 196, 120] });
    this.fx.triggerFlash(era === 2 ? '220, 30, 70' : (era === 1 ? '200, 235, 255' : '255, 245, 225'), 0.35, 1.2);
    if (this.sfx) this.sfx.chime([523, 660, 392][era] || 523);
  }

  resetEraLayers(era) {
    const L = this.eraLayers[era];
    if (!L) return;
    L.rings.reset();
    L.objects.reset(true);
  }

  start() {
    this.setState(States.OPENING_BOOK);
  }

  setState(newState) {
    this.state = newState;
    if (this.callbacks.onStateChanged) {
      this.callbacks.onStateChanged(newState, this.activeEra);
    }
  }

  /**
   * Called by user interaction (Space or click) when narrative text finishes
   */
  onNarrativeFinished() {
    if (this.state === States.OPENING_BOOK) {
      this.startFirstFall();
    } else if (this.state === States.TEXT_1_DISNEY) {
      this.startSecondFall();
    } else if (this.state === States.TEXT_2_GAME) {
      this.startThirdFall();
    } else if (this.state === States.TEXT_3_CREATE) {
      this.startCreateStage();
    }
  }

  /**
   * Phase 1 -> 2: First cinematic fall into original book tunnel
   */
  startFirstFall() {
    this.activeEra = 0;
    this.setState(States.FALLING_0);
    this.tunnelSpeedMultiplier = 1.0;
    this.tunnels[0].reset();
    this.resetEraLayers(0);
    this.openWorld(0);

    if (this.callbacks.onHideWatch) this.callbacks.onHideWatch();

    this.alice.triggerFall(0, () => {
      this.setState(States.ERA_0_ACTIVE);
      this.watch.setEra(0);
      if (this.callbacks.onShowWatch) this.callbacks.onShowWatch(0);
    });
  }

  /**
   * Phase 3 -> 4: Second cinematic fall into 1951 movie tunnel
   */
  startSecondFall() {
    this.activeEra = 1;
    this.setState(States.FALLING_1);
    this.tunnelSpeedMultiplier = 1.0;
    this.tunnels[1].init(this.tunnels[1].width, this.tunnels[1].height);
    this.resetEraLayers(1);
    this.openWorld(1);

    if (this.callbacks.onHideWatch) this.callbacks.onHideWatch();

    this.alice.triggerFall(1, () => {
      this.setState(States.ERA_1_ACTIVE);
      this.watch.setEra(1);
      if (this.callbacks.onShowWatch) this.callbacks.onShowWatch(1);
    });
  }

  /**
   * Phase 5 -> 6: Third cinematic fall into 2011 video game tunnel
   */
  startThirdFall() {
    this.activeEra = 2;
    this.setState(States.FALLING_2);
    this.tunnelSpeedMultiplier = 1.0;
    this.tunnels[2].init(this.tunnels[2].width, this.tunnels[2].height);
    this.resetEraLayers(2);
    this.openWorld(2);

    if (this.callbacks.onHideWatch) this.callbacks.onHideWatch();

    this.alice.triggerFall(2, () => {
      this.setState(States.ERA_2_ACTIVE);
      this.watch.setEra(2);
      if (this.callbacks.onShowWatch) this.callbacks.onShowWatch(2);
    });
  }

  /**
   * Phase 7 -> 8: Start CREATE stage (No Alice falling; emerges from darkness)
   */
  startCreateStage() {
    this.activeEra = 3;
    this.setState(States.CREATE_ACTIVE);
    this.tunnelSpeedMultiplier = 1.0;

    // Alice is not drawn in CREATE stage
    this.alice.alpha = 0;

    // Initialize CREATE stage canvas
    const width = this.tunnels[0].width;
    const height = this.tunnels[0].height;
    this.createStage.init(width, height);
    if (this.fx) {
      this.fx.setLook(3);
      this.fx.setIris(1);
      this.fx.triggerFlash('255, 248, 235', 0.3, 1.8);
    }
    if (this.sfx) this.sfx.chime(784);

    this.watch.setEra(3);
    if (this.callbacks.onShowWatch) this.callbacks.onShowWatch(3);
    if (this.callbacks.onEnterCreate) this.callbacks.onEnterCreate();
  }

  /**
   * Called when user spins the Pocket Watch
   * @param {number} direction 1 = clockwise (forward), -1 = counter-clockwise (backward)
   */
  triggerWatchTransition(direction = 1) {
    if (this.isRetractingTunnel) return; // Prevent overlapping transitions

    if (this.state === States.ERA_0_ACTIVE) {
      if (direction > 0) {
        // Forward from Book -> Disney
        this.beginRetraction(0, 1, () => {
          this.setState(States.TEXT_1_DISNEY);
        });
      }
    } else if (this.state === States.ERA_1_ACTIVE) {
      if (direction > 0) {
        // Forward from Disney -> Game
        this.beginRetraction(1, 1, () => {
          this.setState(States.TEXT_2_GAME);
        });
      } else {
        // Backward from Disney -> Book
        this.beginRetraction(1, -1, () => {
          this.activeEra = 0;
          this.startFirstFall();
        });
      }
    } else if (this.state === States.ERA_2_ACTIVE) {
      if (direction > 0) {
        // Forward from Game -> CREATE!
        this.beginRetraction(2, 1, () => {
          this.setState(States.TEXT_3_CREATE);
        });
      } else {
        // Backward from Game -> Disney
        this.beginRetraction(2, -1, () => {
          this.activeEra = 1;
          this.startSecondFall();
        });
      }
    } else if (this.state === States.CREATE_ACTIVE) {
      if (direction < 0) {
        // Backward from CREATE -> Game: the bloom closes back into a circle
        if (this.callbacks.onHideWatch) this.callbacks.onHideWatch();
        if (this.callbacks.onLeaveCreate) this.callbacks.onLeaveCreate();
        this.isRetractingTunnel = true; // block re-entry while closing
        if (this.sfx) this.sfx.whoosh(1.0, false);
        const go = () => {
          this.isRetractingTunnel = false;
          this.activeEra = 2;
          this.startThirdFall();
        };
        if (this.fx) this.fx.irisTo(0, 0.8, { shape: 'circle', rim: [255, 215, 90], onDone: go });
        else go();
      }
    }
  }

  /**
   * Spatial Retraction:
   * Alice accelerates spin & plunges into vanishing point.
   * Composition retracts spatially into central rabbit hole aperture.
   */
  beginRetraction(fromEra, direction, onComplete) {
    this.isRetractingTunnel = true;
    this.currentRetractEra = fromEra;
    this.retractDirection = direction;
    this.retractTime = 0;
    this.retractDuration = 1.5;

    if (this.callbacks.onHideWatch) this.callbacks.onHideWatch();
    this.watch.setTransitionState(true);

    if (this.fx) {
      const rim = this.rimColors[fromEra] || [235, 196, 120];
      if (direction > 0) {
        // Dive deeper: keyhole closes at the end of the plunge
        this.fx.irisTo(0, 0.7, { from: 1, delay: 0.85, shape: 'keyhole', rim });
      } else {
        // Pull back in time: a circular iris closes while the world shrinks away
        this.fx.irisTo(0, 0.8, { from: 1, delay: 0.7, shape: 'circle', rim: [255, 240, 210] });
        this.fx.triggerFlash('255, 236, 200', 0.25, 0.8);
      }
    }
    if (this.sfx) this.sfx.whoosh(1.5, direction > 0);

    // Alice retracts into vanishing point
    this.alice.triggerRetract(direction);

    this.onRetractionDone = () => {
      this.isRetractingTunnel = false;
      this.watch.setTransitionState(false);
      onComplete();
    };
  }

  triggerContemplate() {
    if (this.state !== States.CREATE_ACTIVE) return;
    this.setState(States.CONTEMPLATING);
    this.createStage.contemplate();
    if (this.callbacks.onContemplate) {
      this.callbacks.onContemplate();
    }
  }

  resumeCreating() {
    if (this.state !== States.CONTEMPLATING) return;
    this.setState(States.CREATE_ACTIVE);
    this.createStage.resume();
    if (this.callbacks.onResumeCreate) {
      this.callbacks.onResumeCreate();
    }
  }

  update(dt) {
    // Retraction timer
    if (this.isRetractingTunnel) {
      this.retractTime += dt;
      const progress = Math.min(1.0, this.retractTime / this.retractDuration);
      this.tunnelSpeedMultiplier = 1.0 + progress * 3.5;

      if (this.retractTime >= this.retractDuration) {
        if (this.onRetractionDone) {
          const cb = this.onRetractionDone;
          this.onRetractionDone = null;
          cb();
        }
      }
    } else {
      this.tunnelSpeedMultiplier = 1.0;
    }

    // Speed lines: strong during dives, fading during the opening fall
    if (this.fx) {
      let sl = 0;
      if (this.isRetractingTunnel && this.state !== States.CREATE_ACTIVE) {
        sl = Math.min(1, this.retractTime / this.retractDuration) * (this.retractDirection > 0 ? 1 : 0.5);
      } else if (this.alice.isFalling) {
        sl = Math.max(0, 1 - this.alice.fallElapsed / this.alice.fallDuration) * 0.7;
      }
      this.fx.speedLines = sl;
    }
  }

  /** Update only what is on screen (tunnel paint + depth layers) */
  updateScene(dt) {
    const idx = this.activeTunnelIndex();
    if (idx < 0) return;
    const sm = this.tunnelSpeedMultiplier;
    // While falling in, everything rushes a bit faster and settles
    const fallBoost = this.alice.isFalling ? 1 + 2.2 * Math.max(0, 1 - this.alice.fallElapsed / this.alice.fallDuration) : 1;
    this.tunnels[idx].update(dt, sm);
    const L = this.eraLayers[idx];
    L.rings.update(dt, sm * fallBoost);
    L.objects.update(dt, sm * fallBoost);
  }

  renderEraScene(ctx, idx, width, height, cx, cy) {
    this.tunnels[idx].render(ctx, width, height, cx, cy, this.lightWaves, 1.0);
    const L = this.eraLayers[idx];
    L.rings.render(ctx, width, height, cx, cy, 1);
    L.objects.render(ctx, width, height, cx, cy, 1);
  }

  renderTunnels(ctx, width, height, cx, cy) {
    if (this.state === States.CREATE_ACTIVE || this.state === States.CONTEMPLATING) {
      this.createStage.render(ctx);
      return;
    }

    if (this.isRetractingTunnel) {
      const t = Math.min(1.0, this.retractTime / this.retractDuration);
      const idx = this.currentRetractEra;
      if (!this.tunnels[idx]) return;
      ctx.save();
      ctx.translate(cx, cy);
      if (this.retractDirection > 0) {
        // Forward: the camera plunges INTO the hole, spiralling
        ctx.rotate(t * t * 0.9);
        const s = 1 + Math.pow(t, 2.3) * 4.2;
        ctx.scale(s, s);
      } else {
        // Backward: the world spins away and shrinks into the past
        ctx.rotate(-t * t * 0.8);
        const s = Math.max(0.001, 1.0 - Math.pow(t, 1.8) * 0.995);
        ctx.scale(s, s);
      }
      ctx.translate(-cx, -cy);
      this.renderEraScene(ctx, idx, width, height, cx, cy);
      ctx.restore();

      // Cheap radial zoom blur: re-stamp the frame onto itself, slightly scaled
      if (this.retractDirection > 0 && t > 0.05) {
        const canvas = ctx.canvas;
        ctx.save();
        for (let k = 1; k <= 2; k++) {
          const z = 1 + 0.045 * k * (0.4 + t);
          ctx.globalAlpha = 0.22 / k;
          ctx.setTransform(z, 0, 0, z, cx * (1 - z), cy * (1 - z));
          ctx.drawImage(canvas, 0, 0, width, height);
        }
        ctx.restore();
      }

      // Central suction hole
      const holeR = 38 + t * 60;
      const holeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, holeR);
      holeGrad.addColorStop(0, '#000000');
      holeGrad.addColorStop(0.7, 'rgba(8, 6, 10, 0.85)');
      holeGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = holeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, holeR, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Active era tunnel rendering
    const idx = this.activeTunnelIndex();
    if (idx >= 0) {
      this.renderEraScene(ctx, idx, width, height, cx, cy);
    }
  }
}
