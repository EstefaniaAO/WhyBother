/**
 * Light Waves System
 * Coordinates traveling shimmers along existing strokes and paths.
 * Avoids harsh laser beams or radial streaks; focuses on highlighting drawn paths.
 */

export class LightWaveSystem {
  constructor() {
    this.waves = [];
    this.spawnTimer = 0;
    this.baseSpawnInterval = 2.4; // seconds
  }

  reset() {
    this.waves = [];
    this.spawnTimer = 0;
  }

  update(dt, eraIndex, transitionSpeedMultiplier = 1.0) {
    this.spawnTimer += dt * transitionSpeedMultiplier;
    const interval = Math.max(0.6, this.baseSpawnInterval / transitionSpeedMultiplier);

    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawnWave(eraIndex, transitionSpeedMultiplier);
    }

    // Update existing waves
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i];
      w.progress += w.speed * dt * transitionSpeedMultiplier;
      if (w.progress > 1.25) {
        this.waves.splice(i, 1);
      }
    }
  }

  spawnWave(eraIndex, speedMult) {
    this.waves.push({
      progress: -0.05,
      speed: 0.22 + Math.random() * 0.18,
      width: 0.10 + Math.random() * 0.06,
      intensity: (0.7 + Math.random() * 0.3) * Math.min(1.8, speedMult),
      direction: Math.random() > 0.2 ? 1 : -1 // 1: center to rim, -1: rim to center
    });
  }

  getIlluminationAt(normDepth) {
    let totalBoost = 0;
    for (let i = 0; i < this.waves.length; i++) {
      const w = this.waves[i];
      const targetPos = w.direction > 0 ? (1.0 - w.progress) : w.progress;
      const dist = Math.abs(normDepth - targetPos);

      if (dist < w.width) {
        const factor = Math.cos((dist / w.width) * (Math.PI / 2));
        totalBoost += factor * factor * w.intensity;
      }
    }
    return { boost: Math.min(2.0, totalBoost) };
  }

  renderRadialGlow(ctx, width, height, cx, cy) {
    // Kept completely subtle and soft so it never resembles electric lasers
  }
}
