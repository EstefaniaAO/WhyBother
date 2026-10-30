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
 * Pure Monochromatic Antique Ink on Cut Paper (SOLO BLANCO Y NEGRO).
 * Concentric paper rings, deep cut shadows, hand-drawn ink pen spirals,
 * and typographic literary fragments stamped along organic spiral curves.
 * Expanded to cover full screen from center into every corner with maximum contrast.
 */

class BookTunnel {
  constructor() {
    this.time = 0;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Persistent offscreen canvas buffer
    this.offscreenCanvas = document.createElement('canvas');
    this.offCtx = this.offscreenCanvas.getContext('2d');

    // Spanish literary text fragments from Lewis Carroll
    this.texts = [
      "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir.",
      "Al principio, la madriguera del conejo se extendía en línea recta como un túnel, y después torció bruscamente hacia abajo.",
      "O el pozo era en verdad profundo, o ella caía muy despacio, porque Alicia tuvo tiempo sobrado para mirar a su alrededor.",
      "Primero, intentó mirar hacia abajo y ver a dónde iría a parar, pero estaba todo demasiado oscuro para distinguir nada.",
      "Después miró hacia las paredes del pozo y observó que estaban cubiertas de armarios y estantes para libros.",
      "Cogió un jarro de los estantes. Llevaba una etiqueta: MERMELADA DE NARANJA, pero vio que estaba vacío."
    ];

    // Word collection for stamping
    this.words = [];
    this.texts.forEach(t => {
      this.words.push(...t.split(/\s+/));
    });

    // Active progressive ink pen agents
    this.penAgents = [];
    this.maxPenAgents = 32; // Increased for richer corner-to-corner coverage

    // Concentric paper ring growth queue
    this.paperRings = [];
    this.nextRingTime = 0;
    this.ringInterval = 1.2;

    // Spiral text arms that stream words into the rabbit hole
    this.spiralTextArms = [];
    this.nextSpiralTextTime = 0;

    // Completed paths for subtle light wave traversal
    this.recentPaths = [];
    this.maxRecentPaths = 50;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    // Initial crisp white paper ground
    this.offCtx.fillStyle = '#faf8f5';
    this.offCtx.fillRect(0, 0, width, height);

    // Initial deep center aperture (black hole at center)
    const cx = width / 2;
    const cy = height / 2;
    const coreGrad = this.offCtx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.7, '#0a0a0a');
    coreGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    this.offCtx.fillStyle = coreGrad;
    this.offCtx.beginPath();
    this.offCtx.arc(cx, cy, 38, 0, Math.PI * 2);
    this.offCtx.fill();

    this.penAgents = [];
    this.paperRings = [];
    this.spiralTextArms = [];
    this.recentPaths = [];
    this.time = 0;
    this.nextRingTime = 0.2;
    this.nextSpiralTextTime = 0.4;

    // Spawn initial pen agents near the center
    for (let i = 0; i < 10; i++) {
      this.spawnPenAgent();
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

  spawnPenAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const startR = 8 + Math.random() * 22;

    // Coverage to the farthest corners: 0.78 * hypot(w, h)
    const maxCornerDist = Math.hypot(this.width, this.height) * 0.78;

    this.penAgents.push({
      x: cx + Math.cos(angle) * startR,
      y: cy + Math.sin(angle) * startR,
      angle: angle,
      r: startR,
      speedR: 45 + Math.random() * 65, // Outward speed
      speedTheta: (0.42 + Math.random() * 0.75) * (Math.random() > 0.4 ? 1 : -1),
      noiseScale: 0.0022 + Math.random() * 0.003,
      lineWidth: 0.8 + Math.random() * 2.4,
      opacity: 0.65 + Math.random() * 0.35, // High contrast pure black ink
      isHatch: Math.random() > 0.55,
      history: [],
      maxDist: maxCornerDist,
      age: 0
    });
  }

  spawnPaperRing() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const wordCount = 16 + Math.floor(Math.random() * 22);
    const ringWords = [];
    const startIdx = Math.floor(Math.random() * (this.words.length - wordCount));
    for (let i = 0; i < wordCount; i++) {
      ringWords.push(this.words[(startIdx + i) % this.words.length]);
    }

    // Rings now expand all the way out to screen borders and corners
    const maxScreenRadius = Math.hypot(this.width, this.height) * (0.25 + Math.random() * 0.52);

    this.paperRings.push({
      currentRadius: 24 + Math.random() * 20,
      targetRadius: maxScreenRadius,
      expansionSpeed: 28 + Math.random() * 36,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: (0.035 + Math.random() * 0.045) * (Math.random() > 0.5 ? 1 : -1),
      irregularity: 0.035 + Math.random() * 0.045,
      words: ringWords,
      isStamped: false,
      shadowBlur: 12 + Math.random() * 18,
      lineWidth: 1.4 + Math.random() * 1.8
    });
  }

  spawnSpiralText() {
    const phrase = this.texts[Math.floor(Math.random() * this.texts.length)];
    this.spiralTextArms.push({
      text: phrase,
      chars: phrase.split(''),
      currentIndex: 0,
      baseAngle: Math.random() * Math.PI * 2,
      currentR: 18 + Math.random() * 25,
      spiralGrowth: 32 + Math.random() * 30, // Expands broad spiral reaching corners
      charStepTimer: 0,
      charInterval: 0.05 + Math.random() * 0.03,
      fontSize: 11 + Math.floor(Math.random() * 15),
      isDone: false
    });
  }

  update(dt, speedMult = 1.0) {
    if (!this.initialized) return;

    this.time += dt * speedMult;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const offCtx = this.offCtx;

    // 1. Spawning concentric paper rings
    this.nextRingTime -= dt * speedMult;
    if (this.nextRingTime <= 0) {
      this.spawnPaperRing();
      this.nextRingTime = this.ringInterval / Math.max(1, speedMult * 0.8);
    }

    // 2. Spawning spiral text arms
    this.nextSpiralTextTime -= dt * speedMult;
    if (this.nextSpiralTextTime <= 0) {
      this.spawnSpiralText();
      this.nextSpiralTextTime = (1.8 + Math.random() * 1.6) / Math.max(1, speedMult * 0.8);
    }

    // 3. Progressively stamp spiral text streams
    for (let i = this.spiralTextArms.length - 1; i >= 0; i--) {
      const arm = this.spiralTextArms[i];
      arm.charStepTimer += dt * speedMult;

      while (arm.charStepTimer >= arm.charInterval && arm.currentIndex < arm.chars.length) {
        arm.charStepTimer -= arm.charInterval;
        const ch = arm.chars[arm.currentIndex];
        arm.currentIndex++;

        const turns = (arm.currentIndex * 0.09);
        const theta = arm.baseAngle + turns * Math.PI * 2;
        const r = arm.currentR + turns * arm.spiralGrowth;

        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r;

        // Render with high black ink contrast
        offCtx.save();
        offCtx.translate(px, py);
        offCtx.rotate(theta + Math.PI / 2);
        const dynamicSize = Math.max(10, Math.min(26, Math.floor(arm.fontSize * (0.7 + (r / 400)))));
        offCtx.font = `700 ${dynamicSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        offCtx.fillStyle = '#0a0a0a'; // Pure black ink contrast
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(ch, 0, 0);
        offCtx.restore();
      }

      if (arm.currentIndex >= arm.chars.length) {
        this.spiralTextArms.splice(i, 1);
      }
    }

    // 4. Progressively draw and stamp concentric paper rings
    for (let i = this.paperRings.length - 1; i >= 0; i--) {
      const ring = this.paperRings[i];
      ring.currentRadius += ring.expansionSpeed * dt * speedMult;
      ring.rotationAngle += ring.rotationSpeed * dt * speedMult;

      const numPts = 100;
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
          y: cy + Math.sin(theta) * r,
          theta,
          r
        });
      }

      offCtx.save();
      offCtx.beginPath();
      offCtx.moveTo(pts[0].x, pts[0].y);
      for (let s = 1; s < pts.length; s++) {
        offCtx.lineTo(pts[s].x, pts[s].y);
      }
      offCtx.closePath();

      // Sharp shadow & defined paper cut edge
      offCtx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      offCtx.shadowBlur = ring.shadowBlur;
      offCtx.shadowOffsetX = 0;
      offCtx.shadowOffsetY = 4;
      offCtx.strokeStyle = 'rgba(10, 10, 10, 0.85)';
      offCtx.lineWidth = ring.lineWidth;
      offCtx.stroke();
      offCtx.restore();

      // Stamp typography along the ring perimeters
      if (ring.currentRadius > 65 && !ring.isStamped) {
        offCtx.save();
        const fontSize = Math.max(10, Math.min(28, Math.floor(ring.currentRadius * 0.06)));
        offCtx.font = `700 ${fontSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        offCtx.fillStyle = '#080808'; // Deepest black ink
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';

        const fullSentence = ring.words.join('   ');
        const chars = fullSentence.split('');
        const stepAngle = (Math.PI * 2) / chars.length;

        for (let c = 0; c < chars.length; c++) {
          const charAngle = ring.rotationAngle + c * stepAngle;
          const charR = ring.currentRadius + 4;
          const px = cx + Math.cos(charAngle) * charR;
          const py = cy + Math.sin(charAngle) * charR;

          offCtx.save();
          offCtx.translate(px, py);
          offCtx.rotate(charAngle + Math.PI / 2);
          offCtx.fillText(chars[c], 0, 0);
          offCtx.restore();
        }
        offCtx.restore();

        ring.isStamped = true;
      }

      if (ring.currentRadius >= ring.targetRadius) {
        this.paperRings.splice(i, 1);
      }
    }

    // 5. Maintain active ink pen agents
    while (this.penAgents.length < this.maxPenAgents) {
      this.spawnPenAgent();
    }

    for (let i = this.penAgents.length - 1; i >= 0; i--) {
      const p = this.penAgents[i];
      p.age += dt * speedMult;

      const prevX = p.x;
      const prevY = p.y;

      const nAngle = noise.noise2D(p.x * p.noiseScale, p.y * p.noiseScale + this.time * 0.05) * Math.PI * 2;
      p.angle += p.speedTheta * dt * speedMult + Math.sin(nAngle) * 0.38 * dt * speedMult;
      p.r += p.speedR * dt * speedMult;

      p.x = cx + Math.cos(p.angle) * p.r;
      p.y = cy + Math.sin(p.angle) * p.r;

      // Draw progressive stroke with solid black ink
      offCtx.save();
      offCtx.beginPath();
      offCtx.moveTo(prevX, prevY);
      offCtx.lineTo(p.x, p.y);
      offCtx.strokeStyle = `rgba(10, 10, 10, ${p.opacity})`;
      offCtx.lineWidth = p.lineWidth;
      offCtx.lineCap = 'round';
      offCtx.stroke();

      // Cross-hatching ticks on some strokes (Victorian engraving style)
      if (p.isHatch && Math.random() > 0.58) {
        const hLen = 5 + Math.random() * 10;
        const normAngle = p.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        offCtx.beginPath();
        offCtx.moveTo(p.x, p.y);
        offCtx.lineTo(p.x + Math.cos(normAngle) * hLen, p.y + Math.sin(normAngle) * hLen);
        offCtx.strokeStyle = `rgba(15, 15, 15, ${p.opacity * 0.85})`;
        offCtx.lineWidth = 0.7;
        offCtx.stroke();
      }
      offCtx.restore();

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
  }

  render(ctx, width, height, cx, cy, lightWaves, alpha = 1.0) {
    if (alpha <= 0.001) return;

    this.resize(width, height);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Subtle paper grain light wave highlight (no neon)
    if (lightWaves && lightWaves.waves.length > 0) {
      const maxR = Math.hypot(width, height) * 0.75;

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

    // Central dark core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.6, '#0a0a0a');
    coreGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}


// --- js/systems/movieTunnel.js ---
/**
 * Scene 2: Movie Tunnel (1951 Animated Film)
 * Authentic Soft Watercolor & Diluted Pigment on Paper (ESTÉTICA DE ACUARELA).
 * Powdery blues, grayish celestes, soft turquoise, lavenders, lilacs, muted violets, powdery rose.
 * Driven by ColorGrid pigment simulation, autonomous BrushAgents, and multi-layer FlowField.
 * Expanded to cover full screen from center to corners.
 */




class MovieTunnel {
  constructor() {
    this.time = 0;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Persistent offscreen canvas buffer for cumulative watercolor painting
    this.offscreenCanvas = document.createElement('canvas');
    this.offCtx = this.offscreenCanvas.getContext('2d');

    // Soft powdery watercolor palette (strictly non-neon, non-phosphorescent)
    this.palette = [
      { r: 132, g: 168, b: 206 },  // Azul empolvado (powdery blue)
      { r: 164, g: 198, b: 218 },  // Celeste grisáceo (grayish sky blue)
      { r: 118, g: 192, b: 196 },  // Turquesa suave (soft turquoise)
      { r: 178, g: 162, b: 204 },  // Lavanda (lavender)
      { r: 196, g: 172, b: 212 },  // Lila (lilac)
      { r: 138, g: 120, b: 168 },  // Violeta apagado (muted violet)
      { r: 214, g: 166, b: 178 },  // Rosa empolvado (powdery rose)
      { r: 48,  g: 82,  b: 124 }   // Acento azul mineral más intenso (deep muted Prussian)
    ];

    // FlowField configuration for broad organic watercolor spirals reaching corners
    this.flowField = new FlowField({
      vortexStrength: 0.82,
      radialExpansion: 0.44, // Generous radial expansion towards corners
      noiseScale: 0.0016,
      noiseStrength: 0.75,
      turbulence: 0.28,
      spiralDirection: 1
    });

    // Pigment simulation & spatial coverage map
    this.colorGrid = new ColorGrid(64, 48);

    // Active autonomous brush agents
    this.agents = [];
    this.maxAgents = 28; // Increased for richer corner coverage

    // Soft pigment wash drips / stains
    this.washStains = [];
    this.nextStainTime = 0;

    // Completed paths for gentle surface light shimmers
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
    const maxR = Math.hypot(width, height) * 0.78;

    // Soft watercolor paper ground: subtle muted slate-indigo paper wash
    const bgGrad = this.offCtx.createRadialGradient(cx, cy, 15, cx, cy, maxR);
    bgGrad.addColorStop(0.0, '#0c101a');
    bgGrad.addColorStop(0.35, '#121724');
    bgGrad.addColorStop(0.75, '#182030');
    bgGrad.addColorStop(1.0, '#0e121e');
    this.offCtx.fillStyle = bgGrad;
    this.offCtx.fillRect(0, 0, width, height);

    this.agents = [];
    this.recentPaths = [];
    this.washStains = [];
    this.time = 0;
    this.nextStainTime = 0.4;

    // Spawn initial watercolor strokes across center and mid-radii
    for (let i = 0; i < 10; i++) {
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

  spawnAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxCorner = Math.hypot(this.width, this.height) * 0.78;

    // Vary spawn radius: mostly from center, occasionally from mid-radius to seed corners
    const isMidSpawn = Math.random() > 0.75;
    const baseR = isMidSpawn ? (50 + Math.random() * (maxCorner * 0.45)) : (10 + Math.random() * 26);

    const spawnAngle = this.colorGrid.findLeastCoveredAngle(cx, cy, baseR);
    const x = cx + Math.cos(spawnAngle) * baseR;
    const y = cy + Math.sin(spawnAngle) * baseR;

    const col = this.palette[Math.floor(Math.random() * this.palette.length)];
    const thickness = 12 + Math.random() * 28;
    const opacity = 0.22 + Math.random() * 0.28;

    const initForce = this.flowField.getForce(x, y, cx, cy, this.time);
    const speed = 46 + Math.random() * 55;

    this.agents.push(new BrushAgent({
      x,
      y,
      vx: initForce.x * speed,
      vy: initForce.y * speed,
      speed,
      maxSteerForce: 3.4,
      thickness,
      opacity,
      color: col,
      maxLife: 7.5 + Math.random() * 5.0, // Long life to reach full corners
      numPasses: 3,
      bristleSpread: 0.42,
      isWet: true,
      isGothic: false
    }));
  }

  spawnWashStain() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    // Puddles distributed across entire viewport
    const r = 35 + Math.random() * (Math.hypot(this.width, this.height) * 0.55);
    const col = this.palette[Math.floor(Math.random() * this.palette.length)];

    this.washStains.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      radius: 25 + Math.random() * 65,
      color: col,
      opacity: 0.08 + Math.random() * 0.14,
      drawn: false
    });
  }

  update(dt, speedMult = 1.0) {
    if (!this.initialized) return;

    this.time += dt * speedMult;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const offCtx = this.offCtx;
    const maxCorner = Math.hypot(this.width, this.height) * 0.78;

    // Watercolor bloom puddles
    this.nextStainTime -= dt * speedMult;
    if (this.nextStainTime <= 0) {
      this.spawnWashStain();
      this.nextStainTime = 1.5 / Math.max(1, speedMult * 0.8);
    }

    for (let i = this.washStains.length - 1; i >= 0; i--) {
      const s = this.washStains[i];
      if (!s.drawn) {
        offCtx.save();
        const radGrad = offCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
        radGrad.addColorStop(0, `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.opacity})`);
        radGrad.addColorStop(0.7, `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.opacity * 0.5})`);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        offCtx.fillStyle = radGrad;
        offCtx.beginPath();
        offCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        offCtx.fill();
        offCtx.restore();

        this.colorGrid.depositPigment(s.x, s.y, s.color, s.opacity * 0.8);
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
      agent.update(dt, this.flowField, this.colorGrid, cx, cy, this.time, speedMult);
      agent.drawSegment(offCtx);

      const dist = Math.hypot(agent.x - cx, agent.y - cy);
      if (agent.isDead || dist > maxCorner) {
        if (agent.history.length > 5) {
          this.recentPaths.push(agent.history);
          if (this.recentPaths.length > this.maxRecentPaths) {
            this.recentPaths.shift();
          }
        }
        this.agents.splice(i, 1);
      }
    }

    // Diffuse pigment in low-res buffer
    this.colorGrid.diffuse(0.02 * dt * speedMult);
  }

  render(ctx, width, height, cx, cy, lightWaves, alpha = 1.0) {
    if (alpha <= 0.001) return;

    this.resize(width, height);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Subtle light wave glazes over existing strokes
    if (lightWaves && lightWaves.waves.length > 0) {
      const maxR = Math.hypot(width, height) * 0.75;

      ctx.save();
      for (const wave of lightWaves.waves) {
        const waveRadius = (wave.direction > 0 ? (1.0 - wave.progress) : wave.progress) * maxR;
        const waveBand = wave.width * maxR * 0.9;

        for (const path of this.recentPaths) {
          ctx.beginPath();
          let hasPoints = false;
          let strokeCol = null;

          for (let k = 0; k < path.length; k++) {
            const pt = path[k];
            const dist = Math.abs(pt.r - waveRadius);
            if (dist < waveBand) {
              if (!hasPoints) {
                ctx.moveTo(pt.x, pt.y);
                hasPoints = true;
                strokeCol = pt.color;
              } else {
                ctx.lineTo(pt.x, pt.y);
              }
            }
          }

          if (hasPoints && strokeCol) {
            ctx.strokeStyle = `rgba(${Math.min(255, strokeCol.r + 35)}, ${Math.min(255, strokeCol.g + 35)}, ${Math.min(255, strokeCol.b + 35)}, ${(0.32 * wave.intensity).toFixed(3)})`;
            ctx.lineWidth = 3.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // Central aperture eye
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#060910');
    coreGrad.addColorStop(0.65, '#0e121c');
    coreGrad.addColorStop(1, 'rgba(14, 18, 28, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}


// --- js/systems/gameTunnel.js ---
/**
 * Scene 3: Game Tunnel (American McGee's Alice, 2000)
 * Authentic Dark Watercolor & Dense Gothic Pigment (ACUARELA OSCURA).
 * Burgundy, muted crimson, wine red, petrol blue, indigo, dark violet, deep purple, bluish gray.
 * Twisted asymmetric spirals, interlocking thorny roots, dense concentrated stains.
 * Expanded to cover full screen from center to corners.
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

    // Deep gothic watercolor palette (strictly non-neon, matte dense pigments)
    this.palette = [
      { r: 115, g: 25, b: 45 },   // Borgoña (burgundy)
      { r: 145, g: 30, b: 48 },   // Carmesí apagado (muted crimson)
      { r: 90,  g: 18, b: 32 },   // Rojo vino (wine red)
      { r: 28,  g: 62, b: 78 },   // Azul petróleo (petrol blue)
      { r: 32,  g: 42, b: 85 },   // Índigo (indigo)
      { r: 68,  g: 28, b: 75 },   // Violeta oscuro (dark violet)
      { r: 48,  g: 18, b: 56 },   // Morado profundo (deep purple)
      { r: 75,  g: 88, b: 102 }   // Gris azulado (bluish gray)
    ];

    // FlowField for turbulent, twisted asymmetric curves reaching corners
    this.flowField = new FlowField({
      vortexStrength: 0.76,
      radialExpansion: 0.46, // Expands fully into corners
      noiseScale: 0.0028,
      noiseStrength: 1.15,
      turbulence: 0.52,
      spiralDirection: -1 // counter-swirl
    });

    // Pigment simulation & spatial coverage map
    this.colorGrid = new ColorGrid(64, 48);

    // Active autonomous brush agents
    this.agents = [];
    this.maxAgents = 30; // Increased for rich corner coverage

    // Dense pigment puddles / dark concentrated blotches
    this.denseBlotches = [];
    this.nextBlotchTime = 0;

    // Completed paths for subtle surface light shimmers
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
    const maxR = Math.hypot(width, height) * 0.78;

    // Deep blackened charcoal & raw umber paper background
    const bgGrad = this.offCtx.createRadialGradient(cx, cy, 10, cx, cy, maxR);
    bgGrad.addColorStop(0.0, '#040206');
    bgGrad.addColorStop(0.35, '#0d040a');
    bgGrad.addColorStop(0.75, '#120714');
    bgGrad.addColorStop(1.0, '#07020a');
    this.offCtx.fillStyle = bgGrad;
    this.offCtx.fillRect(0, 0, width, height);

    this.agents = [];
    this.recentPaths = [];
    this.denseBlotches = [];
    this.time = 0;
    this.nextBlotchTime = 0.3;

    // Spawn initial dark watercolor strokes near center and mid-radii
    for (let i = 0; i < 10; i++) {
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

  spawnAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxCorner = Math.hypot(this.width, this.height) * 0.78;

    const isMidSpawn = Math.random() > 0.72;
    const baseR = isMidSpawn ? (45 + Math.random() * (maxCorner * 0.45)) : (10 + Math.random() * 24);

    const spawnAngle = this.colorGrid.findLeastCoveredAngle(cx, cy, baseR);
    const x = cx + Math.cos(spawnAngle) * baseR;
    const y = cy + Math.sin(spawnAngle) * baseR;

    const col = this.palette[Math.floor(Math.random() * this.palette.length)];
    const thickness = 9 + Math.random() * 28;
    const opacity = 0.28 + Math.random() * 0.35; // concentrated dark pigment

    const initForce = this.flowField.getForce(x, y, cx, cy, this.time);
    const speed = 48 + Math.random() * 55;

    this.agents.push(new BrushAgent({
      x,
      y,
      vx: initForce.x * speed,
      vy: initForce.y * speed,
      speed,
      maxSteerForce: 4.8,
      thickness,
      opacity,
      color: col,
      maxLife: 7.2 + Math.random() * 4.5, // Extended life to explore corners
      numPasses: 3,
      bristleSpread: 0.38,
      isWet: true,
      isGothic: true
    }));
  }

  spawnDenseBlotch() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const r = 30 + Math.random() * (Math.hypot(this.width, this.height) * 0.52);
    const col = this.palette[Math.floor(Math.random() * this.palette.length)];

    this.denseBlotches.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      radius: 18 + Math.random() * 50,
      color: col,
      opacity: 0.12 + Math.random() * 0.18,
      drawn: false
    });
  }

  update(dt, speedMult = 1.0) {
    if (!this.initialized) return;

    this.time += dt * speedMult;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const offCtx = this.offCtx;
    const maxCorner = Math.hypot(this.width, this.height) * 0.78;

    // Dark concentrated pigment blotches
    this.nextBlotchTime -= dt * speedMult;
    if (this.nextBlotchTime <= 0) {
      this.spawnDenseBlotch();
      this.nextBlotchTime = 1.4 / Math.max(1, speedMult * 0.8);
    }

    for (let i = this.denseBlotches.length - 1; i >= 0; i--) {
      const b = this.denseBlotches[i];
      if (!b.drawn) {
        offCtx.save();
        const radGrad = offCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        radGrad.addColorStop(0, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.opacity})`);
        radGrad.addColorStop(0.65, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${b.opacity * 0.5})`);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        offCtx.fillStyle = radGrad;
        offCtx.beginPath();
        offCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        offCtx.fill();
        offCtx.restore();

        this.colorGrid.depositPigment(b.x, b.y, b.color, b.opacity * 1.2);
        b.drawn = true;
      }
      this.denseBlotches.splice(i, 1);
    }

    // Maintain active dark brush agents
    while (this.agents.length < this.maxAgents) {
      this.spawnAgent();
    }

    // Step agents & paint onto persistent canvas buffer
    for (let i = this.agents.length - 1; i >= 0; i--) {
      const agent = this.agents[i];
      agent.update(dt, this.flowField, this.colorGrid, cx, cy, this.time, speedMult);
      agent.drawSegment(offCtx);

      const dist = Math.hypot(agent.x - cx, agent.y - cy);
      if (agent.isDead || dist > maxCorner) {
        if (agent.history.length > 5) {
          this.recentPaths.push(agent.history);
          if (this.recentPaths.length > this.maxRecentPaths) {
            this.recentPaths.shift();
          }
        }
        this.agents.splice(i, 1);
      }
    }

    // Diffuse pigment in low-res buffer
    this.colorGrid.diffuse(0.018 * dt * speedMult);
  }

  render(ctx, width, height, cx, cy, lightWaves, alpha = 1.0) {
    if (alpha <= 0.001) return;

    this.resize(width, height);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Subtle wine/petrol shimmer over existing twisted roots
    if (lightWaves && lightWaves.waves.length > 0) {
      const maxR = Math.hypot(width, height) * 0.75;

      ctx.save();
      for (const wave of lightWaves.waves) {
        const waveRadius = (wave.direction > 0 ? (1.0 - wave.progress) : wave.progress) * maxR;
        const waveBand = wave.width * maxR * 0.9;

        for (const path of this.recentPaths) {
          ctx.beginPath();
          let hasPoints = false;
          let strokeCol = null;

          for (let k = 0; k < path.length; k++) {
            const pt = path[k];
            const dist = Math.abs(pt.r - waveRadius);
            if (dist < waveBand) {
              if (!hasPoints) {
                ctx.moveTo(pt.x, pt.y);
                hasPoints = true;
                strokeCol = pt.color;
              } else {
                ctx.lineTo(pt.x, pt.y);
              }
            }
          }

          if (hasPoints && strokeCol) {
            ctx.strokeStyle = `rgba(${Math.min(255, strokeCol.r + 40)}, ${strokeCol.g}, ${strokeCol.b}, ${(0.35 * wave.intensity).toFixed(3)})`;
            ctx.lineWidth = 3.4;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // Central abyss aperture
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.65, '#0e030a');
    coreGrad.addColorStop(1, 'rgba(14, 3, 10, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
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
 * Implements true 3D depth animations:
 * 1. Initial fall from camera foreground (scale ~4.2, rotating as she plunges toward vanishing point).
 * 2. Settled slow-motion vertical suspension floating.
 * 3. Perspective descent into depth (scale 1.0 -> 0.01 into central hole) during transitions.
 * 4. Perspective ascent from depth (scale 0.01 -> 1.0 from central hole) for new Alice.
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
    this.scale = 4.2;
    this.rotation = -Math.PI * 5.0; // ~2.5 turns coupled to fall
    this.verticalOffset = -300; // starts above / near camera
    this.horizontalOffset = 40;
    this.alpha = 1.0;

    // Time tracking
    this.time = 0;
    this.isIntro = true;
    this.introDuration = 3.6; // seconds for dramatic perspective fall
    this.introElapsed = 0;

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

  update(dt, speedMult = 1.0) {
    this.time += dt * speedMult;

    // Smooth mouse parallax lerp
    this.mouseX += (this.mouseTargetX - this.mouseX) * Math.min(1.0, dt * 4);
    this.mouseY += (this.mouseTargetY - this.mouseY) * Math.min(1.0, dt * 4);

    if (this.isTransitionControlled) {
      // In transition, transform is controlled directly by transitionManager
      return;
    }

    if (this.isIntro) {
      this.introElapsed += dt;
      const progress = Math.min(1.0, this.introElapsed / this.introDuration);

      // Ease out cubic for falling deceleration into depth
      const t = progress;
      const easeOut = 1 - Math.pow(1 - t, 3);

      // Scale drops from 4.2 (camera closeup) down to 1.0 (settled position)
      this.scale = 1.0 + 3.2 * (1 - easeOut);

      // Rotation coupled directly to downward descent
      this.rotation = (1 - easeOut) * (-Math.PI * 5.0);

      // Position travels from high foreground into center vanishing point
      this.verticalOffset = (1 - easeOut) * -260;
      this.horizontalOffset = (1 - easeOut) * 35;
      this.alpha = Math.min(1.0, progress * 2.0); // Clean fast appearance

      if (progress >= 1.0) {
        this.isIntro = false;
        this.scale = 1.0;
        this.rotation = 0;
        this.verticalOffset = 0;
        this.horizontalOffset = 0;
      }
    } else {
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

  /**
   * Set custom 3D depth transform during transitions
   */
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

    // Target height: 38% of viewport height
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
      'rgba(165, 45, 68, '    // Game: rich wine red watercolor
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
 * The user transitions from passive observer to active co-creator.
 * Inspired by Omniharmonic: Organic, dynamic, and complex generative composition.
 * Multi-focal fluid fields, autonomous agent networks, persistent pigment accumulation,
 * and indirect cursor influence (deflection, vortex wells, flick impulses).
 */




class CreateStage {
  constructor() {
    this.isActive = false;
    this.time = 0;
    this.width = 0;
    this.height = 0;

    // Persistent canvas buffer (inherits from previous tunnel or initializes fresh)
    this.offscreenCanvas = document.createElement('canvas');
    this.offCtx = this.offscreenCanvas.getContext('2d');

    // Rich Omniharmonic-inspired palette (uniting all 3 eras + mineral accents)
    this.palette = [
      { r: 24,  g: 48,  b: 88  },  // Deep Prussian Blue
      { r: 120, g: 155, b: 195 },  // Powdery Sky Blue
      { r: 168, g: 145, b: 192 },  // Muted Lavender
      { r: 142, g: 32,  b: 52  },  // Wine Crimson
      { r: 35,  g: 72,  b: 85  },  // Petrol Blue
      { r: 215, g: 175, b: 120 },  // Muted Gold Pigment
      { r: 18,  g: 18,  b: 24  },  // Rich Indian Ink
      { r: 212, g: 172, b: 180 }   // Soft Powdery Rose
    ];

    // Low-res pigment simulation & coverage map
    this.colorGrid = new ColorGrid(80, 60);

    // Autonomous creative agents
    this.agents = [];
    this.maxAgents = 42;

    // Dynamic wandering focal centers (Omniharmonic dynamic foci)
    this.foci = [
      { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0.8, angle: 0 },
      { x: 0, y: 0, targetX: 0, targetY: 0, strength: -0.7, angle: Math.PI },
      { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0.6, angle: Math.PI / 2 }
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

    // Transition progress (0 -> 1 as rabbit hole frees its central constraint)
    this.freedomBlend = 0;
  }

  init(width, height, existingCanvas = null) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.colorGrid.resize(width, height);

    // If coming from an existing rabbit hole, copy its canvas so nothing is erased!
    if (existingCanvas) {
      this.offCtx.drawImage(existingCanvas, 0, 0, width, height);
    } else {
      // Soft primed paper wash
      this.offCtx.fillStyle = '#f5f2eb';
      this.offCtx.fillRect(0, 0, width, height);
    }

    this.cursor.x = width / 2;
    this.cursor.y = height / 2;
    this.cursor.prevX = width / 2;
    this.cursor.prevY = height / 2;

    // Initialize wandering focal points
    this.foci.forEach((f, idx) => {
      const angle = (idx / this.foci.length) * Math.PI * 2;
      const r = Math.min(width, height) * 0.28;
      f.x = width / 2 + Math.cos(angle) * r;
      f.y = height / 2 + Math.sin(angle) * r;
      f.targetX = f.x;
      f.targetY = f.y;
    });

    this.agents = [];
    for (let i = 0; i < 16; i++) {
      this.spawnAgent();
    }

    this.isActive = true;
    this.freedomBlend = 0;
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
    const cx = this.width / 2;
    const cy = this.height / 2;

    let x, y, angle;
    if (atX !== null && atY !== null) {
      x = atX;
      y = atY;
      angle = inheritAngle !== null ? inheritAngle + (Math.random() - 0.5) * 0.8 : Math.random() * Math.PI * 2;
    } else {
      // Free spawn: randomly distributed or seeded near dynamic foci
      if (Math.random() > 0.4 && this.foci.length > 0) {
        const focus = this.foci[Math.floor(Math.random() * this.foci.length)];
        const r = 20 + Math.random() * 80;
        const a = Math.random() * Math.PI * 2;
        x = focus.x + Math.cos(a) * r;
        y = focus.y + Math.sin(a) * r;
      } else {
        // Broad canvas spawn
        x = Math.random() * this.width;
        y = Math.random() * this.height;
      }
      angle = Math.random() * Math.PI * 2;
    }

    const col = this.palette[Math.floor(Math.random() * this.palette.length)];
    const thickness = 6 + Math.random() * 24;
    const opacity = 0.22 + Math.random() * 0.26;
    const speed = 48 + Math.random() * 56;

    this.agents.push(new BrushAgent({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      maxSteerForce: 3.8,
      thickness,
      opacity,
      color: col,
      maxLife: 6.0 + Math.random() * 5.0,
      numPasses: 3,
      bristleSpread: 0.42,
      isWet: true,
      isGothic: Math.random() > 0.75
    }));
  }

  getFlowForce(x, y, time) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // 1. Weakened central rabbit hole vortex (relaxation from centralized constraint)
    const dxCenter = x - cx;
    const dyCenter = y - cy;
    const distCenter = Math.hypot(dxCenter, dyCenter) + 0.001;
    const rx = dxCenter / distCenter;
    const ry = dyCenter / distCenter;
    const tx = -ry;
    const ty = rx;

    const centerWeight = Math.max(0.05, 0.55 * (1.0 - this.freedomBlend));
    let fx = tx * centerWeight * 0.4 + rx * centerWeight * 0.2;
    let fy = ty * centerWeight * 0.4 + ry * centerWeight * 0.2;

    // 2. Dynamic wandering foci (Omniharmonic interconnected centers)
    for (const f of this.foci) {
      const fdx = x - f.x;
      const fdy = y - f.y;
      const fDist = Math.hypot(fdx, fdy) + 1.0;
      if (fDist < 360) {
        const falloff = Math.cos((fDist / 360) * (Math.PI / 2));
        const rotX = -fdy / fDist;
        const rotY = fdx / fDist;
        fx += rotX * f.strength * falloff * 0.65;
        fy += rotY * f.strength * falloff * 0.65;
      }
    }

    // 3. Multi-octave 3D Simplex Curl Noise
    const nScale = 0.0024;
    const curl = noise.curl2D(x * nScale, y * nScale + time * 0.03);
    fx += curl.x * 0.85;
    fy += curl.y * 0.85;

    // 4. Cursor Influence: Deflection, Vortex Well, Flick Impulse
    if (this.cursor.active) {
      const cdx = x - this.cursor.x;
      const cdy = y - this.cursor.y;
      const cDist = Math.hypot(cdx, cdy) + 0.01;
      const influenceRadius = this.cursor.isDown ? 260 : 160;

      if (cDist < influenceRadius) {
        const cFactor = 1.0 - cDist / influenceRadius;
        const smoothFactor = cFactor * cFactor;

        if (this.cursor.isDown) {
          // Click & hold: localized rotating vortex & pigment well
          const cRotX = -cdy / cDist;
          const cRotY = cdx / cDist;
          const cPullX = -cdx / cDist;
          const cPullY = -cdy / cDist;
          // Inward pull + high-speed spin
          fx += (cRotX * 1.8 + cPullX * 0.9) * smoothFactor * (1.0 + this.cursor.holdTime * 1.5);
          fy += (cRotY * 1.8 + cPullY * 0.9) * smoothFactor * (1.0 + this.cursor.holdTime * 1.5);
        } else if (this.cursor.speed > 8.0) {
          // Rapid flick / drag: directional wave impulse
          const normSpeed = Math.min(2.5, this.cursor.speed / 15.0);
          fx += (this.cursor.vx / this.cursor.speed) * normSpeed * smoothFactor * 2.2;
          fy += (this.cursor.vy / this.cursor.speed) * normSpeed * smoothFactor * 2.2;
        } else {
          // Gentle hover deflection / gentle orbital steering
          const cRotX = -cdy / cDist;
          const cRotY = cdx / cDist;
          fx += cRotX * smoothFactor * 0.8;
          fy += cRotY * smoothFactor * 0.8;
        }
      }
    }

    const fMag = Math.hypot(fx, fy) || 0.001;
    return {
      x: fx / fMag,
      y: fy / fMag
    };
  }

  update(dt, speedMult = 1.0) {
    if (!this.isActive) return;

    this.time += dt * speedMult;
    const offCtx = this.offCtx;

    // Smoothly relax central constraints (freedom blend: 0 -> 1 over 8s)
    if (this.freedomBlend < 1.0) {
      this.freedomBlend = Math.min(1.0, this.freedomBlend + dt * 0.12);
    }

    // Cursor hold duration tracking
    if (this.cursor.isDown) {
      this.cursor.holdTime += dt;
      // Deposit localized rich pigment puddle when held
      if (Math.random() > 0.4) {
        const rad = 15 + Math.random() * 35;
        const col = this.palette[Math.floor(Math.random() * this.palette.length)];
        const grad = offCtx.createRadialGradient(this.cursor.x, this.cursor.y, 0, this.cursor.x, this.cursor.y, rad);
        grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0.12)`);
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

    // Update wandering focal points with smooth noise
    this.foci.forEach((f, idx) => {
      f.angle += (0.12 + idx * 0.05) * dt;
      const baseR = Math.min(this.width, this.height) * (0.22 + idx * 0.08);
      const wanderX = noise.noise2D(idx * 10 + this.time * 0.08, idx * 5) * 90;
      const wanderY = noise.noise2D(idx * 5, idx * 10 + this.time * 0.08) * 90;
      f.x = this.width / 2 + Math.cos(f.angle) * baseR + wanderX;
      f.y = this.height / 2 + Math.sin(f.angle) * baseR + wanderY;
    });

    // Maintain creative agent population
    while (this.agents.length < this.maxAgents) {
      this.spawnAgent();
    }

    // Custom flowField adapter for BrushAgent
    const adapterFlow = {
      getForce: (x, y) => this.getFlowForce(x, y, this.time)
    };

    // Update and draw agents
    for (let i = this.agents.length - 1; i >= 0; i--) {
      const agent = this.agents[i];
      agent.update(dt, adapterFlow, this.colorGrid, this.width / 2, this.height / 2, this.time, speedMult);
      agent.drawSegment(offCtx);

      // Occasional organic branching when cursor flicks or during high energy
      if (this.cursor.speed > 12.0 && Math.random() > 0.94 && this.agents.length < this.maxAgents + 6) {
        const distToCursor = Math.hypot(agent.x - this.cursor.x, agent.y - this.cursor.y);
        if (distToCursor < 180) {
          this.spawnAgent(agent.x, agent.y, Math.atan2(agent.vy, agent.vx));
        }
      }

      // Check bounds & life
      const isOutOfBounds = agent.x < -60 || agent.x > this.width + 60 || agent.y < -60 || agent.y > this.height + 60;
      if (agent.isDead || isOutOfBounds) {
        this.agents.splice(i, 1);
      }
    }

    // Gentle pigment diffusion
    this.colorGrid.diffuse(0.015 * dt * speedMult);
  }

  render(ctx) {
    if (!this.isActive) return;

    ctx.save();
    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Subtle interactive cursor halo
    if (this.cursor.active) {
      const radius = this.cursor.isDown ? 38 + Math.sin(this.time * 6) * 6 : 22;
      ctx.beginPath();
      ctx.arc(this.cursor.x, this.cursor.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.cursor.isDown ? 'rgba(215, 175, 120, 0.45)' : 'rgba(168, 145, 192, 0.25)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  }
}


// --- js/transitionManager.js ---
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

const States = {
  INITIALIZING: 'INITIALIZING',
  INTRO_ANIMATION: 'INTRO_ANIMATION',
  IDLE: 'IDLE',
  TRANSITION_OUT: 'TRANSITION_OUT',
  TRANSFORMING: 'TRANSFORMING',
  TRANSITION_IN: 'TRANSITION_IN'
};

class TransitionManager {
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


// --- js/main.js ---
/**
 * WHY BOTHER? — GENERATIVE RABBIT HOLE & CREATE STAGE
 * Main Entry Point & Orchestrator
 */









// DOM Elements
const canvas = document.getElementById('tunnel-canvas');
const ctx = canvas.getContext('2d');
const watchCanvas = document.getElementById('pocket-watch-canvas');
const watchContainer = document.getElementById('watch-container');

const mainTitleEl = document.getElementById('main-title');
const mainSubtitleEl = document.getElementById('main-subtitle');
const eraBadgeContainer = document.getElementById('era-badge-container');
const eraNumberEl = document.getElementById('era-number');
const eraTitleEl = document.getElementById('era-title');
const eraDescEl = document.getElementById('era-desc');
const manifestoContainer = document.getElementById('manifesto-quote-container');
const manifestoTextEl = document.getElementById('manifesto-text');
const watchHintEl = document.getElementById('watch-hint');

// Tool buttons
const soundBtn = document.getElementById('btn-sound');
const soundIcon = document.getElementById('sound-icon');
const soundLabel = document.getElementById('sound-label');
const fullscreenBtn = document.getElementById('btn-fullscreen');
const choosePathBtn = document.getElementById('btn-choose-path');

// Decision & Reflection Modals
const decisionModal = document.getElementById('decision-modal');
const btnContinueExploring = document.getElementById('btn-continue-exploring');
const btnStartCreating = document.getElementById('btn-start-creating');

const reflectionModal = document.getElementById('reflection-modal');
const createHintPanel = document.getElementById('create-hint-panel');
const btnContemplate = document.getElementById('btn-contemplate');
const btnDownloadArt = document.getElementById('btn-download-art');
const btnResumeCreating = document.getElementById('btn-resume-creating');
const btnReturnRabbitHole = document.getElementById('btn-return-rabbit-hole');

// Era Metadata definitions
const ERAS = [
  {
    number: "Capítulo I · 1865",
    title: "El Libro Original",
    desc: "Lewis Carroll & John Tenniel — Grabado, tinta, tipografía y papel envejecido.",
    quote: "«Al principio, la madriguera del conejo se extendía en línea recta como un túnel, y después torció bruscamente hacia abajo...»",
    className: "era-0"
  },
  {
    number: "Capítulo II · 1951",
    title: "La Película Animada",
    desc: "Walt Disney Productions — Acuarela suave, pigmentos diluidos en agua y pinceladas orgánicas.",
    quote: "«Curioso y curioso... Si el mundo no tuviera ningún sentido, ¿por qué no inventarle uno?»",
    className: "era-1"
  },
  {
    number: "Capítulo III · 2000",
    title: "El Videojuego Siniestro",
    desc: "American McGee & Rogue Entertainment — Acuarela oscura, borgoña, índigo denso y espirales retorcidas.",
    quote: "«Solo unos pocos encuentran el camino; otros no lo reconocen cuando lo encuentran; otros no quieren encontrarlo.»",
    className: "era-2"
  }
];

// Subsystem instances
const lightWaves = new LightWaveSystem();
const bookTunnel = new BookTunnel();
const movieTunnel = new MovieTunnel();
const gameTunnel = new GameTunnel();
const alice = new AliceController();
const createStage = new CreateStage();

let pocketWatch;
let transitionManager;
let isCreateMode = false;
let isMouseDown = false;

// Web Audio Ambiance Synthesizer
class AmbianceAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.tickInterval = null;
    this.droneOsc = null;
    this.droneGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(65, this.ctx.currentTime);
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    this.droneOsc.start();

    this.startTickLoop();
    this.isPlaying = true;
  }

  startTickLoop() {
    let tickCount = 0;
    this.tickInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      tickCount++;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = tickCount % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(tickCount % 2 === 0 ? 980 : 720, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    }, 550);
  }

  triggerTransitionWhoosh() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.7);
    filter.frequency.exponentialRampToValueAtTime(120, now + 1.4);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + 1.6);
  }

  setEra(era) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (era === 0) {
      this.droneOsc.frequency.exponentialRampToValueAtTime(55, now + 1.0);
    } else if (era === 1) {
      this.droneOsc.frequency.exponentialRampToValueAtTime(110, now + 1.0);
    } else if (era === 2) {
      this.droneOsc.frequency.exponentialRampToValueAtTime(42, now + 1.0);
    } else {
      // Create stage harmonic drone
      this.droneOsc.frequency.exponentialRampToValueAtTime(88, now + 1.0);
    }
  }

  toggle() {
    if (!this.ctx) {
      this.init();
      return true;
    }
    if (this.ctx.state === 'running') {
      this.ctx.suspend();
      this.isPlaying = false;
      return false;
    } else {
      this.ctx.resume();
      this.isPlaying = true;
      return true;
    }
  }
}

const audio = new AmbianceAudio();

// Setup era change UI sync
function handleEraChanged(newEraIndex) {
  if (isCreateMode) return;
  const meta = ERAS[newEraIndex];

  document.body.className = meta.className;

  eraTitleEl.style.opacity = '0';
  eraDescEl.style.opacity = '0';
  manifestoTextEl.style.opacity = '0';

  setTimeout(() => {
    eraNumberEl.textContent = meta.number;
    eraTitleEl.textContent = meta.title;
    eraDescEl.textContent = meta.desc;
    manifestoTextEl.textContent = meta.quote;

    eraTitleEl.style.opacity = '1';
    eraDescEl.style.opacity = '1';
    manifestoTextEl.style.opacity = '1';
  }, 250);

  audio.setEra(newEraIndex);
}

// Automatic milestone: show decision prompt after user explores eras
function handleTransitionsMilestone(count) {
  if (count >= 2 && !isCreateMode) {
    // Subtly highlight choice button
    if (choosePathBtn) {
      choosePathBtn.classList.add('highlight');
    }
  }
}

// Initialize Pocket Watch & Transition Manager
pocketWatch = new PocketWatch(watchCanvas, (direction) => {
  if (isCreateMode) return;
  if (watchHintEl) {
    watchHintEl.style.opacity = '0';
    setTimeout(() => {
      watchHintEl.style.display = 'none';
    }, 600);
  }
  audio.triggerTransitionWhoosh();
  transitionManager.triggerTransition(direction);
});

transitionManager = new TransitionManager(
  alice,
  bookTunnel,
  movieTunnel,
  gameTunnel,
  lightWaves,
  pocketWatch,
  handleEraChanged,
  handleTransitionsMilestone
);

// Viewport & Resolution Management
let width = window.innerWidth;
let height = window.innerHeight;
let cx = width / 2;
let cy = height / 2;

function handleResize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.resetTransform();
  ctx.scale(dpr, dpr);

  cx = width / 2;
  cy = height / 2;

  bookTunnel.resize(width, height);
  movieTunnel.resize(width, height);
  gameTunnel.resize(width, height);
  createStage.resize(width, height);
}

window.addEventListener('resize', handleResize);
handleResize();

// Mouse & Touch Parallax / Cursor Interaction
let mouseTargetX = 0;
let mouseTargetY = 0;

function updatePointer(e) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  if (isCreateMode) {
    createStage.setCursor(clientX, clientY, isMouseDown);
  } else {
    const nx = (clientX / width) * 2 - 1;
    const ny = (clientY / height) * 2 - 1;
    mouseTargetX = nx;
    mouseTargetY = ny;
    alice.setMouse(nx, ny);
  }
}

window.addEventListener('mousemove', (e) => {
  updatePointer(e);
});

window.addEventListener('mousedown', (e) => {
  if (e.target.closest('.modal-card') || e.target.closest('.extra-tools') || e.target.closest('.tool-btn')) {
    return;
  }
  isMouseDown = true;
  updatePointer(e);
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
  if (isCreateMode) {
    createStage.cursor.isDown = false;
  }
});

window.addEventListener('touchstart', (e) => {
  if (e.target.closest('.modal-card') || e.target.closest('.extra-tools') || e.target.closest('.tool-btn')) {
    return;
  }
  isMouseDown = true;
  updatePointer(e);
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  updatePointer(e);
}, { passive: true });

window.addEventListener('touchend', () => {
  isMouseDown = false;
  if (isCreateMode) {
    createStage.cursor.isDown = false;
  }
});

// Keyboard navigation (Arrow Left: back, Arrow Right: forward)
window.addEventListener('keydown', (e) => {
  if (isCreateMode) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    pocketWatch.accumulatedAngle = 0;
    pocketWatch.angularVelocity = 28.0;
    audio.triggerTransitionWhoosh();
    transitionManager.triggerTransition(1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    pocketWatch.accumulatedAngle = 0;
    pocketWatch.angularVelocity = -28.0;
    audio.triggerTransitionWhoosh();
    transitionManager.triggerTransition(-1);
  }
});

// Sound Toggle Button
soundBtn.addEventListener('click', () => {
  const playing = audio.toggle();
  soundIcon.textContent = playing ? '🔊' : '🔈';
  soundLabel.textContent = playing ? 'Silenciar' : 'Sonido';
});

// Fullscreen Button
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// --- DECISION & CREATE STAGE WIRING ---

choosePathBtn.addEventListener('click', () => {
  decisionModal.style.display = 'flex';
});

btnContinueExploring.addEventListener('click', () => {
  decisionModal.style.display = 'none';
});

btnStartCreating.addEventListener('click', () => {
  decisionModal.style.display = 'none';
  enterCreateStage();
});

function enterCreateStage() {
  isCreateMode = true;

  // Active tunnel offscreen canvas is inherited so NOTHING is erased!
  const currentTunnel = transitionManager.tunnels[transitionManager.currentEra];
  const inheritedCanvas = currentTunnel ? currentTunnel.offscreenCanvas : null;
  createStage.init(width, height, inheritedCanvas);

  document.body.className = 'era-create';

  // Update HUD
  mainTitleEl.textContent = 'Why Bother?';
  mainSubtitleEl.textContent = 'Etapa de Creación · Tu Mano Interviene el Sistema';

  if (eraBadgeContainer) eraBadgeContainer.style.display = 'none';
  if (manifestoContainer) manifestoContainer.style.display = 'none';
  if (watchContainer) watchContainer.style.display = 'none';
  if (createHintPanel) createHintPanel.style.display = 'flex';

  audio.setEra(3);
}

function exitCreateStage() {
  isCreateMode = false;
  createStage.isActive = false;

  const meta = ERAS[transitionManager.currentEra];
  document.body.className = meta.className;

  mainTitleEl.textContent = 'Why Bother?';
  mainSubtitleEl.textContent = 'The Generative Rabbit Hole';

  if (eraBadgeContainer) eraBadgeContainer.style.display = 'flex';
  if (manifestoContainer) manifestoContainer.style.display = 'block';
  if (watchContainer) watchContainer.style.display = 'flex';
  if (createHintPanel) createHintPanel.style.display = 'none';

  audio.setEra(transitionManager.currentEra);
}

// Reflection Modal triggers
btnContemplate.addEventListener('click', () => {
  reflectionModal.style.display = 'flex';
});

btnResumeCreating.addEventListener('click', () => {
  reflectionModal.style.display = 'none';
});

btnReturnRabbitHole.addEventListener('click', () => {
  reflectionModal.style.display = 'none';
  exitCreateStage();
});

// Export Canvas Snapshot as PNG
btnDownloadArt.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `WhyBother-GenerativeArt-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Main Animation Loop with Delta-Time
let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;

  ctx.clearRect(0, 0, width, height);

  if (isCreateMode) {
    // --- CREATE STAGE RENDER LOOP ---
    createStage.update(dt, 1.0);
    createStage.render(ctx);
  } else {
    // --- RABBIT HOLE STAGE RENDER LOOP ---
    transitionManager.update(dt);
    const speedMult = transitionManager.tunnelSpeedMultiplier;

    // Dynamic vanishing point with subtle mouse parallax
    const targetCx = width / 2 + mouseTargetX * 22;
    const targetCy = height / 2 + mouseTargetY * 16;
    cx += (targetCx - cx) * Math.min(1.0, dt * 3);
    cy += (targetCy - cy) * Math.min(1.0, dt * 3);

    // Update light waves & tunnels
    lightWaves.update(dt, transitionManager.currentEra, speedMult);
    bookTunnel.update(dt, speedMult);
    movieTunnel.update(dt, speedMult);
    gameTunnel.update(dt, speedMult);

    // Update Alice
    alice.update(dt, speedMult);

    // Update Pocket Watch
    pocketWatch.update(dt);

    // 1. Render active generative rabbit hole tunnel (with morphing support)
    transitionManager.renderTunnels(ctx, width, height, cx, cy);

    // 2. Render radial energy glow waves
    lightWaves.renderRadialGlow(ctx, width, height, cx, cy);

    // 3. Render Alice character with 3D depth perspective
    alice.render(ctx, width, height, cx, cy);

    // 4. Render Pocket Watch on its dedicated canvas
    pocketWatch.render();
  }
}

requestAnimationFrame(animate);


})();
