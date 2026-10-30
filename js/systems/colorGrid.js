/**
 * ColorGrid & Spatial Coverage Map
 * Lightweight low-resolution Float32Array pigment density & coverage buffer.
 * Provides pigment dragging, wet accumulation, and guides autonomous agents
 * toward less-covered zones for organic negative space.
 */
import { FastMath } from '../math/noise.js';

export class ColorGrid {
  constructor(cols = 64, rows = 48) {
    this.cols = cols;
    this.rows = rows;
    this.size = cols * rows;

    this.density = new Float32Array(this.size);
    this.colorR = new Float32Array(this.size);
    this.colorG = new Float32Array(this.size);
    this.colorB = new Float32Array(this.size);
    this.coverage = new Float32Array(this.size);

    this.width = 1;
    this.height = 1;
  }

  resize(width, height) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
  }

  reset() {
    this.density.fill(0);
    this.colorR.fill(0);
    this.colorG.fill(0);
    this.colorB.fill(0);
    this.coverage.fill(0);
  }

  getIndex(x, y) {
    const col = FastMath.clamp(Math.floor((x / this.width) * this.cols), 0, this.cols - 1);
    const row = FastMath.clamp(Math.floor((y / this.height) * this.rows), 0, this.rows - 1);
    return row * this.cols + col;
  }

  depositPigment(x, y, color, amount = 0.15) {
    const idx = this.getIndex(x, y);
    const curDensity = this.density[idx];
    const newDensity = Math.min(2.5, curDensity + amount);
    this.density[idx] = newDensity;
    this.coverage[idx] = Math.min(1.0, this.coverage[idx] + amount * 0.4);

    // Color blending in low-res buffer
    const blendWeight = amount / (newDensity + 0.001);
    this.colorR[idx] = FastMath.lerp(this.colorR[idx], color.r, blendWeight);
    this.colorG[idx] = FastMath.lerp(this.colorG[idx], color.g, blendWeight);
    this.colorB[idx] = FastMath.lerp(this.colorB[idx], color.b, blendWeight);
  }

  samplePigment(x, y) {
    const idx = this.getIndex(x, y);
    const d = this.density[idx];
    if (d <= 0.02) {
      return { density: 0, color: null };
    }
    return {
      density: d,
      color: {
        r: Math.round(this.colorR[idx]),
        g: Math.round(this.colorG[idx]),
        b: Math.round(this.colorB[idx])
      }
    };
  }

  /**
   * Guides new agents towards angles around the center that have less coverage
   */
  findLeastCoveredAngle(cx, cy, radius = 80) {
    const numSamples = 12;
    let minCov = Infinity;
    let bestAngle = Math.random() * Math.PI * 2;

    for (let i = 0; i < numSamples; i++) {
      const angle = (i / numSamples) * Math.PI * 2;
      const sx = cx + Math.cos(angle) * radius;
      const sy = cy + Math.sin(angle) * radius;
      const idx = this.getIndex(sx, sy);
      const cov = this.coverage[idx];
      if (cov < minCov) {
        minCov = cov;
        bestAngle = angle;
      }
    }

    // Add gentle random variation
    return bestAngle + (Math.random() - 0.5) * 0.4;
  }

  /**
   * Lightweight 4-neighbor diffusion & evaporation step
   */
  diffuse(rate = 0.04) {
    const cols = this.cols;
    const rows = this.rows;
    const nextDensity = new Float32Array(this.density);

    for (let r = 1; r < rows - 1; r += 2) {
      for (let c = 1; c < cols - 1; c += 2) {
        const i = r * cols + c;
        const avg = (this.density[i - 1] + this.density[i + 1] + this.density[i - cols] + this.density[i + cols]) * 0.25;
        nextDensity[i] = FastMath.lerp(this.density[i], avg, rate);
      }
    }
    this.density.set(nextDensity);
  }
}
