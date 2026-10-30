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
  constructor(aliceController, bookTunnel, movieTunnel, gameTunnel, lightWaves, pocketWatch, onEraChanged) {
    this.alice = aliceController;
    this.tunnels = [bookTunnel, movieTunnel, gameTunnel];
    this.lightWaves = lightWaves;
    this.watch = pocketWatch;
    this.onEraChanged = onEraChanged;

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

    // Start in intro animation
    this.startIntro();
  }

  startIntro() {
    this.state = States.INTRO_ANIMATION;
    this.phaseTime = 0;
    this.phaseDuration = 3.2;
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
      this.tunnelSpeedMultiplier = 1.0 + t * 2.8; // Ramps up to 3.8x

      if (this.phaseTime >= this.phaseDuration) {
        // Move to Phase B: Descent (Alice spins & shrinks into depth)
        this.subPhase = 'PHASE_B';
        this.phaseTime = 0;
        this.phaseDuration = 1.4;
      }
    } else if (this.subPhase === 'PHASE_B') {
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      // Ease in cubic for falling acceleration
      const ease = t * t * t;

      this.tunnelSpeedMultiplier = 3.8 + t * 1.5; // High speed

      const scale = Math.max(0.01, 1.0 - ease * 0.98);
      const spin = this.direction * ease * Math.PI * 6.0; // 3 full rapid spins
      const alpha = Math.max(0.0, 1.0 - ease * 0.95);

      this.alice.setTransitionTransform(scale, spin, alpha, 0, ease * 25);

      if (this.phaseTime >= this.phaseDuration) {
        // Phase C: Complete disappearance at center
        this.subPhase = 'PHASE_C';
        this.phaseTime = 0;
        this.phaseDuration = 0.25;
        this.alice.setTransitionTransform(0.0, spin, 0.0, 0, 0);
      }
    } else if (this.subPhase === 'PHASE_C') {
      this.alice.setTransitionTransform(0.0, 0, 0.0, 0, 0);

      if (this.phaseTime >= this.phaseDuration) {
        // Switch to TRANSFORMING (Phase D)
        this.state = States.TRANSFORMING;
        this.phaseTime = 0;
        this.phaseDuration = 2.0; // Duration for generative cross-morph
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
    // Smooth step for organic morphing
    this.morphProgress = t * t * (3 - 2 * t);
    this.tunnelSpeedMultiplier = 4.5 - t * 1.5; // Stays energetic then begins easing

    // Keep Alice invisible during tunnel transformation
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

      // Enter TRANSITION_IN (Phase E: New Alice emergence)
      this.state = States.TRANSITION_IN;
      this.subPhase = 'PHASE_E';
      this.phaseTime = 0;
      this.phaseDuration = 1.5;
    }
  }

  handleTransitionIn(dt) {
    if (this.subPhase === 'PHASE_E') {
      // Phase E: New Alice emerges from vanishing point
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      // Ease out cubic: rapidly grows then decelerates
      const ease = 1 - Math.pow(1 - t, 3);

      this.tunnelSpeedMultiplier = 3.0 - ease * 1.8; // Easing back down

      const scale = 0.01 + ease * 0.99;
      const spin = this.direction * (1 - ease) * Math.PI * 4.5; // Decelerating spin
      const alpha = Math.min(1.0, ease * 1.2);

      this.alice.setTransitionTransform(scale, spin, alpha, 0, (1 - ease) * -15);

      if (this.phaseTime >= this.phaseDuration) {
        // Move to Phase F: Stabilization
        this.subPhase = 'PHASE_F';
        this.phaseTime = 0;
        this.phaseDuration = 0.9;
      }
    } else if (this.subPhase === 'PHASE_F') {
      // Phase F: Stabilization
      const t = Math.min(1.0, this.phaseTime / this.phaseDuration);
      this.tunnelSpeedMultiplier = 1.2 - t * 0.2; // Return to 1.0

      // Blend smoothly to natural idle float
      const scale = 1.0;
      const spin = 0;
      const alpha = 1.0;
      this.alice.setTransitionTransform(scale, spin, alpha, 0, 0);

      if (this.phaseTime >= this.phaseDuration) {
        this.state = States.IDLE;
        this.tunnelSpeedMultiplier = 1.0;
        this.watch.setTransitionState(false);
      }
    }
  }

  /**
   * Renders the active generative tunnel systems, handling morphing cross-fade in Phase D.
   */
  renderTunnels(ctx, width, height, cx, cy) {
    if (this.state === States.TRANSFORMING) {
      // Dual rendering with cross-morph weights
      const fromEra = this.currentEra;
      const toEra = this.targetEra;
      const blend = this.morphProgress;

      // Render outgoing tunnel fading out
      this.tunnels[fromEra].render(ctx, width, height, cx, cy, this.lightWaves, 1.0 - blend);

      // Render incoming tunnel fading in and asserting its forms
      this.tunnels[toEra].render(ctx, width, height, cx, cy, this.lightWaves, blend);
    } else {
      // Single tunnel rendering
      this.tunnels[this.currentEra].render(ctx, width, height, cx, cy, this.lightWaves, 1.0);
    }
  }
}
