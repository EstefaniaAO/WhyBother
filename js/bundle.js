(() => {
"use strict";

// --- js/math/noise.js ---
/**
 * FastMath & Simplex Noise (2D & 3D)
 * Mathematical foundation for generative organic art, flow fields, and pigment behavior.
 */

class SimplexNoise {
  constructor(seed = 1865) {
    this.p = new Uint8Array(256);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);

    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    const lcg = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const source = new Uint8Array(256);
    for (let i = 0; i < 256; i++) source[i] = i;
    for (let i = 255; i >= 0; i--) {
      const r = Math.floor(lcg() * (i + 1));
      const tmp = source[i];
      source[i] = source[r];
      source[r] = tmp;
    }

    for (let i = 0; i < 512; i++) {
      this.perm[i] = source[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }

    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
  }

  // 2D Simplex Noise
  noise2D(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

    let n0 = 0, n1 = 0, n2 = 0;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    const g0 = this.grad3[gi0];
    const g1 = this.grad3[gi1];
    const g2 = this.grad3[gi2];

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * (g0[0] * x0 + g0[1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * (g1[0] * x1 + g1[1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * (g2[0] * x2 + g2[1] * y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }

  // 3D Simplex Noise for time-evolving fields
  noise3D(xin, yin, zin) {
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;

    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1, j1, k1;
    let i2, j2, k2;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
    const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
    const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 >= 0) {
      t0 *= t0;
      const g = this.grad3[gi0];
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0 + g[2] * z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 >= 0) {
      t1 *= t1;
      const g = this.grad3[gi1];
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1 + g[2] * z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 >= 0) {
      t2 *= t2;
      const g = this.grad3[gi2];
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2 + g[2] * z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 >= 0) {
      t3 *= t3;
      const g = this.grad3[gi3];
      n3 = t3 * t3 * (g[0] * x3 + g[1] * y3 + g[2] * z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  // Fractal Brownian Motion (octaves)
  fbm2D(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    return total / maxValue;
  }

  fbm3D(x, y, z, octaves = 3, persistence = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    return total / maxValue;
  }

  curl2D(x, y, eps = 0.005) {
    const n1 = this.noise2D(x, y + eps);
    const n2 = this.noise2D(x, y - eps);
    const n3 = this.noise2D(x + eps, y);
    const n4 = this.noise2D(x - eps, y);
    const dx = (n1 - n2) / (2 * eps);
    const dy = (n3 - n4) / (2 * eps);
    return { x: dx, y: -dy };
  }
}

const noise = new SimplexNoise(1865);

/**
 * FastMath utility functions: lerp, clamp, smoothstep, color utilities
 */
const FastMath = {
  clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  smoothstep(edge0, edge1, x) {
    const t = FastMath.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  },

  // Color blending utility: blend two RGB objects
  blendRGB(colA, colB, t) {
    return {
      r: Math.round(FastMath.lerp(colA.r, colB.r, t)),
      g: Math.round(FastMath.lerp(colA.g, colB.g, t)),
      b: Math.round(FastMath.lerp(colA.b, colB.b, t))
    };
  },

  rgbaString(col, alpha = 1.0) {
    return `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha.toFixed(3)})`;
  }
};


// --- js/systems/flowField.js ---
/**
 * Multi-layer FlowField
 * Combines 3D Simplex noise, rotational vortex swirl, dynamic focal points,
 * and outward expansion forces to guide watercolor brush agents along organic curves.
 */

class FlowField {
  constructor(config = {}) {
    this.vortexStrength = config.vortexStrength || 0.65;
    this.radialExpansion = config.radialExpansion || 0.45;
    this.noiseScale = config.noiseScale || 0.0022;
    this.noiseStrength = config.noiseStrength || 0.85;
    this.turbulence = config.turbulence || 0.35;
    this.spiralDirection = config.spiralDirection || 1; // 1 or -1
  }

  setConfig(cfg) {
    if (cfg.vortexStrength !== undefined) this.vortexStrength = cfg.vortexStrength;
    if (cfg.radialExpansion !== undefined) this.radialExpansion = cfg.radialExpansion;
    if (cfg.noiseScale !== undefined) this.noiseScale = cfg.noiseScale;
    if (cfg.noiseStrength !== undefined) this.noiseStrength = cfg.noiseStrength;
    if (cfg.turbulence !== undefined) this.turbulence = cfg.turbulence;
    if (cfg.spiralDirection !== undefined) this.spiralDirection = cfg.spiralDirection;
  }

  /**
   * Computes desired heading angle or steering force vector at (x, y)
   */
  getForce(x, y, cx, cy, time = 0) {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy) + 0.001;

    // 1. Normalized radial vector (outward)
    const rx = dx / dist;
    const ry = dy / dist;

    // 2. Normalized tangential vector (vortex swirl around center)
    const tx = -ry * this.spiralDirection;
    const ty = rx * this.spiralDirection;

    // 3. 3D Simplex Noise angle modulation
    const nVal = noise.fbm3D(
      x * this.noiseScale,
      y * this.noiseScale,
      time * 0.05,
      3, 0.5
    );
    const nAngle = nVal * Math.PI * 2 * this.noiseStrength;
    const nx = Math.cos(nAngle);
    const ny = Math.sin(nAngle);

    // 4. Combine forces
    let fx = tx * this.vortexStrength + rx * this.radialExpansion + nx * this.turbulence;
    let fy = ty * this.vortexStrength + ry * this.radialExpansion + ny * this.turbulence;

    const fMag = Math.hypot(fx, fy) + 0.0001;
    return {
      x: fx / fMag,
      y: fy / fMag,
      angle: Math.atan2(fy, fx)
    };
  }
}


// --- js/systems/colorGrid.js ---
/**
 * ColorGrid & Spatial Coverage Map
 * Lightweight low-resolution Float32Array pigment density & coverage buffer.
 * Provides pigment dragging, wet accumulation, and guides autonomous agents
 * toward less-covered zones for organic negative space.
 */

class ColorGrid {
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


// --- js/systems/brushAgent.js ---
/**
 * Watercolor BrushAgent
 * Autonomous brush entity that paints progressive, tapered, multi-pass watercolor strokes
 * onto the persistent canvas buffer, interacting with the flow field and pigment grid.
 */

class BrushAgent {
  constructor(config = {}) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.speed = config.speed || 55;
    this.maxSteerForce = config.maxSteerForce || 4.5;

    this.baseThickness = config.thickness || 12;
    this.baseOpacity = config.opacity || 0.32;
    this.color = config.color || { r: 100, g: 150, b: 200 };
    this.currentColor = { ...this.color };

    this.maxLife = config.maxLife || 6.5;
    this.age = 0;
    this.isDead = false;

    // Organic watercolor bristle offsets & dampening
    this.numPasses = config.numPasses || 3;
    this.bristleSpread = config.bristleSpread || 0.45;
    this.isWet = config.isWet !== undefined ? config.isWet : true;
    this.isGothic = config.isGothic || false;

    this.history = [];
  }

  update(dt, flowField, colorGrid, cx, cy, time, speedMult = 1.0) {
    if (this.isDead) return;

    this.age += dt * speedMult;
    const prevX = this.x;
    const prevY = this.y;

    // 1. Steering force towards FlowField vector
    const desired = flowField.getForce(this.x, this.y, cx, cy, time);
    const steerX = (desired.x * this.speed - this.vx) * this.maxSteerForce;
    const steerY = (desired.y * this.speed - this.vy) * this.maxSteerForce;

    this.vx += steerX * dt * speedMult;
    this.vy += steerY * dt * speedMult;

    // Constrain velocity
    const currentSpeed = Math.hypot(this.vx, this.vy) || 0.001;
    this.vx = (this.vx / currentSpeed) * this.speed;
    this.vy = (this.vy / currentSpeed) * this.speed;

    this.x += this.vx * dt * speedMult;
    this.y += this.vy * dt * speedMult;

    // 2. Pigment Dragging & Wet Color Blending
    if (colorGrid) {
      const sampled = colorGrid.samplePigment(this.x, this.y);
      if (sampled.density > 0.1 && sampled.color) {
        // Drag existing wet pigment, blending smoothly
        this.currentColor = FastMath.blendRGB(this.currentColor, sampled.color, 0.08);
      }
      colorGrid.depositPigment(this.x, this.y, this.currentColor, 0.12 * dt * speedMult);
    }

    // 3. Tapered Envelope (natural brush entry, body, and exit)
    const lifeRatio = this.age / this.maxLife;
    const taper = Math.sin(lifeRatio * Math.PI); // 0 -> 1 -> 0 smooth bell curve
    const currentThickness = Math.max(1.0, this.baseThickness * Math.pow(taper, 0.7));
    const currentOpacity = Math.max(0.05, this.baseOpacity * (0.4 + 0.6 * taper));

    // 4. Save path coordinate
    const distFromCenter = Math.hypot(this.x - cx, this.y - cy);
    this.history.push({
      x: this.x,
      y: this.y,
      r: distFromCenter,
      prevX,
      prevY,
      thickness: currentThickness,
      opacity: currentOpacity,
      color: { ...this.currentColor }
    });

    if (this.age >= this.maxLife) {
      this.isDead = true;
    }
  }

  /**
   * Renders the latest progressive segment directly onto the persistent canvas buffer
   */
  drawSegment(ctx) {
    if (this.history.length < 2) return;

    const cur = this.history[this.history.length - 1];
    const prev = this.history[this.history.length - 2];

    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0.1) return;

    // Normal perpendicular vector for multi-pass watercolor bristle spread
    const nx = -dy / dist;
    const ny = dx / dist;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const col = cur.color;
    const mainAlpha = cur.opacity;

    // Pass 1: Broad translucent wet wash / softened edges
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(cur.x, cur.y);
    ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${(mainAlpha * 0.35).toFixed(3)})`;
    ctx.lineWidth = cur.thickness * 1.6;
    ctx.stroke();

    // Pass 2: Main pigment body with bristle texture
    for (let p = 0; p < this.numPasses; p++) {
      const spreadOffset = (p - (this.numPasses - 1) / 2) * (cur.thickness * this.bristleSpread * 0.35);
      const px1 = prev.x + nx * spreadOffset;
      const py1 = prev.y + ny * spreadOffset;
      const px2 = cur.x + nx * spreadOffset;
      const py2 = cur.y + ny * spreadOffset;

      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px2, py2);

      // Pigment density variation: center passes are richer
      const centerFactor = 1.0 - Math.abs(p - (this.numPasses - 1) / 2) / Math.max(1, this.numPasses);
      const passAlpha = mainAlpha * (0.5 + 0.5 * centerFactor);

      ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${passAlpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(0.8, cur.thickness * (0.35 + 0.25 * centerFactor));
      ctx.stroke();
    }

    // Pass 3: If gothic scene, sharp barbed thorns
    if (this.isGothic && Math.random() > 0.6) {
      const thornLen = cur.thickness * (0.6 + Math.random() * 1.2);
      const side = Math.random() > 0.5 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cur.x, cur.y);
      ctx.lineTo(cur.x + nx * side * thornLen, cur.y + ny * side * thornLen);
      ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${(mainAlpha * 0.85).toFixed(3)})`;
      ctx.lineWidth = Math.max(0.9, cur.thickness * 0.22);
      ctx.stroke();
    }

    ctx.restore();
  }
}


// --- js/systems/lightWaves.js ---
/**
 * Light Waves System
 * Coordinates traveling shimmers along existing strokes and paths.
 * Avoids harsh laser beams or radial streaks; focuses on highlighting drawn paths.
 */

class LightWaveSystem {
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


// --- js/systems/bookTunnel.js ---
/**
 * Scene 1: Book Tunnel (Original Book, 1865)
 * Inspired by Lewis Carroll & John Tenniel.
 * Monochromatic antique engraving, spreading ink and grayscale pen strokes,
 * with luminous WHITE letters forming a spiral word tunnel directly
 * ON TOP of the spreading ink layer.
 */

class BookTunnel {
  constructor() {
    this.time = 0;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Persistent canvas for ink and paper accumulation
    this.inkCanvas = document.createElement('canvas');
    this.inkCtx = this.inkCanvas.getContext('2d');

    // Dedicated overlay canvas for text, ensuring letters appear ON TOP of spreading ink
    this.textCanvas = document.createElement('canvas');
    this.textCtx = this.textCanvas.getContext('2d');

    // Complete original paragraph of Lewis Carroll
    this.fullParagraph = 
      "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir. " +
      "Al principio, la madriguera del conejo se extendía en línea recta como un túnel, y después torció bruscamente hacia abajo, tan bruscamente que Alicia no tuvo siquiera tiempo de pensar en detenerse y se encontró cayendo por lo que parecía un pozo muy profundo. " +
      "O el pozo era en verdad profundo, o ella caía muy despacio, porque Alicia, mientras descendía, tuvo tiempo sobrado para mirar a su alrededor y para preguntarse qué iba a suceder después. " +
      "Primero, intentó mirar hacia abajo y ver a dónde iría a parar, pero estaba todo demasiado oscuro para distinguir nada. " +
      "Después miró hacia las paredes del pozo y observó que estaban cubiertas de armarios y estantes para libros: aquí y allá vio mapas y cuadros, colgados de clavos. " +
      "Cogió, a su paso, un jarro de los estantes. Llevaba una etiqueta que decía: MERMELADA DE NARANJA, pero vio, con desencanto, que estaba vacío. ";

    this.words = this.fullParagraph.split(/\s+/).filter(w => w.length > 0);

    // Active spiral text streamers that continuously stream words outward
    this.textStreamers = [];
    this.maxStreamers = 8;
    this.nextStreamerTime = 0;

    // Concentric paper ring bands with drop shadows
    this.paperRings = [];
    this.nextRingTime = 0;
    this.ringInterval = 1.25;

    // Multi-tone pen agents spreading ink across the canvas
    this.penAgents = [];
    this.maxPenAgents = 30;

    // Completed paths for light wave traversal
    this.recentPaths = [];
    this.maxRecentPaths = 50;

    // Compatibility getter
    this.offscreenCanvas = this.inkCanvas;
  }

  init(width, height) {
    this.width = width;
    this.height = height;

    this.inkCanvas.width = width;
    this.inkCanvas.height = height;
    this.textCanvas.width = width;
    this.textCanvas.height = height;

    // Crisp ivory paper ground
    this.inkCtx.fillStyle = '#faf7f2';
    this.inkCtx.fillRect(0, 0, width, height);

    // Clear text layer
    this.textCtx.clearRect(0, 0, width, height);

    // Deep vanishing point aperture in center
    const cx = width / 2;
    const cy = height / 2;
    const coreGrad = this.inkCtx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.65, '#0c0c10');
    coreGrad.addColorStop(1, 'rgba(250, 247, 242, 0)');
    this.inkCtx.fillStyle = coreGrad;
    this.inkCtx.beginPath();
    this.inkCtx.arc(cx, cy, 38, 0, Math.PI * 2);
    this.inkCtx.fill();

    this.textStreamers = [];
    this.paperRings = [];
    this.penAgents = [];
    this.recentPaths = [];
    this.time = 0;
    this.nextRingTime = 0.4;
    this.nextStreamerTime = 0;

    // Seed 6 text streamers immediately so words begin emerging at once
    for (let i = 0; i < 6; i++) {
      this.spawnTextStreamer(i * (Math.PI * 2 / 6));
    }

    // Seed initial ink spreading agents
    for (let i = 0; i < 16; i++) {
      this.spawnPenAgent();
    }

    this.initialized = true;
  }

  resize(width, height) {
    if (!this.initialized || this.width !== width || this.height !== height) {
      const tempInk = document.createElement('canvas');
      tempInk.width = this.width;
      tempInk.height = this.height;
      const tCtx = tempInk.getContext('2d');
      if (this.width > 0 && this.height > 0) {
        tCtx.drawImage(this.inkCanvas, 0, 0);
      }

      this.width = width;
      this.height = height;
      this.inkCanvas.width = width;
      this.inkCanvas.height = height;
      this.textCanvas.width = width;
      this.textCanvas.height = height;

      if (tempInk.width > 0 && tempInk.height > 0) {
        this.inkCtx.drawImage(tempInk, 0, 0, width, height);
      } else {
        this.init(width, height);
      }
    }
  }

  reset() {
    if (this.width > 0 && this.height > 0) {
      this.init(this.width, this.height);
    }
  }

  spawnTextStreamer(startAngle = null) {
    const baseAngle = startAngle !== null ? startAngle : Math.random() * Math.PI * 2;
    const maxCorner = Math.hypot(this.width, this.height) * 0.85;

    this.textStreamers.push({
      baseAngle,
      currentR: 20 + Math.random() * 18, // starts near vanishing point
      currentAngle: baseAngle,
      spiralPitch: 36 + Math.random() * 26, // outward radial growth per turn
      angularSpeed: 0.70 + Math.random() * 0.35,
      wordIndex: Math.floor(Math.random() * this.words.length),
      charTimer: 0,
      charInterval: 0.038, // brisk, readable typing stream
      maxDist: maxCorner,
      isDone: false
    });
  }

  spawnPaperRing() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const wordCount = 12 + Math.floor(Math.random() * 16);
    const startIdx = Math.floor(Math.random() * (this.words.length - wordCount));
    const ringWords = [];
    for (let i = 0; i < wordCount; i++) {
      ringWords.push(this.words[(startIdx + i) % this.words.length]);
    }

    const maxScreenRadius = Math.hypot(this.width, this.height) * (0.32 + Math.random() * 0.52);

    this.paperRings.push({
      currentRadius: 24 + Math.random() * 18,
      targetRadius: maxScreenRadius,
      expansionSpeed: 26 + Math.random() * 32,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: (0.025 + Math.random() * 0.035) * (Math.random() > 0.5 ? 1 : -1),
      irregularity: 0.030 + Math.random() * 0.035,
      words: ringWords,
      isStamped: false,
      shadowBlur: 14 + Math.random() * 16,
      lineWidth: 1.2 + Math.random() * 1.5
    });
  }

  spawnPenAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const startR = 12 + Math.random() * 40;
    const maxCorner = Math.hypot(this.width, this.height) * 0.85;

    // Multi-Tone Grayscale Pen Agents
    const tier = Math.random();
    let strokeColor, strokeWidth, opacity;

    if (tier < 0.35) {
      // Light graphite gray
      strokeColor = '175, 170, 162';
      strokeWidth = 0.8 + Math.random() * 1.2;
      opacity = 0.35 + Math.random() * 0.25;
    } else if (tier < 0.70) {
      // Medium charcoal gray
      strokeColor = '95, 90, 84';
      strokeWidth = 1.0 + Math.random() * 1.6;
      opacity = 0.55 + Math.random() * 0.25;
    } else {
      // Deep Victorian jet ink
      strokeColor = '12, 12, 16';
      strokeWidth = 1.4 + Math.random() * 2.2;
      opacity = 0.75 + Math.random() * 0.25;
    }

    this.penAgents.push({
      x: cx + Math.cos(angle) * startR,
      y: cy + Math.sin(angle) * startR,
      angle: angle,
      r: startR,
      speedR: 42 + Math.random() * 56,
      speedTheta: (0.40 + Math.random() * 0.65) * (Math.random() > 0.45 ? 1 : -1),
      noiseScale: 0.0024 + Math.random() * 0.0025,
      strokeColor,
      lineWidth: strokeWidth,
      opacity,
      isHatch: Math.random() > 0.52,
      history: [],
      maxDist: maxCorner,
      age: 0
    });
  }

  update(dt, speedMult = 1.0) {
    if (!this.initialized) return;

    this.time += dt * speedMult;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const inkCtx = this.inkCtx;
    const textCtx = this.textCtx;

    // =========================================================================
    // 1. SPREADING INK LAYER (Cut Paper Rings, Pen Agents, Spreading Stains)
    // =========================================================================

    // Structural paper rings with drop shadows
    this.nextRingTime -= dt * speedMult;
    if (this.nextRingTime <= 0) {
      this.spawnPaperRing();
      this.nextRingTime = this.ringInterval / Math.max(1, speedMult * 0.85);
    }

    for (let i = this.paperRings.length - 1; i >= 0; i--) {
      const ring = this.paperRings[i];
      ring.currentRadius += ring.expansionSpeed * dt * speedMult;
      ring.rotationAngle += ring.rotationSpeed * dt * speedMult;

      const numPts = 90;
      const pts = [];
      for (let s = 0; s <= numPts; s++) {
        const theta = (s / numPts) * Math.PI * 2;
        const n = noise.fbm2D(
          Math.cos(theta) * 2.2 + ring.targetRadius * 0.008,
          Math.sin(theta) * 2.2 + this.time * 0.02,
          2, 0.5
        );
        const r = ring.currentRadius * (1.0 + n * ring.irregularity);
        pts.push({
          x: cx + Math.cos(theta) * r,
          y: cy + Math.sin(theta) * r
        });
      }

      inkCtx.save();
      inkCtx.beginPath();
      inkCtx.moveTo(pts[0].x, pts[0].y);
      for (let s = 1; s < pts.length; s++) {
        inkCtx.lineTo(pts[s].x, pts[s].y);
      }
      inkCtx.closePath();

      // Sharp shadow & paper cut edge
      inkCtx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      inkCtx.shadowBlur = ring.shadowBlur;
      inkCtx.shadowOffsetX = 0;
      inkCtx.shadowOffsetY = 4;
      inkCtx.strokeStyle = 'rgba(12, 12, 16, 0.82)';
      inkCtx.lineWidth = ring.lineWidth;
      inkCtx.stroke();
      inkCtx.restore();

      if (ring.currentRadius >= ring.targetRadius) {
        this.paperRings.splice(i, 1);
      }
    }

    // Maintain active ink pen agents
    while (this.penAgents.length < this.maxPenAgents) {
      this.spawnPenAgent();
    }

    for (let i = this.penAgents.length - 1; i >= 0; i--) {
      const p = this.penAgents[i];
      p.age += dt * speedMult;

      const prevX = p.x;
      const prevY = p.y;

      const nAngle = noise.noise2D(p.x * p.noiseScale, p.y * p.noiseScale + this.time * 0.05) * Math.PI * 2;
      p.angle += p.speedTheta * dt * speedMult + Math.sin(nAngle) * 0.36 * dt * speedMult;
      p.r += p.speedR * dt * speedMult;

      p.x = cx + Math.cos(p.angle) * p.r;
      p.y = cy + Math.sin(p.angle) * p.r;

      // Draw progressive ink stroke
      inkCtx.save();
      inkCtx.beginPath();
      inkCtx.moveTo(prevX, prevY);
      inkCtx.lineTo(p.x, p.y);
      inkCtx.strokeStyle = `rgba(${p.strokeColor}, ${p.opacity})`;
      inkCtx.lineWidth = p.lineWidth;
      inkCtx.lineCap = 'round';
      inkCtx.stroke();

      // Cross-hatching ticks (Victorian engraving)
      if (p.isHatch && Math.random() > 0.58) {
        const hLen = 4 + Math.random() * 10;
        const normAngle = p.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        inkCtx.beginPath();
        inkCtx.moveTo(p.x, p.y);
        inkCtx.lineTo(p.x + Math.cos(normAngle) * hLen, p.y + Math.sin(normAngle) * hLen);
        inkCtx.strokeStyle = `rgba(${p.strokeColor}, ${p.opacity * 0.85})`;
        inkCtx.lineWidth = Math.max(0.5, p.lineWidth * 0.65);
        inkCtx.stroke();
      }
      inkCtx.restore();

      p.history.push({ x: p.x, y: p.y, r: p.r });

      const distFromCenter = Math.hypot(p.x - cx, p.y - cy);
      if (distFromCenter >= p.maxDist || p.age > 10.0) {
        if (p.history.length > 5) {
          this.recentPaths.push(p.history);
          if (this.recentPaths.length > this.maxRecentPaths) {
            this.recentPaths.shift();
          }
        }
        this.penAgents.splice(i, 1);
      }
    }

    // =========================================================================
    // 2. LUMINOUS WHITE WORD TUNNEL LAYER (Drawn ON TOP of spreading ink)
    // =========================================================================

    // Maintain continuous spiral word streamers
    if (this.textStreamers.length < this.maxStreamers) {
      this.nextStreamerTime -= dt * speedMult;
      if (this.nextStreamerTime <= 0) {
        this.spawnTextStreamer();
        this.nextStreamerTime = (1.2 + Math.random() * 1.2) / Math.max(1, speedMult * 0.85);
      }
    }

    // Stamp white letters onto textCanvas (which renders directly on top of inkCanvas)
    for (let i = this.textStreamers.length - 1; i >= 0; i--) {
      const st = this.textStreamers[i];
      st.charTimer += dt * speedMult;

      while (st.charTimer >= st.charInterval && st.wordIndex < this.words.length) {
        st.charTimer -= st.charInterval;
        const currentWord = this.words[st.wordIndex];
        st.wordIndex++;

        // Advance along Archimedean spiral
        const dAngle = 0.28;
        st.currentAngle += dAngle;
        st.currentR += (st.spiralPitch / (Math.PI * 2)) * dAngle;

        // Position on spiral
        const px = cx + Math.cos(st.currentAngle) * st.currentR;
        const py = cy + Math.sin(st.currentAngle) * st.currentR;

        // Perspective font scaling: small at center, large at corners
        const fontSize = Math.max(10, Math.min(28, Math.floor(10 + (st.currentR / 340) * 16)));

        textCtx.save();
        textCtx.translate(px, py);
        textCtx.rotate(st.currentAngle + Math.PI / 2);

        // LUMINOUS WHITE TYPOGRAPHY with dark drop shadow:
        // Highly visible on black ink as pure white, and visible on paper via shadow
        textCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        textCtx.shadowBlur = 6;
        textCtx.shadowOffsetX = 0;
        textCtx.shadowOffsetY = 2;

        textCtx.font = `700 ${fontSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        textCtx.fillStyle = '#ffffff'; // PURE WHITE LETTERS ON TOP OF SPREADING INK
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        textCtx.fillText(currentWord, 0, 0);

        // Subtle white ink connecting ligature
        if (Math.random() > 0.45) {
          const wWidth = textCtx.measureText(currentWord).width;
          textCtx.beginPath();
          textCtx.moveTo(-wWidth / 2, fontSize * 0.48);
          textCtx.lineTo(wWidth / 2 + 4, fontSize * 0.48);
          textCtx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          textCtx.lineWidth = 0.9;
          textCtx.stroke();
        }

        textCtx.restore();

        // Loop seamlessly through words
        if (st.wordIndex >= this.words.length) {
          st.wordIndex = 0;
        }

        if (st.currentR >= st.maxDist) {
          st.isDone = true;
          break;
        }
      }

      if (st.isDone) {
        this.textStreamers.splice(i, 1);
      }
    }
  }

  render(ctx, width, height, cx, cy, lightWaves, alpha = 1.0) {
    if (alpha <= 0.001) return;

    this.resize(width, height);

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. Render Spreading Ink & Paper Layer
    ctx.drawImage(this.inkCanvas, 0, 0);

    // 2. Light wave shimmers across existing paths
    if (lightWaves && lightWaves.waves.length > 0) {
      const maxR = Math.hypot(width, height) * 0.78;
      ctx.save();
      for (const wave of lightWaves.waves) {
        const waveRadius = (wave.direction > 0 ? (1.0 - wave.progress) : wave.progress) * maxR;
        const waveBand = wave.width * maxR;

        for (const path of this.recentPaths) {
          ctx.beginPath();
          let hasPoints = false;
          for (let k = 0; k < path.length; k++) {
            const pt = path[k];
            const dist = Math.abs(pt.r - waveRadius);
            if (dist < waveBand) {
              if (!hasPoints) {
                ctx.moveTo(pt.x, pt.y);
                hasPoints = true;
              } else {
                ctx.lineTo(pt.x, pt.y);
              }
            }
          }
          if (hasPoints) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * wave.intensity})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // 3. Central Vanishing Point Dark Core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.65, '#0a0a0e');
    coreGrad.addColorStop(1, 'rgba(250, 247, 242, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();

    // 4. Render LUMINOUS WHITE WORD LAYER ON TOP OF EVERYTHING
    ctx.drawImage(this.textCanvas, 0, 0);

    ctx.restore();
  }
}


// --- js/systems/movieTunnel.js ---
/**
 * Scene 2: Movie Tunnel (1951 Animated Film)
 * Authentic Soft Watercolor & Diluted Pigment on Paper (ESTÉTICA DE ACUARELA).
 * Slower, languid, expressive watercolor ribbons with persistent pigment trails,
 * multi-scale strokes (broad washes, medium ribbons, sinuous filigrees),
 * and center-to-corner radial depth (deep midnight & prussian blues at center,
 * blossoming into luminous powdery blues, soft turquoises, and lilacs at corners).
 */




class MovieTunnel {
  constructor() {
    this.time = 0;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Persistent offscreen canvas buffer for accumulated watercolor layers
    this.offscreenCanvas = document.createElement('canvas');
    this.offCtx = this.offscreenCanvas.getContext('2d');

    // Rich Palette lineages: Dark contrast tones coexisting with vibrant turquoise,
    // royal purple, and fine luminous yellow threads emerging from center
    this.centerDarkColors = [
      { r: 14, g: 24, b: 50 },  // Azul Prusia profundo
      { r: 22, g: 18, b: 48 },  // Índigo abisal
      { r: 36, g: 16, b: 44 },  // Ciruela / violeta oscuro
      { r: 16, g: 42, b: 58 },  // Azul petróleo denso
      { r: 28, g: 20, b: 38 }   // Sombra berenjena suave
    ];

    this.outerDarkColors = [
      { r: 35,  g: 78,  b: 118 }, // Azul noche medio
      { r: 64,  g: 92,  b: 145 }, // Azul cobalto suave
      { r: 88,  g: 58,  b: 112 }, // Violeta medio
      { r: 42,  g: 86,  b: 104 }  // Petróleo medio
    ];

    // FlowField for organic, sweeping watercolor vortex curves
    this.flowField = new FlowField({
      vortexStrength: 0.78,
      radialExpansion: 0.38, // Gentle, fluid radial expansion outward
      noiseScale: 0.0018,
      noiseStrength: 0.72,
      turbulence: 0.26,
      spiralDirection: 1
    });

    // Low-res pigment simulation & spatial coverage map
    this.colorGrid = new ColorGrid(64, 48);

    // Active autonomous brush agents
    this.agents = [];
    this.maxAgents = 32;

    // Soft pigment wash drips & stains
    this.washStains = [];
    this.nextStainTime = 0;

    // Completed paths for light wave glazes
    this.recentPaths = [];
    this.maxRecentPaths = 45;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.colorGrid.resize(width, height);
    this.colorGrid.reset();

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.hypot(width, height) * 0.82;

    // Deep luminous indigo-slate paper ground with darker center
    const bgGrad = this.offCtx.createRadialGradient(cx, cy, 12, cx, cy, maxR);
    bgGrad.addColorStop(0.0, '#060810');
    bgGrad.addColorStop(0.30, '#0d111c');
    bgGrad.addColorStop(0.65, '#141a28');
    bgGrad.addColorStop(1.0, '#0a0e18');
    this.offCtx.fillStyle = bgGrad;
    this.offCtx.fillRect(0, 0, width, height);

    this.agents = [];
    this.recentPaths = [];
    this.washStains = [];
    this.time = 0;
    this.nextStainTime = 0.3;

    // Seed initial diverse watercolor ribbons
    for (let i = 0; i < 14; i++) {
      this.spawnAgent();
    }

    this.initialized = true;
  }

  resize(width, height) {
    if (!this.initialized || this.width !== width || this.height !== height) {
      const temp = document.createElement('canvas');
      temp.width = this.width;
      temp.height = this.height;
      const tCtx = temp.getContext('2d');
      if (this.width > 0 && this.height > 0) {
        tCtx.drawImage(this.offscreenCanvas, 0, 0);
      }

      this.width = width;
      this.height = height;
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
      this.colorGrid.resize(width, height);

      if (temp.width > 0 && temp.height > 0) {
        this.offCtx.drawImage(temp, 0, 0, width, height);
      } else {
        this.init(width, height);
      }
    }
  }

  reset() {
    if (this.width > 0 && this.height > 0) {
      this.init(this.width, this.height);
    }
  }

  /**
   * Generates a color lineage definition:
   * - Turquoise: starts rich turquoise at center, brightens into luminous aquamarine outward
   * - Purple: starts deep royal purple at center, brightens to vibrant lilac/violet outward
   * - Fine Yellow: luminous warm golden thread ("un fino amarillo")
   * - Dark: deep Prussian blue/indigo/plum/petrol contrast
   */
  pickLineage() {
    const roll = Math.random();
    if (roll < 0.28) {
      // 1. Vibrant Turquoise that brightens as it emerges and expands from center
      return {
        type: 'turquoise',
        startCol: { r: 18, g: 155, b: 165 }, // Turquesa vivo
        endCol: { r: 128, g: 242, b: 236 }   // Turquesa claro luminoso
      };
    } else if (roll < 0.54) {
      // 2. Royal Purple / Violet emerging from center
      return {
        type: 'purple',
        startCol: { r: 125, g: 38, b: 175 }, // Morado intenso
        endCol: { r: 212, g: 172, b: 242 }   // Lila / violeta luminoso
      };
    } else if (roll < 0.72) {
      // 3. Fine luminous yellow ribbon / filigree ("un fino amarillo")
      return {
        type: 'yellow',
        startCol: { r: 250, g: 202, b: 48 }, // Dorado cálido
        endCol: { r: 255, g: 232, b: 92 }    // Amarillo luminoso
      };
    } else {
      // 4. Dark contrast tones (Prussian blue, dark indigo, plum, dark petrol)
      const c = this.centerDarkColors[Math.floor(Math.random() * this.centerDarkColors.length)];
      const o = this.outerDarkColors[Math.floor(Math.random() * this.outerDarkColors.length)];
      return {
        type: 'dark',
        startCol: c,
        endCol: o
      };
    }
  }

  getColorForLineage(lineage, r) {
    const maxCorner = Math.hypot(this.width, this.height) * 0.75;
    const normDist = Math.min(1.0, r / Math.max(80, maxCorner));
    return FastMath.blendRGB(lineage.startCol, lineage.endCol, Math.pow(normDist, 0.72));
  }

  getColorForRadius(r) {
    return this.getColorForLineage(this.pickLineage(), r);
  }

  spawnAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxCorner = Math.hypot(this.width, this.height) * 0.82;

    // Spawning: 70% near center, 30% seeded at mid radii for continuous stratified coverage
    const isMidSpawn = Math.random() > 0.70;
    const baseR = isMidSpawn ? (45 + Math.random() * (maxCorner * 0.40)) : (8 + Math.random() * 28);

    const spawnAngle = this.colorGrid.findLeastCoveredAngle(cx, cy, baseR);
    const x = cx + Math.cos(spawnAngle) * baseR;
    const y = cy + Math.sin(spawnAngle) * baseR;

    const lineage = this.pickLineage();
    const col = this.getColorForLineage(lineage, baseR);

    // Brush categories: Special handling for fine luminous yellow ribbons, plus broad and medium washes
    let thickness, opacity, speed, maxLife, numPasses, bristleSpread;

    if (lineage.type === 'yellow') {
      // Delicate luminous yellow thread ("un fino amarillo")
      thickness = 1.8 + Math.random() * 3.2; // fine and graceful
      opacity = 0.68 + Math.random() * 0.24; // strong luminous presence
      speed = 28 + Math.random() * 18;
      maxLife = 14.0 + Math.random() * 6.0;
      numPasses = 2;
      bristleSpread = 0.22;
    } else {
      const category = Math.random();
      if (category < 0.35) {
        // 1. Broad translucent watercolor washes
        thickness = 22 + Math.random() * 20;
        opacity = 0.18 + Math.random() * 0.14;
        speed = 18 + Math.random() * 14;
        maxLife = 17.0 + Math.random() * 7.0;
        numPasses = 4;
        bristleSpread = 0.50;
      } else if (category < 0.75) {
        // 2. Medium expressive pigment ribbons
        thickness = 9 + Math.random() * 12;
        opacity = 0.30 + Math.random() * 0.22;
        speed = 24 + Math.random() * 16;
        maxLife = 13.0 + Math.random() * 6.0;
        numPasses = 3;
        bristleSpread = 0.38;
      } else {
        // 3. Delicate sinuous filigrees
        thickness = 2.4 + Math.random() * 3.6;
        opacity = 0.50 + Math.random() * 0.28;
        speed = 30 + Math.random() * 18;
        maxLife = 12.0 + Math.random() * 5.0;
        numPasses = 2;
        bristleSpread = 0.24;
      }
    }

    const initForce = this.flowField.getForce(x, y, cx, cy, this.time);

    const agent = new BrushAgent({
      x,
      y,
      vx: initForce.x * speed,
      vy: initForce.y * speed,
      speed,
      maxSteerForce: 3.2,
      thickness,
      opacity,
      color: col,
      maxLife,
      numPasses,
      bristleSpread,
      isWet: true,
      isGothic: false
    });
    agent.lineage = lineage;

    this.agents.push(agent);
  }

  spawnWashStain() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const r = 25 + Math.random() * (Math.hypot(this.width, this.height) * 0.55);
    const lineage = this.pickLineage();
    const col = this.getColorForLineage(lineage, r);

    this.washStains.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      radius: 28 + Math.random() * 75,
      color: col,
      opacity: 0.09 + Math.random() * 0.12,
      drawn: false
    });
  }

  update(dt, speedMult = 1.0) {
    if (!this.initialized) return;

    this.time += dt * speedMult;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const offCtx = this.offCtx;
    const maxCorner = Math.hypot(this.width, this.height) * 0.82;

    // Soft watercolor bloom stains
    this.nextStainTime -= dt * speedMult;
    if (this.nextStainTime <= 0) {
      this.spawnWashStain();
      this.nextStainTime = 1.6 / Math.max(1, speedMult * 0.85);
    }

    for (let i = this.washStains.length - 1; i >= 0; i--) {
      const s = this.washStains[i];
      if (!s.drawn) {
        offCtx.save();
        const radGrad = offCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
        radGrad.addColorStop(0, `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.opacity})`);
        radGrad.addColorStop(0.65, `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.opacity * 0.45})`);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        offCtx.fillStyle = radGrad;
        offCtx.beginPath();
        offCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        offCtx.fill();
        offCtx.restore();

        this.colorGrid.depositPigment(s.x, s.y, s.color, s.opacity * 0.75);
        s.drawn = true;
      }
      this.washStains.splice(i, 1);
    }

    // Maintain active watercolor brush agents
    while (this.agents.length < this.maxAgents) {
      this.spawnAgent();
    }

    // Step agents & paint onto persistent canvas buffer
    for (let i = this.agents.length - 1; i >= 0; i--) {
      const agent = this.agents[i];

      // Dynamically blend agent color toward outward tone as it journeys away from center
      const currentR = Math.hypot(agent.x - cx, agent.y - cy);
      const targetCol = agent.lineage ? this.getColorForLineage(agent.lineage, currentR) : this.getColorForRadius(currentR);
      agent.currentColor = FastMath.blendRGB(agent.currentColor, targetCol, 0.04);

      agent.update(dt, this.flowField, this.colorGrid, cx, cy, this.time, speedMult);
      agent.drawSegment(offCtx);

      if (agent.isDead || currentR > maxCorner) {
        if (agent.history.length > 5) {
          this.recentPaths.push(agent.history);
          if (this.recentPaths.length > this.maxRecentPaths) {
            this.recentPaths.shift();
          }
        }
        this.agents.splice(i, 1);
      }
    }

    // Gentle pigment diffusion in ColorGrid
    this.colorGrid.diffuse(0.016 * dt * speedMult);
  }

  render(ctx, width, height, cx, cy, lightWaves, alpha = 1.0) {
    if (alpha <= 0.001) return;

    this.resize(width, height);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Subtle light wave glazes over existing strokes
    if (lightWaves && lightWaves.waves.length > 0) {
      const maxR = Math.hypot(width, height) * 0.78;

      ctx.save();
      for (const wave of lightWaves.waves) {
        const waveRadius = (wave.direction > 0 ? (1.0 - wave.progress) : wave.progress) * maxR;
        const waveBand = wave.width * maxR;

        for (const path of this.recentPaths) {
          ctx.beginPath();
          let hasPoints = false;
          for (let k = 0; k < path.length; k++) {
            const pt = path[k];
            const dist = Math.abs(pt.r - waveRadius);
            if (dist < waveBand) {
              if (!hasPoints) {
                ctx.moveTo(pt.x, pt.y);
                hasPoints = true;
              } else {
                ctx.lineTo(pt.x, pt.y);
              }
            }
          }
          if (hasPoints) {
            ctx.strokeStyle = `rgba(185, 220, 255, ${0.30 * wave.intensity})`;
            ctx.lineWidth = 2.0;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // Deep luminous center core gradient (Reference painting eye)
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
    coreGrad.addColorStop(0, '#04060c');
    coreGrad.addColorStop(0.65, '#0a0e18');
    coreGrad.addColorStop(1, 'rgba(10, 14, 24, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}


// --- js/systems/gameTunnel.js ---
/**
 * Scene 3: Game Tunnel (American McGee's Alice, 2000 / Alice Madness)
 * Authentic Dark Watercolor & Dense Gothic Pigment (ACUARELA OSCURA).
 * Dominated by midnight blue, dark petrol, deep indigo, burgundy, dark wine, and dark violet,
 * balanced with luminous steel-blue and crimson contrast highlights towards corners.
 * Features organic abstract crimson pigment splatters, elongated droplets, and branching tendrils.
 */




class GameTunnel {
  constructor() {
    this.time = 0;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Persistent offscreen canvas buffer for accumulated dark watercolor painting
    this.offscreenCanvas = document.createElement('canvas');
    this.offCtx = this.offscreenCanvas.getContext('2d');

    // Deep Gothic Palette: Midnight Blues, Dark Petrol, Indigo, Burgundy, Wine
    this.centerColors = [
      { r: 10, g: 15, b: 34 },  // Azul noche profundo
      { r: 12, g: 34, b: 46 },  // Azul petróleo oscuro
      { r: 18, g: 16, b: 52 },  // Índigo abisal
      { r: 68, g: 12, b: 24 },  // Borgoña denso
      { r: 85, g: 16, b: 28 },  // Rojo vino oscuro
      { r: 38, g: 14, b: 48 }   // Violeta oscuro
    ];

    this.outerColors = [
      { r: 35,  g: 82,  b: 108 }, // Azul petróleo
      { r: 52,  g: 68,  b: 124 }, // Índigo rico
      { r: 145, g: 26,  b: 46  }, // Carmesí apagado
      { r: 188, g: 46,  b: 72  }, // Carmesí luminoso / rosa oscuro
      { r: 112, g: 162, b: 198 }, // Azul acero luminoso (contraste)
      { r: 135, g: 178, b: 210 }, // Celeste grisáceo
      { r: 128, g: 112, b: 164 }  // Violeta grisáceo
    ];

    // Occasional striking, high-contrast luminous strokes that pierce the dark gothic ground
    this.strikingColors = [
      { r: 110, g: 198, b: 248 }, // Azul acero eléctrico brillante
      { r: 238, g: 38,  b: 78  }, // Carmesí / carmín vibrante
      { r: 198, g: 185, b: 236 }, // Lavanda plateada / hielo
      { r: 42,  g: 218, b: 206 }, // Petróleo turquesa resplandeciente
      { r: 245, g: 168, b: 210 }  // Rosa cuarzo pálido llamativo
    ];

    // FlowField for turbulent, twisted asymmetric curves reaching corners
    this.flowField = new FlowField({
      vortexStrength: 0.82,
      radialExpansion: 0.40, // Expands fully into corners
      noiseScale: 0.0025,
      noiseStrength: 1.10,
      turbulence: 0.46,
      spiralDirection: -1 // counter-swirl for unsettling asymmetric tension
    });

    // Pigment simulation & spatial coverage map
    this.colorGrid = new ColorGrid(64, 48);

    // Active autonomous brush agents
    this.agents = [];
    this.maxAgents = 34;

    // Organic Abstract Crimson Splatters & Droplets
    this.nextSplatterTime = 0;

    // Dense pigment puddles / dark concentrated blotches
    this.denseBlotches = [];
    this.nextBlotchTime = 0;

    // Completed paths for surface light shimmers
    this.recentPaths = [];
    this.maxRecentPaths = 45;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.colorGrid.resize(width, height);
    this.colorGrid.reset();

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.hypot(width, height) * 0.82;

    // Deep blackened charcoal & midnight umber paper background
    const bgGrad = this.offCtx.createRadialGradient(cx, cy, 10, cx, cy, maxR);
    bgGrad.addColorStop(0.0, '#020306');
    bgGrad.addColorStop(0.30, '#060912');
    bgGrad.addColorStop(0.65, '#0c121e');
    bgGrad.addColorStop(1.0, '#04060c');
    this.offCtx.fillStyle = bgGrad;
    this.offCtx.fillRect(0, 0, width, height);

    this.agents = [];
    this.recentPaths = [];
    this.denseBlotches = [];
    this.time = 0;
    this.nextBlotchTime = 0.4;
    this.nextSplatterTime = 0.6;

    // Spawn initial dark strokes across center and mid radii
    for (let i = 0; i < 14; i++) {
      this.spawnAgent();
    }

    this.initialized = true;
  }

  resize(width, height) {
    if (!this.initialized || this.width !== width || this.height !== height) {
      const temp = document.createElement('canvas');
      temp.width = this.width;
      temp.height = this.height;
      const tCtx = temp.getContext('2d');
      if (this.width > 0 && this.height > 0) {
        tCtx.drawImage(this.offscreenCanvas, 0, 0);
      }

      this.width = width;
      this.height = height;
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
      this.colorGrid.resize(width, height);

      if (temp.width > 0 && temp.height > 0) {
        this.offCtx.drawImage(temp, 0, 0, width, height);
      } else {
        this.init(width, height);
      }
    }
  }

  reset() {
    if (this.width > 0 && this.height > 0) {
      this.init(this.width, this.height);
    }
  }

  /**
   * Radial Color Depth:
   * Midnight blues, dark petrol, and deep wine near the central abyss,
   * transitioning outwards into rich indigo, crimson, and luminous steel-blue highlights
   */
  getColorForRadius(r) {
    const maxCorner = Math.hypot(this.width, this.height) * 0.75;
    const normDist = Math.min(1.0, r / Math.max(100, maxCorner));

    const centerCol = this.centerColors[Math.floor(Math.random() * this.centerColors.length)];
    const outerCol = this.outerColors[Math.floor(Math.random() * this.outerColors.length)];

    return FastMath.blendRGB(centerCol, outerCol, Math.pow(normDist, 0.70));
  }

  spawnAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxCorner = Math.hypot(this.width, this.height) * 0.82;

    const isMidSpawn = Math.random() > 0.68;
    const baseR = isMidSpawn ? (45 + Math.random() * (maxCorner * 0.42)) : (10 + Math.random() * 26);

    const spawnAngle = this.colorGrid.findLeastCoveredAngle(cx, cy, baseR);
    const x = cx + Math.cos(spawnAngle) * baseR;
    const y = cy + Math.sin(spawnAngle) * baseR;

    // ~20% of strokes are striking, luminous and vivid amidst the dark tones
    const isStriking = Math.random() < 0.20;
    const col = isStriking
      ? this.strikingColors[Math.floor(Math.random() * this.strikingColors.length)]
      : this.getColorForRadius(baseR);

    // Varied Brush Hierarchy (Inspired by reference painting strata)
    const category = Math.random();
    let thickness, opacity, speed, maxLife, numPasses, bristleSpread;

    if (isStriking) {
      // Striking, luminous expressive accent stroke
      thickness = 2.0 + Math.random() * 4.2;
      opacity = 0.72 + Math.random() * 0.24;
      speed = 34 + Math.random() * 24;
      maxLife = 12.0 + Math.random() * 5.0;
      numPasses = 2;
      bristleSpread = 0.22;
    } else if (category < 0.35) {
      // 1. Broad deep midnight blue and wine strata
      thickness = 22 + Math.random() * 20;
      opacity = 0.24 + Math.random() * 0.16;
      speed = 22 + Math.random() * 16;
      maxLife = 16.0 + Math.random() * 7.0;
      numPasses = 4;
      bristleSpread = 0.48;
    } else if (category < 0.75) {
      // 2. Dense twisted asymmetrical gothic ribbons
      thickness = 9 + Math.random() * 13;
      opacity = 0.35 + Math.random() * 0.25;
      speed = 28 + Math.random() * 20;
      maxLife = 13.0 + Math.random() * 6.0;
      numPasses = 3;
      bristleSpread = 0.38;
    } else {
      // 3. Sharp carmine and petrol thorn filigrees
      thickness = 2.4 + Math.random() * 3.8;
      opacity = 0.55 + Math.random() * 0.30;
      speed = 34 + Math.random() * 22;
      maxLife = 11.0 + Math.random() * 5.0;
      numPasses = 2;
      bristleSpread = 0.22;
    }

    const initForce = this.flowField.getForce(x, y, cx, cy, this.time);

    const agent = new BrushAgent({
      x,
      y,
      vx: initForce.x * speed,
      vy: initForce.y * speed,
      speed,
      maxSteerForce: 4.2,
      thickness,
      opacity,
      color: col,
      maxLife,
      numPasses,
      bristleSpread,
      isWet: true,
      isGothic: true
    });
    agent.isStriking = isStriking;
    this.agents.push(agent);
  }

  /**
   * Spawns an abstract, artistic crimson splatter & elongated droplet cluster
   * Treated strictly as watercolor pigment dispersion (non-gore, artistic abstract expression)
   */
  spawnAbstractSplatter(atX = null, atY = null) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const offCtx = this.offCtx;

    let sx = atX;
    let sy = atY;

    if (sx === null || sy === null) {
      const angle = Math.random() * Math.PI * 2;
      const r = 35 + Math.random() * (Math.hypot(this.width, this.height) * 0.48);
      sx = cx + Math.cos(angle) * r;
      sy = cy + Math.sin(angle) * r;
    }

    // Rich crimson / wine watercolor pigments
    const crimsonColors = [
      { r: 145, g: 24, b: 42 }, // Carmesí rico
      { r: 110, g: 18, b: 32 }, // Vino tinto
      { r: 175, g: 32, b: 54 }, // Carmín vibrante
      { r: 78,  g: 12, b: 24 }  // Borgoña oscuro
    ];
    const col = crimsonColors[Math.floor(Math.random() * crimsonColors.length)];

    offCtx.save();

    // 1. Central teardrop / elongated droplet aligned with flow
    const flow = this.flowField.getForce(sx, sy, cx, cy, this.time);
    const flowAngle = Math.atan2(flow.y, flow.x);
    const dropLen = 12 + Math.random() * 24;
    const dropRadius = 3 + Math.random() * 6;

    offCtx.translate(sx, sy);
    offCtx.rotate(flowAngle);

    // Translucent bleeding watercolor body
    const dropGrad = offCtx.createRadialGradient(0, 0, 0, 0, 0, dropLen);
    dropGrad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0.65)`);
    dropGrad.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, 0.35)`);
    dropGrad.addColorStop(1, 'rgba(0,0,0,0)');
    offCtx.fillStyle = dropGrad;

    offCtx.beginPath();
    offCtx.ellipse(dropLen * 0.4, 0, dropLen * 0.6, dropRadius, 0, 0, Math.PI * 2);
    offCtx.fill();

    // 2. Organic satellite micro-droplets flung along trajectory
    const numSatellites = 3 + Math.floor(Math.random() * 5);
    for (let s = 0; s < numSatellites; s++) {
      const satDist = dropLen + 6 + Math.random() * 28;
      const satSpread = (Math.random() - 0.5) * 14;
      const satR = 1.0 + Math.random() * 2.5;
      const satAlpha = 0.30 + Math.random() * 0.45;

      offCtx.beginPath();
      offCtx.arc(satDist, satSpread, satR, 0, Math.PI * 2);
      offCtx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${satAlpha})`;
      offCtx.fill();
    }

    // 3. Fine branching capillary tendrils (organic dispersion)
    if (Math.random() > 0.45) {
      offCtx.beginPath();
      offCtx.moveTo(0, 0);
      let tx = 0;
      let ty = 0;
      const steps = 4 + Math.floor(Math.random() * 4);
      for (let st = 0; st < steps; st++) {
        tx += 4 + Math.random() * 8;
        ty += (Math.random() - 0.5) * 8;
        offCtx.lineTo(tx, ty);
      }
      offCtx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, 0.50)`;
      offCtx.lineWidth = 1.0;
      offCtx.stroke();
    }

    offCtx.restore();

    this.colorGrid.depositPigment(sx, sy, col, 0.22);
  }

  spawnDenseBlotch() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const r = 20 + Math.random() * (Math.hypot(this.width, this.height) * 0.50);
    const col = this.getColorForRadius(r);

    this.denseBlotches.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      radius: 20 + Math.random() * 55,
      color: col,
      opacity: 0.12 + Math.random() * 0.16,
      drawn: false
    });
  }

  update(dt, speedMult = 1.0) {
    if (!this.initialized) return;

    this.time += dt * speedMult;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const offCtx = this.offCtx;
    const maxCorner = Math.hypot(this.width, this.height) * 0.82;

    // Organic Abstract Crimson Splatters (more frequent per user request)
    this.nextSplatterTime -= dt * speedMult;
    if (this.nextSplatterTime <= 0) {
      this.spawnAbstractSplatter();
      this.nextSplatterTime = (0.75 + Math.random() * 0.75) / Math.max(1, speedMult * 0.85);
    }

    // Dark dense watercolor blotches
    this.nextBlotchTime -= dt * speedMult;
    if (this.nextBlotchTime <= 0) {
      this.spawnDenseBlotch();
      this.nextBlotchTime = 1.4 / Math.max(1, speedMult * 0.85);
    }

    for (let i = this.denseBlotches.length - 1; i >= 0; i--) {
      const b = this.denseBlotches[i];
      if (!b.drawn) {
        offCtx.save();
        const radGrad = offCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        radGrad.addColorStop(0, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.opacity})`);
        radGrad.addColorStop(0.6, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.opacity * 0.45})`);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        offCtx.fillStyle = radGrad;
        offCtx.beginPath();
        offCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        offCtx.fill();
        offCtx.restore();

        this.colorGrid.depositPigment(b.x, b.y, b.color, b.opacity * 0.85);
        b.drawn = true;
      }
      this.denseBlotches.splice(i, 1);
    }

    // Maintain active brush agents
    while (this.agents.length < this.maxAgents) {
      this.spawnAgent();
    }

    // Step agents & paint onto persistent canvas buffer
    for (let i = this.agents.length - 1; i >= 0; i--) {
      const agent = this.agents[i];

      // Dynamically blend agent color toward outward tone as it journeys away from center
      const currentR = Math.hypot(agent.x - cx, agent.y - cy);
      if (!agent.isStriking) {
        const targetCol = this.getColorForRadius(currentR);
        agent.currentColor = FastMath.blendRGB(agent.currentColor, targetCol, 0.04);
      }

      agent.update(dt, this.flowField, this.colorGrid, cx, cy, this.time, speedMult);
      agent.drawSegment(offCtx);

      // Occasional organic splatter spawned along high-curvature turns
      if (Math.random() > 0.95 && agent.currentColor.r > 80) {
        this.spawnAbstractSplatter(agent.x, agent.y);
      }

      if (agent.isDead || currentR > maxCorner) {
        if (agent.history.length > 5) {
          this.recentPaths.push(agent.history);
          if (this.recentPaths.length > this.maxRecentPaths) {
            this.recentPaths.shift();
          }
        }
        this.agents.splice(i, 1);
      }
    }

    // Pigment diffusion
    this.colorGrid.diffuse(0.018 * dt * speedMult);
  }

  render(ctx, width, height, cx, cy, lightWaves, alpha = 1.0) {
    if (alpha <= 0.001) return;

    this.resize(width, height);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Subtle dark wine / petrol surface shimmers
    if (lightWaves && lightWaves.waves.length > 0) {
      const maxR = Math.hypot(width, height) * 0.78;

      ctx.save();
      for (const wave of lightWaves.waves) {
        const waveRadius = (wave.direction > 0 ? (1.0 - wave.progress) : wave.progress) * maxR;
        const waveBand = wave.width * maxR;

        for (const path of this.recentPaths) {
          ctx.beginPath();
          let hasPoints = false;
          for (let k = 0; k < path.length; k++) {
            const pt = path[k];
            const dist = Math.abs(pt.r - waveRadius);
            if (dist < waveBand) {
              if (!hasPoints) {
                ctx.moveTo(pt.x, pt.y);
                hasPoints = true;
              } else {
                ctx.lineTo(pt.x, pt.y);
              }
            }
          }
          if (hasPoints) {
            ctx.strokeStyle = `rgba(185, 45, 68, ${0.35 * wave.intensity})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // Deep blackened abyss core gradient
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.60, '#040208');
    coreGrad.addColorStop(1, 'rgba(4, 2, 8, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}


// --- js/systems/aliceController.js ---
/**
 * Alice Character Controller
 * Manages rendering of the provided Alice assets:
 * - AliceBook-Photoroom.png
 * - AliceMovie-Photoroom.png
 * - AliceGame-Photoroom.png
 *
 * Implements true 3D depth cinematic animations:
 * 1. Dramatic Fall from foreground/above (scale 4.2 -> 1.0, rotating down into vanishing point).
 * 2. Settled slow-motion vertical suspension floating.
 * 3. Perspective descent into vanishing point (scale 1.0 -> 0.001) during transitions.
 */

class AliceController {
  constructor() {
    this.eraIndex = 0; // 0: Book, 1: Movie, 2: Game
    this.images = [null, null, null];
    this.isLoaded = [false, false, false];

    // Image paths in assets directory
    this.assetPaths = [
      'assets/AliceBook-Photoroom.png',
      'assets/AliceMovie-Photoroom.png',
      'assets/AliceGame-Photoroom.png'
    ];

    // Physics & transform state
    this.scale = 1.0;
    this.rotation = 0;
    this.verticalOffset = 0;
    this.horizontalOffset = 0;
    this.alpha = 0.0;

    // Time tracking
    this.time = 0;
    this.isFalling = false;
    this.fallDuration = 3.4; // seconds for dramatic perspective fall
    this.fallElapsed = 0;
    this.onFallComplete = null;

    this.isRetracting = false;
    this.retractDuration = 1.5;
    this.retractElapsed = 0;
    this.retractDirection = 1;
    this.onRetractComplete = null;

    // Parallax mouse tilt
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    // Mode override for manual transition transforms
    this.isTransitionControlled = false;

    this.loadAssets();
  }

  loadAssets() {
    this.assetPaths.forEach((path, index) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        this.images[index] = img;
        this.isLoaded[index] = true;
      };
      img.onerror = () => {
        console.error(`Error loading Alice asset: ${path}`);
      };
    });
  }

  setEra(index) {
    this.eraIndex = ((index % 3) + 3) % 3;
  }

  setMouse(nx, ny) {
    this.mouseTargetX = nx * 22;
    this.mouseTargetY = ny * 16;
  }

  triggerFall(eraIndex, onComplete = null) {
    this.setEra(eraIndex);
    this.isFalling = true;
    this.isRetracting = false;
    this.isTransitionControlled = false;
    this.fallDuration = 3.4;
    this.fallElapsed = 0;
    this.onFallComplete = onComplete;

    // Initial cinematic entrance state: high above foreground
    this.scale = 4.2;
    this.rotation = -Math.PI * 5.0; // spinning descent
    this.verticalOffset = -340; // above camera
    this.horizontalOffset = 45;
    this.alpha = 0.0;
  }

  triggerRetract(direction = 1, onComplete = null) {
    this.isRetracting = true;
    this.isFalling = false;
    this.isTransitionControlled = false;
    this.retractDuration = 1.5;
    this.retractElapsed = 0;
    this.retractDirection = direction;
    this.onRetractComplete = onComplete;
  }

  update(dt, speedMult = 1.0) {
    this.time += dt * speedMult;

    // Smooth mouse parallax lerp
    this.mouseX += (this.mouseTargetX - this.mouseX) * Math.min(1.0, dt * 4);
    this.mouseY += (this.mouseTargetY - this.mouseY) * Math.min(1.0, dt * 4);

    if (this.isTransitionControlled) {
      return;
    }

    if (this.isFalling) {
      this.fallElapsed += dt;
      const progress = Math.min(1.0, this.fallElapsed / this.fallDuration);

      // Ease out cubic for falling deceleration into depth
      const t = progress;
      const easeOut = 1 - Math.pow(1 - t, 3);

      // Scale drops from 4.2 down to 1.0
      this.scale = 1.0 + 3.2 * (1 - easeOut);

      // Rotation spins into vanishing point
      this.rotation = (1 - easeOut) * (-Math.PI * 5.0);

      // Position travels from high foreground into center vanishing point
      this.verticalOffset = (1 - easeOut) * -340;
      this.horizontalOffset = (1 - easeOut) * 45;
      this.alpha = Math.min(1.0, progress * 3.0);

      if (progress >= 1.0) {
        this.isFalling = false;
        this.scale = 1.0;
        this.rotation = 0;
        this.verticalOffset = 0;
        this.horizontalOffset = 0;
        this.alpha = 1.0;
        if (this.onFallComplete) {
          const cb = this.onFallComplete;
          this.onFallComplete = null;
          cb();
        }
      }
    } else if (this.isRetracting) {
      this.retractElapsed += dt;
      const progress = Math.min(1.0, this.retractElapsed / this.retractDuration);
      const ease = progress * progress * progress; // ease in cubic

      this.scale = Math.max(0.001, 1.0 - ease * 0.999);
      this.rotation = this.retractDirection * (Math.PI * 0.8 + ease * Math.PI * 8.0);
      this.verticalOffset = ease * 18;
      this.alpha = this.scale > 0.04 ? 1.0 : (this.scale / 0.04);

      if (progress >= 1.0) {
        this.isRetracting = false;
        this.alpha = 0.0;
        if (this.onRetractComplete) {
          const cb = this.onRetractComplete;
          this.onRetractComplete = null;
          cb();
        }
      }
    } else if (this.alpha > 0.001) {
      // Subtle continuous slow-motion vertical bobbing (perpetual gentle fall)
      const bob1 = Math.sin(this.time * 1.3) * 8.5;
      const bob2 = Math.sin(this.time * 2.2 + 1.1) * 4.0;
      this.verticalOffset = bob1 + bob2;

      // Subtle scale oscillation (+-1.2%)
      this.scale = 1.0 + Math.sin(this.time * 1.7) * 0.012;

      // Subtle swaying angle tilt
      this.rotation = Math.sin(this.time * 0.85) * 0.03;
      this.horizontalOffset = 0;
      this.alpha = 1.0;
    }
  }

  setTransitionTransform(scale, rotation, alpha = 1.0, offsetX = 0, offsetY = 0) {
    this.isTransitionControlled = true;
    this.scale = scale;
    this.rotation = rotation;
    this.alpha = alpha;
    this.horizontalOffset = offsetX;
    this.verticalOffset = offsetY;
  }

  releaseTransitionTransform() {
    this.isTransitionControlled = false;
    this.horizontalOffset = 0;
    this.verticalOffset = 0;
    this.scale = 1.0;
    this.rotation = 0;
    this.alpha = 1.0;
  }

  render(ctx, width, height, cx, cy) {
    const img = this.images[this.eraIndex];
    if (!img || !this.isLoaded[this.eraIndex] || this.alpha <= 0.001) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

    // Target height: 42% of viewport height
    const targetHeight = Math.min(height * 0.44, width * 0.48);
    const aspect = img.naturalWidth / img.naturalHeight;
    const drawWidth = targetHeight * aspect;
    const drawHeight = targetHeight;

    const posX = cx + this.horizontalOffset + this.mouseX;
    const posY = cy + this.verticalOffset + this.mouseY;

    ctx.translate(posX, posY);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    // Dynamic depth shadow scaling with depth
    if (this.scale > 0.1) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = Math.min(30, 24 * this.scale);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.min(20, 10 * this.scale);
    }

    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }
}


// --- js/systems/pocketWatch.js ---
/**
 * Interactive Pocket Watch Navigation Controller
 * Located in bottom-right corner.
 * Hands tick slowly at idle. Holding or dragging spins the hands.
 * Reaching spin threshold triggers forward/backward era transition.
 */

class PocketWatch {
  constructor(canvasElement, onTriggerTransition) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.onTrigger = onTriggerTransition;

    // Dimensions
    this.size = 180; // virtual canvas dimensions
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    // Angles
    this.hourAngle = 0;
    this.minuteAngle = 0;
    this.angularVelocity = 0.5; // base idle speed (rad/s)
    this.idleSpeed = 0.5;
    this.dragSpeed = 0;

    // Accumulated rotation for triggering transition
    this.accumulatedAngle = 0;
    this.triggerThreshold = Math.PI * 3.5; // ~1.75 full rotations to trigger

    // Interaction state
    this.isPressed = false;
    this.isDragging = false;
    this.pressStartTime = 0;
    this.lastPointerAngle = null;
    this.isTransitionActive = false;
    this.chargeLevel = 0; // 0 to 1 for visual glow

    // Era theme color for gentle watch accents (soft paper & watercolor tones)
    this.eraColors = [
      'rgba(215, 195, 160, ', // Book: warm antique parchment / brass
      'rgba(164, 195, 225, ', // Movie: soft powdery watercolor blue
      'rgba(165, 45, 68, ',   // Game: rich wine red watercolor
      'rgba(245, 185, 45, '   // Create: warm golden yellow & amber
    ];
    this.currentEra = 0;

    this.bindEvents();
  }

  setEra(era) {
    this.currentEra = era;
  }

  setTransitionState(isActive) {
    this.isTransitionActive = isActive;
  }

  bindEvents() {
    const el = this.canvas;

    const getAngleFromCenter = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return Math.atan2(clientY - cy, clientX - cx);
    };

    const handlePointerDown = (e) => {
      e.preventDefault();
      if (this.isTransitionActive) return;
      this.isPressed = true;
      this.isDragging = false;
      this.pressStartTime = performance.now();
      this.lastPointerAngle = getAngleFromCenter(e);
    };

    const handlePointerMove = (e) => {
      if (!this.isPressed || this.isTransitionActive) return;
      e.preventDefault();
      const currentAngle = getAngleFromCenter(e);

      if (this.lastPointerAngle !== null) {
        let delta = currentAngle - this.lastPointerAngle;
        // Normalize wrap-around across [-PI, PI]
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        if (Math.abs(delta) > 0.01) {
          this.isDragging = true;
          // Apply direct rotation to hands
          this.minuteAngle += delta * 1.5;
          this.hourAngle += delta * 0.2;
          this.accumulatedAngle += delta;
          this.angularVelocity = delta * 45; // simulate momentum

          this.checkTrigger();
        }
      }
      this.lastPointerAngle = currentAngle;
    };

    const handlePointerUp = () => {
      this.isPressed = false;
      this.isDragging = false;
      this.lastPointerAngle = null;
    };

    el.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    el.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  }

  checkTrigger() {
    if (this.isTransitionActive) return;

    if (Math.abs(this.accumulatedAngle) >= this.triggerThreshold) {
      const direction = this.accumulatedAngle > 0 ? 1 : -1; // 1 = clockwise (forward), -1 = counter-clockwise (backward)
      this.accumulatedAngle = 0;
      this.angularVelocity = direction * 28.0; // surge spin effect
      if (this.onTrigger) {
        this.onTrigger(direction);
      }
    }
  }

  update(dt) {
    // If user is just holding down without dragging, hands accelerate exponentially
    if (this.isPressed && !this.isDragging && !this.isTransitionActive) {
      const holdTime = (performance.now() - this.pressStartTime) / 1000;
      const accelFactor = 1.0 + holdTime * 6.0;
      const holdDir = 1; // default forward on hold
      const dAngle = holdDir * this.idleSpeed * accelFactor * dt * 5;
      this.minuteAngle += dAngle;
      this.hourAngle += dAngle * 0.12;
      this.accumulatedAngle += dAngle;
      this.angularVelocity = holdDir * (this.idleSpeed + accelFactor * 4);
      this.checkTrigger();
    } else {
      // Free spin / decay back to idle
      this.minuteAngle += this.angularVelocity * dt;
      this.hourAngle += (this.angularVelocity * 0.1) * dt;

      // Decay toward idle speed
      const targetSpeed = this.isTransitionActive ? (Math.sign(this.angularVelocity || 1) * 18.0) : this.idleSpeed;
      this.angularVelocity += (targetSpeed - this.angularVelocity) * Math.min(1.0, dt * 2.2);

      // Decay accumulated angle when released without reaching threshold
      if (!this.isPressed && !this.isTransitionActive) {
        this.accumulatedAngle *= Math.pow(0.1, dt);
      }
    }

    // Charge level [0, 1]
    this.chargeLevel = Math.min(1.0, Math.abs(this.accumulatedAngle) / this.triggerThreshold);
  }

  render() {
    const ctx = this.ctx;
    const s = this.size;
    const cx = s / 2;
    const cy = s / 2 + 6; // slightly shifted down to accommodate top winding loop
    const r = s * 0.38;

    ctx.clearRect(0, 0, s, s);

    // 1. Top Winding Crown and Chain Ring Loop
    ctx.save();
    ctx.strokeStyle = '#c5a059';
    ctx.fillStyle = '#9b7631';
    ctx.lineWidth = 3.5;

    // Hanging ring loop
    ctx.beginPath();
    ctx.arc(cx, cy - r - 14, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Winding stem
    ctx.beginPath();
    ctx.rect(cx - 5, cy - r - 8, 10, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Outer Casing (antique brass / gold)
    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // Bezel gradient
    const bezelGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.5, cx, cy, r + 9);
    bezelGrad.addColorStop(0.0, '#ffd885');
    bezelGrad.addColorStop(0.5, '#b88939');
    bezelGrad.addColorStop(0.85, '#6a4918');
    bezelGrad.addColorStop(1.0, '#3a2408');

    ctx.fillStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Energy Charge Glow Ring around dial
    if (this.chargeLevel > 0.05 || this.isTransitionActive) {
      ctx.save();
      const glowAlpha = this.isTransitionActive ? 0.9 : (this.chargeLevel * 0.85);
      const eraCol = this.eraColors[this.currentEra];
      ctx.strokeStyle = `${eraCol}${glowAlpha})`;
      ctx.lineWidth = 4 + this.chargeLevel * 4;
      ctx.shadowColor = `${eraCol}1)`;
      ctx.shadowBlur = 14 + this.chargeLevel * 16;
      ctx.beginPath();
      // Draw arc representing accumulated charge
      const startA = -Math.PI / 2;
      const endA = startA + (this.accumulatedAngle || (this.minuteAngle * 0.5));
      ctx.arc(cx, cy, r + 5, startA, endA, this.accumulatedAngle < 0);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Dial Face (Ivory parchment)
    ctx.save();
    const faceGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    faceGrad.addColorStop(0.0, '#faf7ee');
    faceGrad.addColorStop(0.7, '#ece4d0');
    faceGrad.addColorStop(1.0, '#d1c4a5');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Dial border ring
    ctx.strokeStyle = '#5a4625';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 5. Roman Numerals & Minute Ticks
    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    ctx.fillStyle = '#2d2417';
    ctx.font = 'bold 9px "Cinzel", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const numR = r - 13;
      const nx = cx + Math.cos(angle) * numR;
      const ny = cy + Math.sin(angle) * numR;
      ctx.fillText(numerals[i], nx, ny);

      // Minute ticks
      for (let m = 0; m < 5; m++) {
        const tickAngle = angle + (m / 60) * Math.PI * 2;
        const tInner = r - (m === 0 ? 5 : 3);
        const tOuter = r - 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tickAngle) * tInner, cy + Math.sin(tickAngle) * tInner);
        ctx.lineTo(cx + Math.cos(tickAngle) * tOuter, cy + Math.sin(tickAngle) * tOuter);
        ctx.lineWidth = m === 0 ? 1.4 : 0.8;
        ctx.strokeStyle = '#5a4625';
        ctx.stroke();
      }
    }

    // Dial center ornate watermark / logo
    ctx.font = 'italic 7px "Cormorant Garamond", serif';
    ctx.fillStyle = 'rgba(90, 70, 40, 0.6)';
    ctx.fillText('WONDERLAND', cx, cy - 18);
    ctx.fillText('TEMPORAL', cx, cy + 18);
    ctx.restore();

    // 6. Clock Hands (Vintage spade / teardrop style)
    ctx.save();
    ctx.translate(cx, cy);

    // Hour Hand
    ctx.save();
    ctx.rotate(this.hourAngle);
    ctx.fillStyle = '#1c150c';
    ctx.strokeStyle = '#1c150c';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(0, -r * 0.52);
    ctx.stroke();
    // Heart / spade tip
    ctx.beginPath();
    ctx.arc(0, -r * 0.40, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Minute Hand (longer and thinner)
    ctx.save();
    ctx.rotate(this.minuteAngle);
    ctx.fillStyle = '#261b0c';
    ctx.strokeStyle = '#261b0c';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.lineTo(0, -r * 0.76);
    ctx.stroke();
    // Teardrop ornament
    ctx.beginPath();
    ctx.arc(0, -r * 0.60, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Center pivot nut
    ctx.fillStyle = '#c5a059';
    ctx.strokeStyle = '#261b0c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#1c150c';
    ctx.fill();
    ctx.restore();

    // 7. Beveled Glass Convex Glint Highlight
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.clip();

    const glint = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    glint.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
    glint.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
    glint.addColorStop(0.6, 'rgba(255, 255, 255, 0.0)');
    glint.addColorStop(1.0, 'rgba(255, 255, 255, 0.25)');
    ctx.fillStyle = glint;
    ctx.fill();
    ctx.restore();
  }
}


// --- js/systems/createStage.js ---
/**
 * CREATE Stage — WHY BOTHER?
 * Inspired by Alice in Wonderland fantasy surrealism & Omniharmonic generative art.
 * Palette: Rich purples & violets, warm golden yellows, deep & sky blues, turquoises,
 * lavenders, and rose accents.
 * Autonomous multi-agent organic system influenced by cursor forces (deflection, vortex wells, flick branchings).
 * Features gradual acceleration after ~15s and Contemplate mode to stabilize the work.
 */




class CreateStage {
  constructor() {
    this.isActive = false;
    this.isContemplating = false;
    this.time = 0;
    this.width = 0;
    this.height = 0;
    this.emergenceAlpha = 0; // Gradually emerges from darkness (0 -> 1)

    // Gradual acceleration state (15s timer)
    this.timeInCreate = 0;
    this.speedBoost = 1.0;

    // Persistent canvas buffer for accumulated generative artwork
    this.offscreenCanvas = document.createElement('canvas');
    this.offCtx = this.offscreenCanvas.getContext('2d');

    // Rich Wonderland Surrealist Palette (harmonious, expressive, strictly non-neon)
    this.palette = [
      { r: 124, g: 38,  b: 168 }, // Violeta profundo
      { r: 168, g: 72,  b: 220 }, // Púrpura vibrante
      { r: 242, g: 182, b: 42  }, // Amarillo cálido / dorado
      { r: 255, g: 216, b: 82  }, // Oro brillante suave
      { r: 28,  g: 88,  b: 195 }, // Azul intenso
      { r: 110, g: 188, b: 245 }, // Azul cielo / celeste
      { r: 24,  g: 195, b: 182 }, // Turquesa vivo
      { r: 186, g: 166, b: 228 }, // Lavanda suave
      { r: 232, g: 112, b: 156 }, // Rosa frambuesa
      { r: 48,  g: 22,  b: 72  }  // Acento ciruela oscuro
    ];

    // Low-res pigment simulation & spatial coverage map
    this.colorGrid = new ColorGrid(80, 60);

    // Multi-class creative agent population
    this.agents = [];
    this.maxAgents = 46;

    // Dynamic wandering focal centers (Omniharmonic dynamic foci)
    this.foci = [
      { x: 0, y: 0, strength: 0.85, angle: 0, speed: 0.20 },
      { x: 0, y: 0, strength: -0.80, angle: Math.PI * 0.65, speed: 0.16 },
      { x: 0, y: 0, strength: 0.72, angle: Math.PI * 1.35, speed: 0.22 },
      { x: 0, y: 0, strength: -0.68, angle: Math.PI * 1.80, speed: 0.15 }
    ];

    // Cursor influence state
    this.cursor = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      vx: 0,
      vy: 0,
      speed: 0,
      isDown: false,
      holdTime: 0,
      active: false
    };

    // Relaxation of previous central rabbit hole constraints (0 -> 1)
    this.freedomBlend = 0;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.colorGrid.resize(width, height);
    this.colorGrid.reset();

    // Deep luminous dark background
    this.offCtx.fillStyle = '#0a0812';
    this.offCtx.fillRect(0, 0, width, height);

    this.cursor.x = width / 2;
    this.cursor.y = height / 2;
    this.cursor.prevX = width / 2;
    this.cursor.prevY = height / 2;
    this.cursor.isDown = false;
    this.cursor.active = false;
    this.cursor.holdTime = 0;

    // Reset 15s acceleration timer fresh on entry
    this.timeInCreate = 0;
    this.speedBoost = 1.0;

    // Distribute wandering foci across the canvas
    this.foci.forEach((f, idx) => {
      const angle = (idx / this.foci.length) * Math.PI * 2;
      const r = Math.min(width, height) * (0.24 + (idx % 2) * 0.14);
      f.x = width / 2 + Math.cos(angle) * r;
      f.y = height / 2 + Math.sin(angle) * r;
    });

    this.agents = [];
    for (let i = 0; i < 22; i++) {
      this.spawnAgent();
    }

    this.isActive = true;
    this.isContemplating = false;
    this.freedomBlend = 0;
    this.emergenceAlpha = 0;
    this.time = 0;
  }

  resize(width, height) {
    if (this.width !== width || this.height !== height) {
      const temp = document.createElement('canvas');
      temp.width = this.width;
      temp.height = this.height;
      const tCtx = temp.getContext('2d');
      if (this.width > 0 && this.height > 0) {
        tCtx.drawImage(this.offscreenCanvas, 0, 0);
      }

      this.width = width;
      this.height = height;
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
      this.colorGrid.resize(width, height);

      if (temp.width > 0 && temp.height > 0) {
        this.offCtx.drawImage(temp, 0, 0, width, height);
      }
    }
  }

  setCursor(x, y, isDown = false) {
    if (this.isContemplating) return; // Cursor interaction disabled when contemplating

    this.cursor.prevX = this.cursor.x;
    this.cursor.prevY = this.cursor.y;
    this.cursor.x = x;
    this.cursor.y = y;

    const dx = x - this.cursor.prevX;
    const dy = y - this.cursor.prevY;
    this.cursor.vx = dx;
    this.cursor.vy = dy;
    this.cursor.speed = Math.hypot(dx, dy);

    this.cursor.isDown = isDown;
    this.cursor.active = true;
  }

  spawnAgent(atX = null, atY = null, inheritAngle = null) {
    let x, y, angle;

    if (atX !== null && atY !== null) {
      x = atX;
      y = atY;
      angle = inheritAngle !== null ? inheritAngle + (Math.random() - 0.5) * 0.85 : Math.random() * Math.PI * 2;
    } else {
      if (Math.random() > 0.45 && this.foci.length > 0) {
        const focus = this.foci[Math.floor(Math.random() * this.foci.length)];
        const r = 25 + Math.random() * 95;
        const a = Math.random() * Math.PI * 2;
        x = focus.x + Math.cos(a) * r;
        y = focus.y + Math.sin(a) * r;
      } else {
        // Broad canvas distribution reaching all edges
        x = Math.random() * this.width;
        y = Math.random() * this.height;
      }
      angle = Math.random() * Math.PI * 2;
    }

    const col = this.palette[Math.floor(Math.random() * this.palette.length)];

    // Diverse agent forms (Omniharmonic varied strokes)
    const role = Math.random();
    let thickness, opacity, maxLife, speed;

    if (role < 0.28) {
      // Broad gestural watercolor wash
      thickness = 18 + Math.random() * 26;
      opacity = 0.22 + Math.random() * 0.25;
      maxLife = 6.0 + Math.random() * 4.0;
      speed = 36 + Math.random() * 32;
    } else if (role < 0.65) {
      // Medium organic ribbon
      thickness = 8 + Math.random() * 12;
      opacity = 0.32 + Math.random() * 0.35;
      maxLife = 7.0 + Math.random() * 5.0;
      speed = 50 + Math.random() * 42;
    } else {
      // Fine sinuous filigree
      thickness = 2.2 + Math.random() * 4.5;
      opacity = 0.55 + Math.random() * 0.35;
      maxLife = 8.5 + Math.random() * 5.5;
      speed = 64 + Math.random() * 50;
    }

    this.agents.push(new BrushAgent({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      maxSteerForce: 4.2,
      thickness,
      opacity,
      color: col,
      maxLife,
      numPasses: thickness > 15 ? 4 : (thickness > 6 ? 3 : 2),
      bristleSpread: 0.44,
      isWet: true,
      isGothic: false
    }));
  }

  /**
   * Spawns an organic child bifurcation / ramification from a parent stroke
   */
  spawnChildBranch(parentAgent, angleOffset = null) {
    if (this.agents.length >= this.maxAgents + 20) return;

    const parentAngle = Math.atan2(parentAgent.vy, parentAgent.vx);
    const sign = angleOffset !== null ? Math.sign(angleOffset) : (Math.random() < 0.5 ? -1 : 1);
    const offset = angleOffset !== null ? angleOffset : sign * (0.60 + Math.random() * 0.40);
    const branchAngle = parentAngle + offset;

    const childThickness = Math.max(1.6, parentAgent.thickness * 0.60);
    const childSpeed = parentAgent.speed * (1.08 + Math.random() * 0.22);
    const childColor = Math.random() > 0.35
      ? parentAgent.currentColor
      : this.palette[Math.floor(Math.random() * this.palette.length)];

    const child = new BrushAgent({
      x: parentAgent.x,
      y: parentAgent.y,
      vx: Math.cos(branchAngle) * childSpeed,
      vy: Math.sin(branchAngle) * childSpeed,
      speed: childSpeed,
      maxSteerForce: 4.6,
      thickness: childThickness,
      opacity: Math.min(0.85, parentAgent.opacity * 1.15),
      color: childColor,
      maxLife: 5.0 + Math.random() * 4.0,
      numPasses: childThickness > 8 ? 3 : 2,
      bristleSpread: 0.35,
      isWet: true,
      isGothic: false
    });
    child.isBranch = true;
    this.agents.push(child);
  }

  getFlowForce(x, y, time) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    let fx = 0, fy = 0;

    // 1. Weakened remnant of central vortex during transition, relaxing to zero
    if (this.freedomBlend < 0.95) {
      const dxCenter = x - cx;
      const dyCenter = y - cy;
      const distCenter = Math.hypot(dxCenter, dyCenter) + 0.001;
      const centerWeight = Math.max(0.0, 0.45 * (1.0 - this.freedomBlend));
      fx += (-dyCenter / distCenter) * centerWeight * 0.35 + (dxCenter / distCenter) * centerWeight * 0.2;
      fy += (dxCenter / distCenter) * centerWeight * 0.35 + (dyCenter / distCenter) * centerWeight * 0.2;
    }

    // 2. Dynamic wandering foci (Omniharmonic organic centers)
    for (const f of this.foci) {
      const fdx = x - f.x;
      const fdy = y - f.y;
      const fDist = Math.hypot(fdx, fdy) + 1.0;
      if (fDist < 420) {
        const falloff = Math.cos((fDist / 420) * (Math.PI / 2));
        const rotX = -fdy / fDist;
        const rotY = fdx / fDist;
        fx += rotX * f.strength * falloff * 0.72;
        fy += rotY * f.strength * falloff * 0.72;
      }
    }

    // 3. Multi-frequency Simplex Curl Noise
    const nScale = 0.0022;
    const curl = noise.curl2D(x * nScale, y * nScale + time * 0.04);
    fx += curl.x * 0.92;
    fy += curl.y * 0.92;

    // 4. Cursor Influence: Deflection, Vortex Well, Flick Impulse
    if (!this.isContemplating && this.cursor.active) {
      const cdx = x - this.cursor.x;
      const cdy = y - this.cursor.y;
      const cDist = Math.hypot(cdx, cdy) + 0.01;
      const influenceRadius = this.cursor.isDown ? 280 : 175;

      if (cDist < influenceRadius) {
        const cFactor = 1.0 - cDist / influenceRadius;
        const smoothFactor = cFactor * cFactor;

        if (this.cursor.isDown) {
          // Click & hold: localized rotating vortex & pigment well
          const cRotX = -cdy / cDist;
          const cRotY = cdx / cDist;
          const cPullX = -cdx / cDist;
          const cPullY = -cdy / cDist;
          fx += (cRotX * 2.2 + cPullX * 0.85) * smoothFactor * (1.0 + this.cursor.holdTime * 1.8);
          fy += (cRotY * 2.2 + cPullY * 0.85) * smoothFactor * (1.0 + this.cursor.holdTime * 1.8);
        } else if (this.cursor.speed > 7.0) {
          // Rapid drag / flick: intense directional impulse
          const normSpeed = Math.min(2.8, this.cursor.speed / 14.0);
          fx += (this.cursor.vx / this.cursor.speed) * normSpeed * smoothFactor * 2.4;
          fy += (this.cursor.vy / this.cursor.speed) * normSpeed * smoothFactor * 2.4;
        } else {
          // Gentle hover deflection / orbital steering
          const cRotX = -cdy / cDist;
          const cRotY = cdx / cDist;
          fx += cRotX * smoothFactor * 0.95;
          fy += cRotY * smoothFactor * 0.95;
        }
      }
    }

    const fMag = Math.hypot(fx, fy) || 0.001;
    return {
      x: fx / fMag,
      y: fy / fMag
    };
  }

  contemplate() {
    this.isContemplating = true;
    this.cursor.active = false;
    this.cursor.isDown = false;
  }

  resume() {
    this.isContemplating = false;
  }

  update(dt, speedMult = 1.0) {
    if (!this.isActive) return;

    // Track active time in CREATE stage
    this.timeInCreate += dt;

    // Gradual acceleration after ~15 seconds: gently ramps up to 1.35x
    if (this.timeInCreate >= 15.0) {
      this.speedBoost += (1.35 - this.speedBoost) * Math.min(1.0, dt * 0.35);
    }

    const currentSpeedMult = speedMult * this.speedBoost;
    this.time += dt * currentSpeedMult;
    const offCtx = this.offCtx;

    // Gradual emergence from darkness into visibility
    if (this.emergenceAlpha < 1.0) {
      this.emergenceAlpha = Math.min(1.0, this.emergenceAlpha + dt * 0.45);
    }

    // Smoothly relax centralized rabbit hole pull (freedom blend 0 -> 1)
    if (this.freedomBlend < 1.0) {
      this.freedomBlend = Math.min(1.0, this.freedomBlend + dt * 0.14);
    }

    // Cursor hold duration tracking
    if (!this.isContemplating && this.cursor.isDown) {
      this.cursor.holdTime += dt;
      // Deposit localized rich pigment bloom around cursor
      if (Math.random() > 0.35) {
        const rad = 20 + Math.random() * 45;
        const col = this.palette[Math.floor(Math.random() * this.palette.length)];
        const grad = offCtx.createRadialGradient(this.cursor.x, this.cursor.y, 0, this.cursor.x, this.cursor.y, rad);
        grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0.16)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        offCtx.fillStyle = grad;
        offCtx.beginPath();
        offCtx.arc(this.cursor.x, this.cursor.y, rad, 0, Math.PI * 2);
        offCtx.fill();
      }
    } else {
      this.cursor.holdTime = 0;
    }

    // Dampen cursor velocity
    this.cursor.vx *= 0.85;
    this.cursor.vy *= 0.85;
    this.cursor.speed *= 0.85;

    // Update wandering foci with smooth Lissajous & Simplex motion
    this.foci.forEach((f, idx) => {
      f.angle += f.speed * dt * currentSpeedMult;
      const baseR = Math.min(this.width, this.height) * (0.24 + (idx % 2) * 0.14);
      const wanderX = noise.noise2D(idx * 15 + this.time * 0.07, idx * 8) * 110;
      const wanderY = noise.noise2D(idx * 8, idx * 15 + this.time * 0.07) * 110;
      f.x = this.width / 2 + Math.cos(f.angle) * baseR + wanderX;
      f.y = this.height / 2 + Math.sin(f.angle) * baseR + wanderY;
    });

    // In normal mode: continuously replenish agent population
    // In contemplation mode: stop replenishing agents so composition stabilizes
    if (!this.isContemplating) {
      while (this.agents.length < this.maxAgents) {
        this.spawnAgent();
      }
    }

    // FlowField adapter for BrushAgent
    const adapterFlow = {
      getForce: (x, y) => this.getFlowForce(x, y, this.time)
    };

    // Update and draw agents
    for (let i = this.agents.length - 1; i >= 0; i--) {
      const agent = this.agents[i];
      agent.update(dt, adapterFlow, this.colorGrid, this.width / 2, this.height / 2, this.time, currentSpeedMult);
      agent.drawSegment(offCtx);

      // 1. Interactive cursor branching (drag / flick / down-brush influence)
      if (!this.isContemplating && this.cursor.active) {
        const distToCursor = Math.hypot(agent.x - this.cursor.x, agent.y - this.cursor.y);
        const isNearCursor = distToCursor < (this.cursor.isDown ? 220 : 160);

        if (isNearCursor) {
          const isFlicking = this.cursor.speed > 2.0;
          const isDrawing = this.cursor.isDown && this.cursor.speed > 0.5;
          const branchChance = isFlicking ? 0.35 : (isDrawing ? 0.22 : 0.08);

          if (Math.random() < branchChance) {
            this.spawnChildBranch(agent);
          }
        }
      }

      // 2. Autonomous organic bifurcation along curved mature strokes
      if (!agent.isBranch && !agent.hasBifurcated && agent.age > 1.2 && agent.thickness > 4.0) {
        if (Math.random() < 0.035) {
          agent.hasBifurcated = true;
          this.spawnChildBranch(agent);
        }
      }

      const isOutOfBounds = agent.x < -80 || agent.x > this.width + 80 || agent.y < -80 || agent.y > this.height + 80;
      if (agent.isDead || isOutOfBounds) {
        this.agents.splice(i, 1);
      }
    }

    // Gentle pigment diffusion
    this.colorGrid.diffuse(0.018 * dt * currentSpeedMult);
  }

  render(ctx) {
    if (!this.isActive) return;

    ctx.save();
    ctx.globalAlpha = this.emergenceAlpha;
    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Interactive cursor aura (only when active and not contemplating)
    if (!this.isContemplating && this.cursor.active) {
      const radius = this.cursor.isDown ? 42 + Math.sin(this.time * 6) * 6 : 24;
      ctx.beginPath();
      ctx.arc(this.cursor.x, this.cursor.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.cursor.isDown ? 'rgba(255, 215, 85, 0.55)' : 'rgba(168, 75, 215, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }
}


// --- js/transitionManager.js ---
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

const States = {
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

class TransitionManager {
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


// --- js/main.js ---
/**
 * WHY BOTHER? — GENERATIVE RABBIT HOLE & CREATE
 * Main Orchestrator & Entry Point
 */









// DOM Elements
const canvas = document.getElementById('tunnel-canvas');
const ctx = canvas.getContext('2d');
const watchCanvas = document.getElementById('pocket-watch-canvas');
const watchContainer = document.getElementById('watch-container');
const watchHintEl = document.getElementById('watch-hint');
const mainUi = document.getElementById('main-ui');

// Narrative Book Opening DOM Elements
const narrativeOverlay = document.getElementById('narrative-overlay');
const openingBookContainer = document.getElementById('opening-book-container');
const bookTextBody = document.getElementById('book-text-body');
const narrativeContinueHint = document.getElementById('narrative-continue-hint');

// Cinematic Phrase-by-Phrase Transition Screen
const cinematicOverlay = document.getElementById('cinematic-overlay');
const cinematicPhraseText = document.getElementById('cinematic-phrase-text');

// Create Stage Controls
const createControlsPanel = document.getElementById('create-controls-panel');
const btnContemplate = document.getElementById('btn-contemplate');

// Final Reflection (Over the living artwork)
const finalReflectionOverlay = document.getElementById('final-reflection-overlay');
const finalPhraseElement = document.getElementById('final-phrase-element');
const finalControls = document.getElementById('final-controls');
const btnResumeCreating = document.getElementById('btn-resume-creating');
const btnRestartExperience = document.getElementById('btn-restart-experience');

// Canvas dimensions and vanishing point
let width = window.innerWidth;
let height = window.innerHeight;
let cx = width / 2;
let cy = height / 2;
let mouseTargetX = 0;
let mouseTargetY = 0;

// Subsystem instances
const lightWaves = new LightWaveSystem();
const bookTunnel = new BookTunnel();
const movieTunnel = new MovieTunnel();
const gameTunnel = new GameTunnel();
const alice = new AliceController();
const createStage = new CreateStage();

let pocketWatch;
let transitionManager;

// Primary Audio Player: Assets/Alice in Wonderland.mp3
class ExperienceAudio {
  constructor() {
    this.bgMusic = new Audio('assets/Alice in Wonderland.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.38; // Elegant, atmospheric, non-invasive volume
    this.isStarted = false;
  }

  start() {
    if (this.isStarted) return;
    const playPromise = this.bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isStarted = true;
      }).catch(() => {
        // Autoplay policy: will trigger on next user click or keypress
      });
    }
  }

  triggerTransitionWhoosh() {
    // Subtle volume dip & swell during era shift to reinforce passage through time
    if (!this.isStarted) return;
    try {
      const origVol = this.bgMusic.volume;
      this.bgMusic.volume = Math.max(0.15, origVol * 0.7);
      setTimeout(() => {
        this.bgMusic.volume = origVol;
      }, 1200);
    } catch (e) {
      // Ignore audio volume glitches
    }
  }

  setEra(era) {
    // Music plays continuously across eras and CREATE without resetting
  }

  init() {
    this.start();
  }
}

const audio = new ExperienceAudio();

// ==========================================================================
// CINEMATIC SENTENCE-BY-SENTENCE DEFINITIONS
// ==========================================================================
const CINEMATIC_PHRASES = {
  // Transición hacia Disney: 1951
  1: [
    "Ochenta y seis años habían pasado desde que aquella historia fuera escrita.",
    "El mundo había cambiado, y las historias comenzaban a encontrar nuevas maneras de existir.",
    "Ya no vivían solamente entre las páginas de un libro.",
    "Ahora podían cobrar vida a través de ilustraciones en movimiento, colores que parecían salirse del papel y melodías que acompañaban cada aventura.",
    "En una de aquellas versiones, otra pequeña Alicia cantaba entre flores que hablaban, mientras se despedía de su gata Diana antes de seguir al conejo.",
    "El mundo que antes había sido imaginado con palabras ahora podía verse, escucharse y moverse ante nuestros ojos.",
    "Pero la curiosidad seguía siendo la misma.",
    "Y, sin embargo, un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
  ],

  // Transición hacia el Videojuego: 2011
  2: [
    "Sesenta años más tarde, el mundo de Alicia era muy diferente.",
    "Las historias ya no se limitaban a ser leídas o contempladas.",
    "Ahora podían recorrerse, explorarse e incluso alterarse.",
    "Aquello que antes exigía miles y miles de dibujos podía tomar forma mediante herramientas digitales, y los mundos imaginados podían convertirse en lugares que cualquiera podía habitar.",
    "Pero no todos los Países de las Maravillas conservaban la inocencia de aquel primero.",
    "En una nueva historia, Alicia Liddell regresaba a un mundo deformado por sus propios recuerdos.",
    "Los colores se habían vuelto más sombríos, los caminos más inquietantes y los personajes, mucho menos familiares.",
    "Ya no bastaba con observar cómo se desarrollaba la aventura.",
    "Esta vez, había que atravesarla.",
    "Y aunque el mundo al otro lado fuera irreconocible, algo permanecía intacto.",
    "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
  ],

  // Transición hacia CREATE
  3: [
    "Más de cien años habían pasado.",
    "Cientos de Alicias habían existido desde entonces.",
    "Algunas habían sido dibujadas, otras pintadas, animadas, actuadas, reconstruidas y transformadas.",
    "Cada una había encontrado su propia forma de caer, y cada una había llevado consigo algo de quien la imaginó.",
    "Las herramientas habían cambiado.",
    "Las posibilidades parecían no tener fin.",
    "Ahora, bastaba una instrucción para obtener imágenes de mundos que antes habrían requerido incontables horas de trabajo.",
    "Y entonces...",
    "¿qué quedaba por imaginar?"
  ]
};

// Final Reflection Sentences (Presented one by one over the living artwork)
const FINAL_REFLECTION_SEQUENCE = [
  { text: "WHY BOTHER?", type: "title-phrase" },
  { text: "¿Por qué molestarse?", type: "subtitle-phrase" },
  { text: "Porque crear nunca ha consistido únicamente en producir algo.", type: "normal" },
  { text: "Ha consistido en imaginar lo que todavía no existe, en explorar caminos que no siempre llevan a donde esperábamos y en encontrar algo propio entre todas las posibilidades.", type: "normal" },
  { text: "Porque ninguna herramienta puede decidir por nosotros qué nos conmueve, qué despierta nuestra curiosidad o qué queremos expresar.", type: "normal" },
  { text: "Las herramientas pueden cambiar, multiplicarse e incluso hacer posible lo que antes parecía inalcanzable.", type: "normal" },
  { text: "Pero siempre habrá tantas maneras de imaginar como personas dispuestas a hacerlo.", type: "normal" },
  { text: "Y porque, después de tantos años, de tantas historias y de tantas formas de contarla, Alicia siempre encontrará una madriguera en la que meterse.", type: "closing-phrase" }
];

// ==========================================================================
// BOOK OPENING TYPEWRITER
// ==========================================================================
class BookTypewriter {
  constructor() {
    this.isTyping = false;
    this.isComplete = false;
    this.typeInterval = null;
    this.paragraphs = [
      "Pero cuando el conejo se sacó un reloj de bolsillo del chaleco, lo miró y echó a correr, Alicia se levantó de un salto, porque comprendió de golpe que ella nunca había visto un conejo con chaleco, ni con reloj que sacarse de él, y, ardiendo de curiosidad, se puso a correr tras el conejo por la pradera, y llegó justo a tiempo para ver cómo se precipitaba en una madriguera que se abría al pie del seto.",
      "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
    ];
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.isComplete = false;
    this.isTyping = true;
    narrativeContinueHint.classList.remove('visible');
    bookTextBody.innerHTML = '';

    const tokens = [];
    this.paragraphs.forEach((pText, pIdx) => {
      const words = pText.split(/\s+/);
      words.forEach((w) => {
        tokens.push({ text: w + ' ', pIdx });
      });
      if (pIdx < this.paragraphs.length - 1) {
        tokens.push({ text: '\n\n', pIdx });
      }
    });

    let currentTokenIndex = 0;
    let currentParagraphIndex = -1;
    let currentPElement = null;

    this.fullHtml = this.paragraphs.map(p => `<p>${p}</p>`).join('');

    this.typeInterval = setInterval(() => {
      if (currentTokenIndex >= tokens.length) {
        this.finish();
        return;
      }

      const tok = tokens[currentTokenIndex];
      currentTokenIndex++;

      if (tok.pIdx !== currentParagraphIndex) {
        currentParagraphIndex = tok.pIdx;
        currentPElement = document.createElement('p');
        bookTextBody.appendChild(currentPElement);
      }

      if (tok.text !== '\n\n') {
        currentPElement.textContent += tok.text;
      }
    }, 40);
  }

  fastForward() {
    if (!this.isTyping) return;
    clearInterval(this.typeInterval);
    bookTextBody.innerHTML = this.fullHtml;
    this.finish();
  }

  finish() {
    clearInterval(this.typeInterval);
    this.isTyping = false;
    this.isComplete = true;
    narrativeContinueHint.classList.add('visible');
    if (this.onComplete) {
      this.onComplete();
    }
  }
}

const bookTypewriter = new BookTypewriter();

// ==========================================================================
// CINEMATIC PHRASE-BY-PHRASE CONTROLLER (DISNEY, GAME, CREATE)
// ==========================================================================
class CinematicPhrasePresenter {
  constructor() {
    this.isActive = false;
    this.phrases = [];
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.onAllFinished = null;
  }

  start(phrasesList, onAllFinished) {
    this.phrases = phrasesList;
    this.currentIndex = 0;
    this.onAllFinished = onAllFinished;
    this.isActive = true;
    this.isTransitioning = false;

    cinematicOverlay.style.display = 'flex';
    cinematicOverlay.style.opacity = '1';
    this.showCurrentPhrase();
  }

  showCurrentPhrase() {
    if (this.currentIndex >= this.phrases.length) {
      this.finish();
      return;
    }

    const text = this.phrases[this.currentIndex];
    cinematicPhraseText.classList.remove('visible');

    setTimeout(() => {
      cinematicPhraseText.textContent = text;
      cinematicPhraseText.classList.add('visible');
      this.isTransitioning = false;
    }, 280);
  }

  advance() {
    if (!this.isActive || this.isTransitioning) return;
    this.isTransitioning = true;

    cinematicPhraseText.classList.remove('visible');

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.phrases.length) {
        this.finish();
      } else {
        this.showCurrentPhrase();
      }
    }, 320);
  }

  finish() {
    this.isActive = false;
    cinematicOverlay.style.opacity = '0';
    setTimeout(() => {
      cinematicOverlay.style.display = 'none';
      if (this.onAllFinished) {
        this.onAllFinished();
      }
    }, 500);
  }
}

const cinematicPresenter = new CinematicPhrasePresenter();

// ==========================================================================
// FINAL LIVING REFLECTION CONTROLLER (OVER THE ACTIVE ARTWORK)
// ==========================================================================
class FinalReflectionPresenter {
  constructor() {
    this.isActive = false;
    this.currentIndex = 0;
    this.isTransitioning = false;
  }

  start() {
    this.isActive = true;
    this.currentIndex = 0;
    this.isTransitioning = false;

    finalReflectionOverlay.style.display = 'flex';
    finalControls.style.display = 'none';

    const cheshire = document.getElementById('cheshire-cat-container');
    if (cheshire) {
      cheshire.classList.remove('visible');
      cheshire.style.display = 'none';
    }

    this.showCurrentPhrase();
  }

  showCurrentPhrase() {
    if (this.currentIndex >= FINAL_REFLECTION_SEQUENCE.length) {
      this.finish();
      return;
    }

    const item = FINAL_REFLECTION_SEQUENCE[this.currentIndex];
    finalPhraseElement.classList.remove('visible');

    setTimeout(() => {
      finalPhraseElement.className = 'final-phrase-badge ' + (item.type || '');
      finalPhraseElement.textContent = item.text;
      finalPhraseElement.classList.add('visible');
      this.isTransitioning = false;
    }, 280);
  }

  advance() {
    if (!this.isActive || this.isTransitioning) return;

    if (this.currentIndex >= FINAL_REFLECTION_SEQUENCE.length - 1) {
      // Last phrase already shown, finish and show Cheshire cat & controls
      this.finish();
      return;
    }

    this.isTransitioning = true;
    finalPhraseElement.classList.remove('visible');

    setTimeout(() => {
      this.currentIndex++;
      this.showCurrentPhrase();
    }, 320);
  }

  finish() {
    this.isActive = false;
    finalPhraseElement.classList.remove('visible');

    // Reveal Cheshire Cat in the center over the living artwork
    const cheshire = document.getElementById('cheshire-cat-container');
    if (cheshire) {
      cheshire.style.display = 'flex';
      setTimeout(() => {
        cheshire.classList.add('visible');
      }, 80);
    }

    // Display action controls below
    setTimeout(() => {
      finalControls.style.display = 'flex';
    }, 350);
  }

  hide() {
    this.isActive = false;
    finalReflectionOverlay.style.display = 'none';
    finalPhraseElement.classList.remove('visible');

    const cheshire = document.getElementById('cheshire-cat-container');
    if (cheshire) {
      cheshire.classList.remove('visible');
      cheshire.style.display = 'none';
    }

    finalControls.style.display = 'none';
  }
}

const finalReflectionPresenter = new FinalReflectionPresenter();

// ==========================================================================
// NARRATIVE DISPATCHER
// ==========================================================================
function startOpeningBook() {
  narrativeOverlay.classList.remove('hidden');
  narrativeOverlay.style.display = 'flex';
  cinematicOverlay.style.display = 'none';
  mainUi.style.display = 'none';
  createControlsPanel.style.display = 'none';
  finalReflectionOverlay.style.display = 'none';

  bookTypewriter.start(() => {});
}

function startCinematicEraTransition(eraIndex) {
  narrativeOverlay.classList.add('hidden');
  narrativeOverlay.style.display = 'none';
  mainUi.style.display = 'none';
  createControlsPanel.style.display = 'none';
  finalReflectionOverlay.style.display = 'none';

  cinematicPresenter.start(CINEMATIC_PHRASES[eraIndex], () => {
    transitionManager.onNarrativeFinished();
  });
}

// User action handler for Book Opening
function handleBookOpeningAction() {
  audio.init();

  if (bookTypewriter.isTyping) {
    bookTypewriter.fastForward();
    return;
  }

  if (bookTypewriter.isComplete) {
    narrativeOverlay.classList.add('hidden');
    setTimeout(() => {
      narrativeOverlay.style.display = 'none';
      transitionManager.onNarrativeFinished();
    }, 600);
  }
}

// ==========================================================================
// SUBSYSTEM INITIALIZATION & TRANSITION MANAGER
// ==========================================================================
pocketWatch = new PocketWatch(watchCanvas, (direction) => {
  audio.triggerTransitionWhoosh();
  transitionManager.triggerWatchTransition(direction);
});

transitionManager = new TransitionManager(
  alice,
  bookTunnel,
  movieTunnel,
  gameTunnel,
  createStage,
  lightWaves,
  pocketWatch,
  {
    onStateChanged: (state, activeEra) => {
      audio.setEra(activeEra);

      if (state === States.OPENING_BOOK) {
        startOpeningBook();
      } else if (state === States.TEXT_1_DISNEY) {
        startCinematicEraTransition(1);
      } else if (state === States.TEXT_2_GAME) {
        startCinematicEraTransition(2);
      } else if (state === States.TEXT_3_CREATE) {
        startCinematicEraTransition(3);
      }
    },
    onShowWatch: (era) => {
      mainUi.style.display = 'flex';
      watchContainer.classList.add('visible');
      if (era === 0) {
        watchHintEl.textContent = 'Gira el reloj para avanzar';
      } else if (era === 1) {
        watchHintEl.textContent = 'Gira el reloj para viajar';
      } else if (era === 2) {
        watchHintEl.textContent = 'Gira el reloj para avanzar';
      } else if (era === 3) {
        watchHintEl.textContent = 'Gira en sentido contrario para volver';
      }
    },
    onHideWatch: () => {
      watchContainer.classList.remove('visible');
    },
    onEnterCreate: () => {
      mainUi.style.display = 'flex';
      createControlsPanel.style.display = 'flex';
      watchContainer.classList.add('visible');
      watchHintEl.textContent = 'Gira en sentido contrario para volver';
    },
    onContemplate: () => {
      createControlsPanel.style.display = 'none';
      watchContainer.classList.remove('visible');
      finalReflectionPresenter.start();
    },
    onResumeCreate: () => {
      finalReflectionPresenter.hide();
      createControlsPanel.style.display = 'flex';
      watchContainer.classList.add('visible');
    }
  }
);

// Contemplate Button Click
btnContemplate.addEventListener('click', (e) => {
  e.stopPropagation();
  transitionManager.triggerContemplate();
});

// Resume Creating Button Click
btnResumeCreating.addEventListener('click', (e) => {
  e.stopPropagation();
  transitionManager.resumeCreating();
});

// Restart Experience
btnRestartExperience.addEventListener('click', (e) => {
  e.stopPropagation();
  finalReflectionPresenter.hide();
  createControlsPanel.style.display = 'none';
  watchContainer.classList.remove('visible');
  transitionManager.setState(States.OPENING_BOOK);
});

// Window resize handling
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  cx = width / 2;
  cy = height / 2;

  bookTunnel.resize(width, height);
  movieTunnel.resize(width, height);
  gameTunnel.resize(width, height);
  createStage.resize(width, height);
}

window.addEventListener('resize', handleResize);
handleResize();

// ==========================================================================
// INPUT HANDLING: KEYBOARD & CLICKS
// ==========================================================================
let lastKeySpaceTime = 0;

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    const now = performance.now();
    // Guard against rapid key repeat
    if (now - lastKeySpaceTime < 280) return;
    lastKeySpaceTime = now;

    if (cinematicPresenter.isActive) {
      cinematicPresenter.advance();
    } else if (finalReflectionPresenter.isActive) {
      finalReflectionPresenter.advance();
    } else if (!narrativeOverlay.classList.contains('hidden') && narrativeOverlay.style.display !== 'none') {
      handleBookOpeningAction();
    }
  }
});

// Click on Book Opening
narrativeOverlay.addEventListener('click', () => {
  handleBookOpeningAction();
});

// Click on Cinematic Phrase Screen
cinematicOverlay.addEventListener('click', () => {
  audio.init();
  if (cinematicPresenter.isActive) {
    cinematicPresenter.advance();
  }
});

// Click on Final Reflection Screen
finalReflectionOverlay.addEventListener('click', (e) => {
  if (e.target.closest('#final-controls')) return;
  if (finalReflectionPresenter.isActive) {
    finalReflectionPresenter.advance();
  }
});

// Mouse & Touch interaction for CREATE Stage & Alice parallax
let isMouseDown = false;

window.addEventListener('mousedown', (e) => {
  audio.init();
  if (e.target.closest('#watch-container') || e.target.closest('#create-controls-panel') || e.target.closest('#final-reflection-overlay')) {
    return;
  }
  isMouseDown = true;
  if (transitionManager.state === States.CREATE_ACTIVE) {
    createStage.setCursor(e.clientX, e.clientY, true);
  }
});

window.addEventListener('mousemove', (e) => {
  const nx = (e.clientX - width / 2) / (width / 2);
  const ny = (e.clientY - height / 2) / (height / 2);
  mouseTargetX = nx;
  mouseTargetY = ny;
  alice.setMouse(nx, ny);

  if (transitionManager.state === States.CREATE_ACTIVE) {
    createStage.setCursor(e.clientX, e.clientY, isMouseDown);
  }
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
  if (transitionManager.state === States.CREATE_ACTIVE) {
    createStage.cursor.isDown = false;
  }
});

// Touch events for mobile
window.addEventListener('touchstart', (e) => {
  audio.init();
  if (e.touches && e.touches.length > 0) {
    const t = e.touches[0];
    if (transitionManager.state === States.CREATE_ACTIVE) {
      createStage.setCursor(t.clientX, t.clientY, true);
    }
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length > 0) {
    const t = e.touches[0];
    if (transitionManager.state === States.CREATE_ACTIVE) {
      createStage.setCursor(t.clientX, t.clientY, true);
    }
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  if (transitionManager.state === States.CREATE_ACTIVE) {
    createStage.cursor.isDown = false;
  }
});

// ==========================================================================
// MAIN ANIMATION LOOP
// ==========================================================================
let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const dt = Math.min(0.08, (currentTime - lastTime) / 1000);
  lastTime = currentTime;

  ctx.clearRect(0, 0, width, height);

  // Update Transition Manager
  transitionManager.update(dt);
  const speedMult = transitionManager.tunnelSpeedMultiplier;

  // Smooth vanishing point parallax
  const targetCx = width / 2 + mouseTargetX * 22;
  const targetCy = height / 2 + mouseTargetY * 16;
  cx += (targetCx - cx) * Math.min(1.0, dt * 3);
  cy += (targetCy - cy) * Math.min(1.0, dt * 3);

  // Update light waves & tunnels
  lightWaves.update(dt, transitionManager.activeEra, speedMult);
  bookTunnel.update(dt, speedMult);
  movieTunnel.update(dt, speedMult);
  gameTunnel.update(dt, speedMult);
  createStage.update(dt, speedMult);

  // Update Alice
  alice.update(dt, speedMult);

  // 1. Render active generative rabbit hole tunnel or create stage
  transitionManager.renderTunnels(ctx, width, height, cx, cy);

  // 2. Render radial energy glow waves (during tunnel eras)
  if (transitionManager.activeEra < 3 && transitionManager.state !== States.OPENING_BOOK) {
    lightWaves.renderRadialGlow(ctx, width, height, cx, cy);
  }

  // 3. Render Alice character with 3D depth perspective
  if (transitionManager.activeEra < 3 && transitionManager.state !== States.OPENING_BOOK) {
    alice.render(ctx, width, height, cx, cy);
  }

  // 4. Update and render Pocket Watch
  pocketWatch.update(dt);
  pocketWatch.render();
}

// Start the experience
transitionManager.start();
requestAnimationFrame(animate);


})();
