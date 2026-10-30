/**
 * Transition Manager & Finite State Machine
 * Coordinates the 6 phases of the rabbit hole descent:
 * - INITIALIZING
 * - INTRO_ANIMATION
 * - IDLE
 * - TRANSITION_OUT (Phase A: Acceleration, Phase B: Descent, Phase C: Disappearance)
 * - TRANSFORMING (Phase D: Rabbit hole generative system morphing)
 * - TRANSITION_IN (Phase E: New Alice emergence, Phase F: Stabilization)
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
  constructor(aliceController, bookTunnel, movieTunnel, gameTunnel, lightWaves, pocketWatch, onEraChanged, onTransitionsMilestone) {
    this.alice = aliceController;
    this.tunnels = [bookTunnel, movieTunnel, gameTunnel];
    this.lightWaves = lightWaves;
    this.watch = pocketWatch;
    this.onEraChanged = onEraChanged;
    this.onTransitionsMilestone = onTransitionsMilestone;

    this.state = States.INITIALIZING;
    this.currentEra = 0; // 0: Book, 1: Movie, 2: Game
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
    this.phaseDuration = 3.6; // Coupled to Alice dramatic perspective fall
    this.tunnelSpeedMultiplier = 1.0;
  }

  triggerTransition(direction = 1) {
    if (this.state !== States.IDLE) return; // Prevent overlapping transitions

    this.direction = direction;
    this.targetEra = ((this.currentEra + direction) % 3 + 3) % 3;
    this.state = States.TRANSITION_OUT;
    this.subPhase = 'PHASE_A';
    this.phaseTime = 0;
    this.phaseDuration = 0.8; // Phase A: Acceleration duration
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
      // Phase A: Acceleration (Tunnel speed accelerates, watch spins fast)
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      this.tunnelSpeedMultiplier = 1.0 + t * 2.8;

      // Start gentle rotation acceleration
      const startSpin = this.direction * (t * t) * Math.PI * 0.8;
      this.alice.setTransitionTransform(1.0, startSpin, 1.0, 0, 0);

      if (this.phaseTime >= this.phaseDuration) {
        // Move to Phase B: Descent (Alice spins & physically plunges into depth)
        this.subPhase = 'PHASE_B';
        this.phaseTime = 0;
        this.phaseDuration = 1.4;
      }
    } else if (this.subPhase === 'PHASE_B') {
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      // Ease in cubic for falling acceleration
      const ease = t * t * t;

      this.tunnelSpeedMultiplier = 3.8 + t * 1.5;

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
      }
    } else if (this.subPhase === 'PHASE_C') {
      this.alice.setTransitionTransform(0.0, 0, 0.0, 0, 0);

      if (this.phaseTime >= this.phaseDuration) {
        // Switch to TRANSFORMING (Phase D)
        this.state = States.TRANSFORMING;
        this.phaseTime = 0;
        this.phaseDuration = 2.0;
        this.morphProgress = 0;

        // Reset target era tunnel so it progressively draws fresh from center
        if (this.tunnels[this.targetEra] && this.tunnels[this.targetEra].reset) {
          this.tunnels[this.targetEra].reset();
        }
      }
    }
  }

  handleTransforming(dt) {
    // Phase D: Generative system transformation
    const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
    this.morphProgress = t * t * (3 - 2 * t);
    this.tunnelSpeedMultiplier = 4.5 - t * 1.5;

    // Keep Alice in the depths during tunnel transformation
    this.alice.setTransitionTransform(0.0, 0, 0.0, 0, 0);

    if (this.phaseTime >= this.phaseDuration) {
      // Morph complete: switch currentEra to targetEra
      this.currentEra = this.targetEra;
      this.morphProgress = 0;
      this.alice.setEra(this.currentEra);
      this.watch.setEra(this.currentEra);

      if (this.onEraChanged) {
        this.onEraChanged(this.currentEra);
      }

      // Enter TRANSITION_IN (Phase E: New Alice emerges from central hole)
      this.state = States.TRANSITION_IN;
      this.subPhase = 'PHASE_E';
      this.phaseTime = 0;
      this.phaseDuration = 1.5;
    }
  }

  handleTransitionIn(dt) {
    if (this.subPhase === 'PHASE_E') {
      // Phase E: New Alice emerges directly from central vanishing point (scale ~0.01 -> 1.0)
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      const ease = 1 - Math.pow(1 - t, 3); // Ease out cubic

      this.tunnelSpeedMultiplier = 3.0 - ease * 1.8;

      const scale = 0.01 + ease * 0.99;
      const spin = this.direction * (1 - ease) * Math.PI * 5.0; // Decelerating spin
      const alpha = scale > 0.04 ? 1.0 : (scale / 0.04);
      const offsetY = (1 - ease) * -12;

      this.alice.setTransitionTransform(scale, spin, alpha, 0, offsetY);

      if (this.phaseTime >= this.phaseDuration) {
        // Move to Phase F: Stabilization
        this.subPhase = 'PHASE_F';
        this.phaseTime = 0;
        this.phaseDuration = 0.8;
      }
    } else if (this.subPhase === 'PHASE_F') {
      // Phase F: Stabilization
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      this.tunnelSpeedMultiplier = 1.2 - t * 0.2;

      const scale = 1.0;
      const spin = 0;
      const alpha = 1.0;
      this.alice.setTransitionTransform(scale, spin, alpha, 0, 0);

      if (this.phaseTime >= this.phaseDuration) {
        this.state = States.IDLE;
        this.tunnelSpeedMultiplier = 1.0;
        this.watch.setTransitionState(false);
        this.alice.releaseTransitionTransform();

        this.transitionsCount++;
        if (this.onTransitionsMilestone) {
          this.onTransitionsMilestone(this.transitionsCount);
        }
      }
    }
  }

  renderTunnels(ctx, width, height, cx, cy) {
    if (this.state === States.TRANSFORMING) {
      const fromEra = this.currentEra;
      const toEra = this.targetEra;
      const blend = this.morphProgress;

      this.tunnels[fromEra].render(ctx, width, height, cx, cy, this.lightWaves, 1.0 - blend);
      this.tunnels[toEra].render(ctx, width, height, cx, cy, this.lightWaves, blend);
    } else {
      this.tunnels[this.currentEra].render(ctx, width, height, cx, cy, this.lightWaves, 1.0);
    }
  }
}
