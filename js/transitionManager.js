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
 */

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
  constructor(aliceController, bookTunnel, movieTunnel, gameTunnel, createStage, lightWaves, pocketWatch, callbacks = {}) {
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
        // Backward from CREATE -> Game
        if (this.callbacks.onHideWatch) this.callbacks.onHideWatch();
        this.activeEra = 2;
        this.startThirdFall();
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
  }

  renderTunnels(ctx, width, height, cx, cy) {
    if (this.state === States.CREATE_ACTIVE || this.state === States.CONTEMPLATING) {
      this.createStage.render(ctx);
      return;
    }

    if (this.isRetractingTunnel) {
      const t = Math.min(1.0, this.retractTime / this.retractDuration);
      const tunnel = this.tunnels[this.currentRetractEra];
      if (tunnel && tunnel.offscreenCanvas) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * t * 0.8 * this.retractDirection);
        const s = Math.max(0.001, 1.0 - Math.pow(t, 1.8) * 0.995);
        ctx.scale(s, s);
        ctx.translate(-cx, -cy);
        ctx.drawImage(tunnel.offscreenCanvas, 0, 0);
        ctx.restore();

        // Central dark suction hole
        const holeR = 38 + t * 24;
        const holeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, holeR);
        holeGrad.addColorStop(0, '#000000');
        holeGrad.addColorStop(0.7, '#08060a');
        holeGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = holeGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, holeR, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // Active era tunnel rendering
    if (this.state === States.FALLING_0 || this.state === States.ERA_0_ACTIVE) {
      this.tunnels[0].render(ctx, width, height, cx, cy, this.lightWaves, 1.0);
    } else if (this.state === States.FALLING_1 || this.state === States.ERA_1_ACTIVE) {
      this.tunnels[1].render(ctx, width, height, cx, cy, this.lightWaves, 1.0);
    } else if (this.state === States.FALLING_2 || this.state === States.ERA_2_ACTIVE) {
      this.tunnels[2].render(ctx, width, height, cx, cy, this.lightWaves, 1.0);
    }
  }
}
