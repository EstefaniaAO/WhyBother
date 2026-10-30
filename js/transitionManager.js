/**
 * Transition Manager & Finite State Machine
 * Coordinates the 6 phases of the rabbit hole descent across 4 stages:
 * - 0: Libro Original (1865)
 * - 1: Película Animada (1951)
 * - 2: Videojuego Siniestro (2000)
 * - 3: Etapa CREATE (El usuario se convierte en co-creador)
 *
 * Sequence: Libro -> Película -> Videojuego -> CREATE (and reverse)
 */

export const States = {
  INITIALIZING: 'INITIALIZING',
  INTRO_ANIMATION: 'INTRO_ANIMATION',
  IDLE: 'IDLE',
  TRANSITION_OUT: 'TRANSITION_OUT',
  TRANSFORMING: 'TRANSFORMING',
  TRANSITION_IN: 'TRANSITION_IN'
};

export class TransitionManager {
<<<<<<< HEAD
  constructor(aliceController, bookTunnel, movieTunnel, gameTunnel, createStage, lightWaves, pocketWatch, onEraChanged) {
=======
  constructor(aliceController, bookTunnel, movieTunnel, gameTunnel, lightWaves, pocketWatch, onEraChanged, onTransitionsMilestone) {
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    this.alice = aliceController;
    this.tunnels = [bookTunnel, movieTunnel, gameTunnel];
    this.createStage = createStage;
    this.lightWaves = lightWaves;
    this.watch = pocketWatch;
    this.onEraChanged = onEraChanged;
    this.onTransitionsMilestone = onTransitionsMilestone;

    this.state = States.INITIALIZING;
    this.currentEra = 0; // 0: Book, 1: Movie, 2: Game, 3: Create
    this.targetEra = 0;
    this.direction = 1; // 1: forward, -1: backward

    // Phase timers & durations (seconds)
    this.phaseTime = 0;
    this.phaseDuration = 0;
    this.subPhase = '';

    // Generative morphing blend [0 = currentEra, 1 = targetEra]
    this.morphProgress = 0;

    // Tunnel speed multiplier
    this.tunnelSpeedMultiplier = 1.0;

    // Total transitions counter to prompt decision
    this.transitionsCount = 0;

    // Start in intro animation
    this.startIntro();
  }

  startIntro() {
    this.state = States.INTRO_ANIMATION;
    this.phaseTime = 0;
<<<<<<< HEAD
    this.phaseDuration = 3.6;
=======
    this.phaseDuration = 3.6; // Coupled to Alice dramatic perspective fall
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    this.tunnelSpeedMultiplier = 1.0;
  }

  triggerTransition(direction = 1) {
    if (this.state !== States.IDLE) return; // Prevent overlapping transitions

    this.direction = direction;

    // Navigation calculation across 4 stages: 0, 1, 2, 3
    if (this.currentEra === 0) {
      this.targetEra = direction > 0 ? 1 : 2;
    } else if (this.currentEra === 1) {
      this.targetEra = direction > 0 ? 2 : 0;
    } else if (this.currentEra === 2) {
      this.targetEra = direction > 0 ? 3 : 1; // Entering CREATE from Game!
    } else if (this.currentEra === 3) {
      if (direction < 0) {
        this.targetEra = 2; // Returning to Game from CREATE
      } else {
        return; // Already in CREATE, keep creating
      }
    }

    this.state = States.TRANSITION_OUT;
    this.subPhase = 'PHASE_A';
    this.phaseTime = 0;
    this.phaseDuration = 0.8;
    this.morphProgress = 0;

    this.watch.setTransitionState(true);
  }

  update(dt) {
    this.phaseTime += dt;

    switch (this.state) {
      case States.INTRO_ANIMATION:
        this.tunnelSpeedMultiplier = 1.0;
        if (this.phaseTime >= this.phaseDuration) {
          this.state = States.IDLE;
        }
        break;

      case States.IDLE:
        this.tunnelSpeedMultiplier = 1.0;
        this.morphProgress = 0;
        break;

      case States.TRANSITION_OUT:
        this.handleTransitionOut(dt);
        break;

      case States.TRANSFORMING:
        this.handleTransforming(dt);
        break;

      case States.TRANSITION_IN:
        this.handleTransitionIn(dt);
        break;
    }
  }

  handleTransitionOut(dt) {
    if (this.subPhase === 'PHASE_A') {
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      this.tunnelSpeedMultiplier = 1.0 + t * 2.8;

<<<<<<< HEAD
      if (this.currentEra < 3) {
        const startSpin = this.direction * (t * t) * Math.PI * 0.8;
        this.alice.setTransitionTransform(1.0, startSpin, 1.0, 0, 0);
      }

      if (this.phaseTime >= this.phaseDuration) {
=======
      // Start gentle rotation acceleration
      const startSpin = this.direction * (t * t) * Math.PI * 0.8;
      this.alice.setTransitionTransform(1.0, startSpin, 1.0, 0, 0);

      if (this.phaseTime >= this.phaseDuration) {
        // Move to Phase B: Descent (Alice spins & physically plunges into depth)
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
        this.subPhase = 'PHASE_B';
        this.phaseTime = 0;
        this.phaseDuration = 1.4;
      }
    } else if (this.subPhase === 'PHASE_B') {
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      const ease = t * t * t;

      this.tunnelSpeedMultiplier = 3.8 + t * 1.5;

<<<<<<< HEAD
      if (this.currentEra < 3) {
        // Alice physical 3D plunge into the central hole
        const scale = Math.max(0.005, 1.0 - ease * 0.995);
        const spin = this.direction * (Math.PI * 0.8 + ease * Math.PI * 6.5);
        const alpha = scale > 0.04 ? 1.0 : (scale / 0.04);
        const offsetY = ease * 18;

        this.alice.setTransitionTransform(scale, spin, alpha, 0, offsetY);
      }

      if (this.phaseTime >= this.phaseDuration) {
        this.subPhase = 'PHASE_C';
        this.phaseTime = 0;
        this.phaseDuration = 0.25;
        this.alice.setTransitionTransform(0.001, 0, 0.0, 0, 0);
=======
      // Physical scale plunge down to 0.005 at vanishing point
      const scale = Math.max(0.005, 1.0 - ease * 0.995);
      const spin = this.direction * (Math.PI * 0.8 + ease * Math.PI * 6.5);

      // NO early opacity fades! Remains solid until it enters the tiny core aperture
      const alpha = scale > 0.04 ? 1.0 : (scale / 0.04);
      const offsetY = ease * 18;

      this.alice.setTransitionTransform(scale, spin, alpha, 0, offsetY);

      if (this.phaseTime >= this.phaseDuration) {
        // Phase C: Complete disappearance inside the central hole
        this.subPhase = 'PHASE_C';
        this.phaseTime = 0;
        this.phaseDuration = 0.25;
        this.alice.setTransitionTransform(0.001, spin, 0.0, 0, 0);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
      }
    } else if (this.subPhase === 'PHASE_C') {
      this.alice.setTransitionTransform(0.0, 0, 0.0, 0, 0);

      if (this.phaseTime >= this.phaseDuration) {
        this.state = States.TRANSFORMING;
        this.phaseTime = 0;
        this.phaseDuration = 2.0;
        this.morphProgress = 0;

        // If transitioning into one of the 3 rabbit hole tunnels, reset fresh
        if (this.targetEra < 3 && this.tunnels[this.targetEra] && this.tunnels[this.targetEra].reset) {
          this.tunnels[this.targetEra].reset();
        }
      }
    }
  }

  handleTransforming(dt) {
    const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
    this.morphProgress = t * t * (3 - 2 * t);
    this.tunnelSpeedMultiplier = 4.5 - t * 1.5;

<<<<<<< HEAD
=======
    // Keep Alice in the depths during tunnel transformation
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    this.alice.setTransitionTransform(0.0, 0, 0.0, 0, 0);

    if (this.phaseTime >= this.phaseDuration) {
      this.currentEra = this.targetEra;
      this.morphProgress = 0;

      if (this.currentEra < 3) {
        this.alice.setEra(this.currentEra);
      }
      this.watch.setEra(this.currentEra);

      if (this.onEraChanged) {
        this.onEraChanged(this.currentEra);
      }

<<<<<<< HEAD
=======
      // Enter TRANSITION_IN (Phase E: New Alice emerges from central hole)
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
      this.state = States.TRANSITION_IN;
      this.subPhase = 'PHASE_E';
      this.phaseTime = 0;
      this.phaseDuration = 1.5;
    }
  }

  handleTransitionIn(dt) {
    if (this.subPhase === 'PHASE_E') {
<<<<<<< HEAD
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      const ease = 1 - Math.pow(1 - t, 3);

      this.tunnelSpeedMultiplier = 3.0 - ease * 1.8;

      if (this.currentEra < 3) {
        // New Alice emerges from vanishing point and climbs towards camera
        const scale = 0.01 + ease * 0.99;
        const spin = this.direction * (1 - ease) * Math.PI * 5.0;
        const alpha = scale > 0.04 ? 1.0 : (scale / 0.04);
        const offsetY = (1 - ease) * -12;

        this.alice.setTransitionTransform(scale, spin, alpha, 0, offsetY);
      } else {
        // In CREATE stage: Alice is not drawn; user takes over
        this.alice.setTransitionTransform(0.0, 0, 0.0, 0, 0);
      }
=======
      // Phase E: New Alice emerges directly from central vanishing point (scale ~0.01 -> 1.0)
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      const ease = 1 - Math.pow(1 - t, 3); // Ease out cubic

      this.tunnelSpeedMultiplier = 3.0 - ease * 1.8;

      const scale = 0.01 + ease * 0.99;
      const spin = this.direction * (1 - ease) * Math.PI * 5.0; // Decelerating spin
      const alpha = scale > 0.04 ? 1.0 : (scale / 0.04);
      const offsetY = (1 - ease) * -12;

      this.alice.setTransitionTransform(scale, spin, alpha, 0, offsetY);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1

      if (this.phaseTime >= this.phaseDuration) {
        this.subPhase = 'PHASE_F';
        this.phaseTime = 0;
        this.phaseDuration = 0.8;
      }
    } else if (this.subPhase === 'PHASE_F') {
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      this.tunnelSpeedMultiplier = 1.2 - t * 0.2;

<<<<<<< HEAD
      if (this.currentEra < 3) {
        this.alice.setTransitionTransform(1.0, 0, 1.0, 0, 0);
      } else {
        this.alice.setTransitionTransform(0.0, 0, 0.0, 0, 0);
      }
=======
      const scale = 1.0;
      const spin = 0;
      const alpha = 1.0;
      this.alice.setTransitionTransform(scale, spin, alpha, 0, 0);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1

      if (this.phaseTime >= this.phaseDuration) {
        this.state = States.IDLE;
        this.tunnelSpeedMultiplier = 1.0;
        this.watch.setTransitionState(false);
<<<<<<< HEAD
        if (this.currentEra < 3) {
          this.alice.releaseTransitionTransform();
=======
        this.alice.releaseTransitionTransform();

        this.transitionsCount++;
        if (this.onTransitionsMilestone) {
          this.onTransitionsMilestone(this.transitionsCount);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
        }
      }
    }
  }

  renderTunnels(ctx, width, height, cx, cy) {
    if (this.currentEra === 3) {
      // In CREATE stage, render the create stage canvas
      this.createStage.render(ctx);
      return;
    }

    if (this.state === States.TRANSFORMING) {
      const fromEra = this.currentEra;
      const toEra = this.targetEra;
      const blend = this.morphProgress;

<<<<<<< HEAD
      if (fromEra < 3 && toEra < 3) {
        this.tunnels[fromEra].render(ctx, width, height, cx, cy, this.lightWaves, 1.0 - blend);
        this.tunnels[toEra].render(ctx, width, height, cx, cy, this.lightWaves, blend);
      } else if (toEra === 3) {
        // Morphing from Game (2) into CREATE (3)
        this.tunnels[2].render(ctx, width, height, cx, cy, this.lightWaves, 1.0 - blend * 0.6);
        this.createStage.render(ctx);
      } else if (fromEra === 3) {
        // Morphing from CREATE (3) back into Game (2)
        this.createStage.render(ctx);
        this.tunnels[2].render(ctx, width, height, cx, cy, this.lightWaves, blend);
      }
=======
      this.tunnels[fromEra].render(ctx, width, height, cx, cy, this.lightWaves, 1.0 - blend);
      this.tunnels[toEra].render(ctx, width, height, cx, cy, this.lightWaves, blend);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    } else {
      this.tunnels[this.currentEra].render(ctx, width, height, cx, cy, this.lightWaves, 1.0);
    }
  }
}
