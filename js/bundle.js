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
    // Additive luminous halo strength (0 = none). Makes fine threads glow.
    this.glow = config.glow || 0;

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

    // Pass 2b: Luminous additive halo for glowing threads
    if (this.glow > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${(mainAlpha * 0.22 * this.glow).toFixed(3)})`;
      ctx.lineWidth = cur.thickness * 3.2 + 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(mainAlpha * 0.18 * this.glow).toFixed(3)})`;
      ctx.lineWidth = Math.max(0.6, cur.thickness * 0.3);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
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
    this.maxStreamers = 6;
    // Words slowly dissolve so the spiral stays legible and alive
    this.textFadeTimer = 0;
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

    if (tier < 0.07) {
      // Rubric red: the red ink of illuminated Victorian chapter openings
      strokeColor = '123, 44, 40';
      strokeWidth = 1.2 + Math.random() * 1.8;
      opacity = 0.7 + Math.random() * 0.25;
    } else if (tier < 0.35) {
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

    // Gentle dissolve of older words (stepped so 8-bit alpha never leaves ghosts)
    this.textFadeTimer += dt * speedMult;
    if (this.textFadeTimer >= 0.22) {
      this.textFadeTimer = 0;
      textCtx.save();
      textCtx.globalCompositeOperation = 'destination-out';
      textCtx.fillStyle = 'rgba(0, 0, 0, 0.11)';
      textCtx.fillRect(0, 0, this.width, this.height);
      textCtx.restore();
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

        const isKeyWord = /^(Alicia|madriguera|conejo|MERMELADA|NARANJA|pozo|cayendo)/i.test(currentWord);
        textCtx.font = `${isKeyWord ? 'italic 700' : '700'} ${isKeyWord ? fontSize + 4 : fontSize}px "IM Fell English", "Cormorant Garamond", "Times New Roman", serif`;
        textCtx.fillStyle = isKeyWord ? '#ffd98a' : '#ffffff'; // white words, gilded key words
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
      isGothic: false,
      // Golden threads and fine turquoise filigrees glow like animation cel highlights
      glow: lineage.type === 'yellow' ? 1.0 : (thickness < 7 && lineage.type !== 'dark' ? 0.6 : 0)
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

    // Soft golden halo breathing around the vanishing point
    const halo = 0.10 + 0.05 * Math.sin(this.time * 1.6);
    const haloGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 170);
    haloGrad.addColorStop(0, `rgba(255, 214, 90, ${halo})`);
    haloGrad.addColorStop(0.5, `rgba(120, 90, 230, ${halo * 0.5})`);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

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
      isGothic: true,
      glow: isStriking ? 0.9 : 0
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

    // Crimson heartbeat pulsing from the abyss (double beat)
    const beatT = (this.time * 1.15) % 1;
    const beat = Math.exp(-Math.pow((beatT - 0.08) * 18, 2)) + 0.7 * Math.exp(-Math.pow((beatT - 0.26) * 18, 2));
    const pulseR = 140 + beat * 60;
    const pulseGrad = ctx.createRadialGradient(cx, cy, 24, cx, cy, pulseR);
    pulseGrad.addColorStop(0, `rgba(220, 30, 70, ${0.10 + beat * 0.22})`);
    pulseGrad.addColorStop(0.6, `rgba(120, 10, 40, ${0.05 + beat * 0.08})`);
    pulseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = pulseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

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

    // Motion trail (afterimages) during falls and dives
    this.trail = [];
    this.trailTimer = 0;
    // Era aura glow colors (Tenniel ink keeps a dark drop shadow)
    this.auraColors = [null, 'rgba(150, 215, 255, 0.85)', 'rgba(225, 30, 75, 0.8)'];

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

    // Record afterimages while moving fast
    const moving = this.isFalling || this.isRetracting;
    this.trailTimer += dt;
    if (moving && this.trailTimer > 0.045) {
      this.trailTimer = 0;
      this.trail.push({
        scale: this.scale, rotation: this.rotation,
        h: this.horizontalOffset, v: this.verticalOffset, alpha: this.alpha
      });
      if (this.trail.length > 6) this.trail.shift();
    } else if (!moving && this.trail.length > 0 && this.trailTimer > 0.05) {
      this.trailTimer = 0;
      this.trail.shift();
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
      this.rotation = Math.sin(this.time * 0.85) * 0.055;
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

    // Target height: 44% of viewport height
    const targetHeight = Math.min(height * 0.44, width * 0.48);
    const aspect = img.naturalWidth / img.naturalHeight;
    const drawWidth = targetHeight * aspect;
    const drawHeight = targetHeight;
    const aura = this.auraColors[this.eraIndex];

    // 1. Afterimage trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const k = (i + 1) / (this.trail.length + 1);
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, t.alpha)) * 0.22 * k;
      ctx.translate(cx + t.h + this.mouseX, cy + t.v + this.mouseY);
      ctx.rotate(t.rotation);
      ctx.scale(t.scale, t.scale);
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }

    // 2. Alice herself
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    const posX = cx + this.horizontalOffset + this.mouseX;
    const posY = cy + this.verticalOffset + this.mouseY;
    ctx.translate(posX, posY);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    if (this.scale > 0.1) {
      if (aura) {
        ctx.shadowColor = aura;
        ctx.shadowBlur = Math.min(42, 30 * this.scale) + Math.sin(this.time * 2) * 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = Math.min(30, 24 * this.scale);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.min(20, 10 * this.scale);
      }
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
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
    this.eraYears = ['1865', '1951', '2011', 'HOY'];
    this.time = 0;
    this.lastTickAngle = 0;
    this.onTick = null;

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
    this.time += dt;
    // Audible tick each time the minute hand sweeps a twelfth while being wound
    if (this.onTick && (this.isPressed || this.isTransitionActive)) {
      const step = Math.PI / 6;
      if (Math.abs(this.minuteAngle - this.lastTickAngle) > step) {
        this.lastTickAngle = this.minuteAngle;
        this.onTick();
      }
    } else {
      this.lastTickAngle = this.minuteAngle;
    }
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

    // 1b. Idle invitation pulse (breathing era-colored halo)
    if (!this.isPressed && !this.isTransitionActive && this.chargeLevel < 0.05) {
      const ph = (this.time % 2.4) / 2.4;
      ctx.save();
      ctx.strokeStyle = `${this.eraColors[this.currentEra]}${0.55 * (1 - ph)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 9 + ph * 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

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
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillStyle = 'rgba(123, 44, 40, 0.85)';
    ctx.fillText(this.eraYears[this.currentEra] || '', cx, cy + 19);

    // Card suits that light up as the watch is wound
    const suits = ['♠', '♥', '♦', '♣'];
    ctx.font = '10px serif';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
      const lit = this.chargeLevel > (i + 1) / 5 || this.isTransitionActive;
      const sx = cx + Math.cos(a) * (r - 30);
      const sy = cy + Math.sin(a) * (r - 30);
      if (lit) {
        ctx.shadowColor = `${this.eraColors[this.currentEra]}1)`;
        ctx.shadowBlur = 8;
        ctx.fillStyle = i === 1 || i === 2 ? '#c8283f' : '#1c150c';
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(90, 70, 40, 0.25)';
      }
      ctx.fillText(suits[i], sx, sy);
    }
    ctx.shadowBlur = 0;
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

    // Live (non-accumulated) sparkle particles and suit glyph bursts
    this.sparkles = [];
    this.glyphs = [];
    this.suits = ['♠', '♥', '♦', '♣'];
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
    this.sparkles = [];
    this.glyphs = [];
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

    const wasDown = this.cursor.isDown;
    this.cursor.isDown = isDown;
    this.cursor.active = true;

    if (isDown && !wasDown) {
      this.burst(x, y);
    }
    // Sparkle trail proportional to cursor speed
    const n = Math.min(6, Math.floor(this.cursor.speed / 6) + (isDown ? 1 : 0));
    for (let i = 0; i < n; i++) this.emitSparkle(x, y, dx * 0.5, dy * 0.5);
  }

  emitSparkle(x, y, vx = 0, vy = 0) {
    if (this.sparkles.length > 260) return;
    const col = this.palette[Math.floor(Math.random() * 9)];
    const a = Math.random() * Math.PI * 2;
    const sp = 20 + Math.random() * 70;
    this.sparkles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: Math.cos(a) * sp + vx * 4,
      vy: Math.sin(a) * sp + vy * 4,
      life: 0,
      maxLife: 0.6 + Math.random() * 0.8,
      size: 1 + Math.random() * 2.6,
      col
    });
  }

  /** Click: a ring of playing-card suits bursts out and a pigment bloom is stamped */
  burst(x, y) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const sp = 120 + Math.random() * 90;
      this.glyphs.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 6,
        life: 0,
        maxLife: 1.1 + Math.random() * 0.5,
        suit: this.suits[i % 4],
        col: this.palette[Math.floor(Math.random() * 9)]
      });
    }
    for (let i = 0; i < 24; i++) this.emitSparkle(x, y);
    const col = this.palette[Math.floor(Math.random() * 9)];
    const grad = this.offCtx.createRadialGradient(x, y, 0, x, y, 90);
    grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0.28)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    this.offCtx.fillStyle = grad;
    this.offCtx.beginPath();
    this.offCtx.arc(x, y, 90, 0, Math.PI * 2);
    this.offCtx.fill();
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
      isGothic: false,
      glow: thickness < 6 ? 0.85 : 0
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
      isGothic: false,
      glow: childThickness < 6 ? 0.7 : 0
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
      this.emergenceAlpha = Math.min(1.0, this.emergenceAlpha + dt * 0.32);
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

    // Live particles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const p = this.sparkles[i];
      p.life += dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life >= p.maxLife) this.sparkles.splice(i, 1);
    }
    for (let i = this.glyphs.length - 1; i >= 0; i--) {
      const g = this.glyphs[i];
      g.life += dt;
      g.vx *= 0.95;
      g.vy *= 0.95;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.rot += g.spin * dt;
      if (g.life >= g.maxLife) this.glyphs.splice(i, 1);
    }
  }

  render(ctx) {
    if (!this.isActive) return;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // Bloom reveal: the rabbit hole widens and lets every color out
    const e = this.emergenceAlpha;
    const eased = 1 - Math.pow(1 - e, 3);
    const maxR = Math.hypot(w, h) * 0.56;

    ctx.save();
    if (e < 1) {
      ctx.fillStyle = '#030205';
      ctx.fillRect(0, 0, w, h);
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, eased * maxR * 1.02), 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(this.offscreenCanvas, 0, 0);
    ctx.restore();

    if (e < 1) {
      // Iridescent rim of the opening
      const R = eased * maxR * 1.02;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const segs = 36;
      for (let i = 0; i < segs; i++) {
        const col = this.palette[i % 9];
        const a0 = (i / segs) * Math.PI * 2 + this.time * 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, R, a0, a0 + (Math.PI * 2) / segs + 0.02);
        ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${0.75 * (1 - e)})`;
        ctx.lineWidth = 3 + 14 * (1 - e);
        ctx.shadowColor = `rgb(${col.r}, ${col.g}, ${col.b})`;
        ctx.shadowBlur = 24;
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Sparkles
    for (const p of this.sparkles) {
      const k = 1 - p.life / p.maxLife;
      const r = p.size * (1 + (1 - k) * 1.5);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      grad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * k})`);
      grad.addColorStop(0.3, `rgba(${p.col.r}, ${p.col.g}, ${p.col.b}, ${0.7 * k})`);
      grad.addColorStop(1, `rgba(${p.col.r}, ${p.col.g}, ${p.col.b}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Suit glyph bursts
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const g of this.glyphs) {
      const k = 1 - g.life / g.maxLife;
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      ctx.font = `${Math.round(18 + (1 - k) * 22)}px serif`;
      ctx.shadowColor = `rgb(${g.col.r}, ${g.col.g}, ${g.col.b})`;
      ctx.shadowBlur = 16;
      ctx.fillStyle = `rgba(${g.col.r}, ${g.col.g}, ${g.col.b}, ${k})`;
      ctx.fillText(g.suit, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // Interactive cursor aura: dashed rotating ring with orbiting suits
    if (!this.isContemplating && this.cursor.active && e > 0.4) {
      const down = this.cursor.isDown;
      const radius = down ? 44 + Math.sin(this.time * 6) * 6 : 26;
      ctx.save();
      ctx.translate(this.cursor.x, this.cursor.y);
      ctx.rotate(this.time * (down ? 2.4 : 0.8));
      ctx.setLineDash([4, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = down ? 'rgba(255, 215, 85, 0.85)' : 'rgba(200, 160, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `${down ? 13 : 10}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.fillStyle = i % 3 === 0 ? 'rgba(240, 236, 255, 0.85)' : 'rgba(255, 92, 138, 0.9)';
        ctx.fillText(this.suits[i], Math.cos(a) * (radius + 9), Math.sin(a) * (radius + 9));
      }
      ctx.restore();
    }
  }
}


// --- js/systems/fx.js ---
/**
 * Post FX & Transition Layer — WHY BOTHER?
 * - Keyhole / circle iris wipes (the tiny door of Wonderland as the gate between eras)
 * - Era-tinted vignette and analogue paper grain
 * - Radial speed lines while diving through the hole
 * - Colored flashes
 * - Synthesized whoosh & chime (WebAudio, no external files)
 */

const ERA_LOOK = {
  // vignette inner/outer, grain amount, rim color for the keyhole
  opening: { vig: 'rgba(6, 4, 10, 0.85)', grain: 0.07, rim: [235, 196, 120] },
  0: { vig: 'rgba(30, 20, 10, 0.55)', grain: 0.11, rim: [235, 196, 120] },
  1: { vig: 'rgba(6, 10, 34, 0.70)', grain: 0.06, rim: [140, 235, 230] },
  2: { vig: 'rgba(14, 0, 6, 0.85)', grain: 0.09, rim: [235, 50, 90] },
  3: { vig: 'rgba(8, 4, 18, 0.55)', grain: 0.05, rim: [255, 215, 90] },
  interlude: { vig: 'rgba(0, 0, 0, 0.80)', grain: 0.07, rim: [235, 196, 120] }
};

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

class PostFX {
  constructor() {
    this.width = 0;
    this.height = 0;

    // Iris: 1 = fully open, 0 = fully closed (black)
    this.iris = 1;
    this.irisTween = null;
    this.irisShape = 'keyhole';
    this.irisRim = [235, 196, 120];

    this.flash = { alpha: 0, color: '255, 255, 255', decay: 2.2 };
    this.speedLines = 0;
    this.look = ERA_LOOK.opening;
    this.time = 0;

    this.maskCanvas = document.createElement('canvas');
    this.maskCtx = this.maskCanvas.getContext('2d');

    // Pre-generated grain tile
    this.grainCanvas = document.createElement('canvas');
    this.grainCanvas.width = 180;
    this.grainCanvas.height = 180;
    const g = this.grainCanvas.getContext('2d');
    const img = g.createImageData(180, 180);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    this.grainPattern = null;

    this.vignetteCache = { key: '', grad: null };
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.maskCanvas.width = width;
    this.maskCanvas.height = height;
    this.vignetteCache.key = '';
  }

  setLook(key) {
    this.look = ERA_LOOK[key] || ERA_LOOK.interlude;
    this.vignetteCache.key = '';
  }

  /**
   * Animate the iris to a target openness.
   * @param {number} to 0 closed .. 1 open
   * @param {number} duration seconds
   * @param {object} opts { shape: 'keyhole'|'circle', delay, from, rim:[r,g,b], onDone }
   */
  irisTo(to, duration = 1.0, opts = {}) {
    if (opts.shape) this.irisShape = opts.shape;
    if (opts.rim) this.irisRim = opts.rim;
    const from = opts.from !== undefined ? opts.from : this.iris;
    this.iris = from;
    this.irisTween = {
      from,
      to,
      duration: Math.max(0.01, duration),
      delay: opts.delay || 0,
      t: 0,
      onDone: opts.onDone || null
    };
  }

  setIris(v) {
    this.iris = v;
    this.irisTween = null;
  }

  triggerFlash(color = '255, 255, 255', alpha = 0.8, decay = 2.2) {
    this.flash.color = color;
    this.flash.alpha = Math.max(this.flash.alpha, alpha);
    this.flash.decay = decay;
  }

  update(dt) {
    this.time += dt;
    if (this.irisTween) {
      const tw = this.irisTween;
      if (tw.delay > 0) {
        tw.delay -= dt;
      } else {
        tw.t += dt;
        const p = Math.min(1, tw.t / tw.duration);
        this.iris = tw.from + (tw.to - tw.from) * easeInOutCubic(p);
        if (p >= 1) {
          this.irisTween = null;
          if (tw.onDone) tw.onDone();
        }
      }
    }
    if (this.flash.alpha > 0) {
      this.flash.alpha = Math.max(0, this.flash.alpha - dt * this.flash.decay);
    }
  }

  // ------------------------------------------------------------------
  // Keyhole path in a local unit (R = scale)
  // ------------------------------------------------------------------
  keyholePath(ctx, cx, cy, R) {
    const headR = R * 0.5;
    const headY = cy - R * 0.32;
    ctx.moveTo(cx + headR, headY);
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.moveTo(cx - R * 0.2, headY + headR * 0.55);
    ctx.lineTo(cx + R * 0.2, headY + headR * 0.55);
    ctx.lineTo(cx + R * 0.46, cy + R * 1.02);
    ctx.quadraticCurveTo(cx, cy + R * 1.1, cx - R * 0.46, cy + R * 1.02);
    ctx.closePath();
  }

  renderIris(ctx, cx, cy) {
    if (this.iris >= 0.999) return;
    const w = this.width;
    const h = this.height;
    const m = this.maskCtx;

    // Keyhole needs a larger scale to cover the screen when fully open
    const diag = Math.hypot(w, h);
    const maxR = this.irisShape === 'keyhole' ? diag * 1.25 : diag * 0.6;
    const R = Math.max(0, this.iris) * maxR;

    m.setTransform(1, 0, 0, 1, 0, 0);
    m.globalCompositeOperation = 'source-over';
    m.clearRect(0, 0, w, h);
    m.fillStyle = '#030205';
    m.fillRect(0, 0, w, h);

    if (R > 0.5) {
      m.globalCompositeOperation = 'destination-out';
      m.beginPath();
      if (this.irisShape === 'keyhole') {
        this.keyholePath(m, cx, cy, R);
      } else {
        m.arc(cx, cy, R, 0, Math.PI * 2);
      }
      m.fill();
    }

    ctx.save();
    ctx.drawImage(this.maskCanvas, 0, 0);

    // Glowing rim around the opening (gold / era tinted)
    if (R > 1 && this.iris < 0.98) {
      const [r, g, b] = this.irisRim;
      const rimAlpha = Math.min(1, (1 - this.iris) * 3) * Math.min(1, this.iris * 12);
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      if (this.irisShape === 'keyhole') {
        this.keyholePath(ctx, cx, cy, R);
      } else {
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
      }
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.9 * rimAlpha})`;
      ctx.shadowBlur = 28;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.85 * rimAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * rimAlpha})`;
      ctx.stroke();
    }
    ctx.restore();
  }

  renderSpeedLines(ctx, cx, cy) {
    if (this.speedLines <= 0.02) return;
    const w = this.width;
    const h = this.height;
    const maxR = Math.hypot(w, h) * 0.75;
    const count = Math.floor(30 + this.speedLines * 70);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r1 = maxR * (0.12 + Math.random() * 0.5);
      const r2 = r1 + maxR * (0.1 + Math.random() * 0.35) * this.speedLines;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      const [r, g, b] = this.look.rim;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.05 + Math.random() * 0.22 * this.speedLines})`;
      ctx.lineWidth = 0.6 + Math.random() * 2.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  renderVignette(ctx, cx, cy) {
    const w = this.width;
    const h = this.height;
    const key = `${Math.round(cx)}_${Math.round(cy)}_${this.look.vig}`;
    if (this.vignetteCache.key !== key) {
      const r = Math.hypot(w, h) * 0.62;
      const g = ctx.createRadialGradient(cx, cy, r * 0.42, cx, cy, r);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, this.look.vig);
      this.vignetteCache = { key, grad: g };
    }
    ctx.save();
    ctx.fillStyle = this.vignetteCache.grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  renderGrain(ctx) {
    if (!this.grainPattern) {
      this.grainPattern = ctx.createPattern(this.grainCanvas, 'repeat');
    }
    if (!this.grainPattern || this.look.grain <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.look.grain;
    ctx.globalCompositeOperation = 'overlay';
    const ox = Math.floor(Math.random() * 180);
    const oy = Math.floor(Math.random() * 180);
    ctx.translate(-ox, -oy);
    ctx.fillStyle = this.grainPattern;
    ctx.fillRect(0, 0, this.width + 180, this.height + 180);
    ctx.restore();
  }

  renderFlash(ctx) {
    if (this.flash.alpha <= 0.002) return;
    ctx.save();
    ctx.fillStyle = `rgba(${this.flash.color}, ${this.flash.alpha})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  /**
   * Final composite pass, called after all scene layers are drawn
   */
  render(ctx, cx, cy) {
    this.renderSpeedLines(ctx, cx, cy);
    this.renderVignette(ctx, cx, cy);
    this.renderGrain(ctx);
    this.renderFlash(ctx);
    this.renderIris(ctx, cx, cy);
  }
}

/**
 * Tiny synthesized sound design layer.
 * Independent of the music <audio> element so it works from file:// too.
 */
class SoundFX {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.noiseBuffer = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) {
      return false;
    }
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? 0.22 : 0;
  }

  whoosh(duration = 1.6, up = true) {
    if (!this.enabled || !this.ensure()) return;
    const c = this.ctx;
    const t0 = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(up ? 220 : 2600, t0);
    bp.frequency.exponentialRampToValueAtTime(up ? 2800 : 180, t0 + duration);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.9, t0 + duration * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  }

  chime(baseFreq = 660) {
    if (!this.enabled || !this.ensure()) return;
    const c = this.ctx;
    const t0 = c.currentTime;
    const notes = [1, 1.25, 1.5, 2];
    notes.forEach((m, i) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = baseFreq * m;
      const g = c.createGain();
      const st = t0 + i * 0.09;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(0.35 / (i + 1), st + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 1.6);
      o.connect(g).connect(this.master);
      o.start(st);
      o.stop(st + 1.7);
    });
  }

  tick() {
    if (!this.enabled || !this.ensure()) return;
    const c = this.ctx;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.value = 1800;
    const g = c.createGain();
    g.gain.setValueAtTime(0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
    o.connect(g).connect(this.master);
    o.start(t0);
    o.stop(t0 + 0.05);
  }
}


// --- js/systems/wonderObjects.js ---
/**
 * Wonder Objects — the things Alice sees on the walls of the well.
 * "...cupboards and book-shelves; here and there maps and pictures hung upon pegs.
 *  She took down a jar... ORANGE MARMALADE..."
 *
 * Procedural vector objects (pocket watches, keys, teacups, playing cards, jars,
 * "BÉBEME" bottles, mushrooms, top hats, books, roses) drawn in the visual
 * language of each era:
 *   ink    → 1865 Tenniel engraving: paper fills, jet-black lines, hatching
 *   toon   → 1951 animation: flat saturated fills, navy cel outline, highlight
 *   gothic → 2011 game: near-black silhouettes with crimson / steel rim light
 *   dream  → CREATE prelude: iridescent fills with golden outline
 *
 * Two motion modes:
 *   'tunnel' → objects fly out of the vanishing point toward the camera (z-depth)
 *   'drift'  → objects float upward past the viewer, as if we keep falling
 */

const WO_TYPES = ['watch', 'key', 'teacup', 'card', 'jar', 'bottle', 'mushroom', 'hat', 'book', 'rose', 'card', 'watch'];
const WO_SUITS = ['♠', '♥', '♦', '♣'];

const WO_TOON_FILLS = ['#ffcf3f', '#35c9c1', '#9b4fd6', '#ff7aa8', '#4f8df0', '#ff9a3c', '#f5f1e6'];
const WO_DREAM_FILLS = ['#b45cff', '#ffd23f', '#3fd6c6', '#ff6fa8', '#6fb6ff', '#c9b2ff'];

function woPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

class WonderObjects {
  constructor(options = {}) {
    this.style = options.style || 'ink';
    this.mode = options.mode || 'tunnel';
    this.maxObjects = options.maxObjects || 14;
    this.objects = [];
    this.time = 0;
    this.spawnTimer = 0;
    this.alpha = 1;
    this.width = 0;
    this.height = 0;
  }

  setStyle(style) {
    this.style = style;
  }

  reset(prefill = true) {
    this.objects = [];
    if (prefill) {
      for (let i = 0; i < this.maxObjects; i++) {
        this.objects.push(this.makeObject(true));
      }
    }
  }

  makeObject(randomDepth = false) {
    const type = woPick(WO_TYPES);
    const o = {
      type,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.6,
      fill: this.style === 'dream' ? woPick(WO_DREAM_FILLS) : woPick(WO_TOON_FILLS),
      suit: woPick(WO_SUITS),
      seed: Math.random()
    };
    if (this.mode === 'tunnel') {
      o.angle = Math.random() * Math.PI * 2;
      o.orbit = (Math.random() - 0.5) * 0.35;
      o.radial = 0.55 + Math.random() * 0.75; // radial distance factor
      o.z = randomDepth ? 0.35 + Math.random() * 3.2 : 3.2 + Math.random() * 0.6;
      o.speed = 0.55 + Math.random() * 0.4;
      o.size = 0.75 + Math.random() * 0.6;
    } else {
      o.x = Math.random();
      o.y = randomDepth ? Math.random() * 1.3 - 0.15 : 1.15 + Math.random() * 0.2;
      o.depth = 0.35 + Math.random() * 0.65; // parallax / size / speed
      o.sway = Math.random() * Math.PI * 2;
      o.size = 0.7 + Math.random() * 0.7;
    }
    return o;
  }

  update(dt, speedMult = 1, width = 0, height = 0) {
    this.time += dt * speedMult;
    if (width) this.width = width;
    if (height) this.height = height;

    while (this.objects.length < this.maxObjects) {
      this.objects.push(this.makeObject(false));
    }

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      o.rot += o.spin * dt * speedMult;
      if (this.mode === 'tunnel') {
        o.z -= o.speed * dt * speedMult * (0.35 + o.z * 0.18);
        o.angle += o.orbit * dt * speedMult;
        if (o.z <= 0.12) {
          this.objects[i] = this.makeObject(false);
        }
      } else {
        o.y -= (0.035 + o.depth * 0.07) * dt * speedMult;
        o.sway += dt * 0.6;
        if (o.y < -0.25) {
          this.objects[i] = this.makeObject(false);
        }
      }
    }
  }

  render(ctx, width, height, cx, cy, alpha = 1) {
    if (alpha <= 0.01) return;
    const unit = Math.min(width, height);

    // Sort far to near
    const list = this.mode === 'tunnel'
      ? this.objects.slice().sort((a, b) => b.z - a.z)
      : this.objects.slice().sort((a, b) => a.depth - b.depth);

    for (const o of list) {
      let x, y, s, a;
      if (this.mode === 'tunnel') {
        const persp = 1 / o.z;
        const R = unit * 0.32 * o.radial * persp;
        x = cx + Math.cos(o.angle) * R;
        y = cy + Math.sin(o.angle) * R;
        s = unit * 0.045 * o.size * persp;
        // fade in from the deep, fade near camera
        const farFade = Math.min(1, (3.6 - o.z) / 1.2);
        const nearFade = Math.min(1, (o.z - 0.12) / 0.25);
        a = Math.max(0, Math.min(farFade, nearFade));
        if (x < -s * 2 || x > width + s * 2 || y < -s * 2 || y > height + s * 2) continue;
      } else {
        x = o.x * width + Math.sin(o.sway) * 30 * o.depth;
        y = o.y * height;
        s = unit * 0.05 * o.size * (0.5 + o.depth);
        a = 0.35 + o.depth * 0.65;
      }
      if (a <= 0.01 || s < 1.5) continue;

      ctx.save();
      ctx.globalAlpha = a * alpha;
      ctx.translate(x, y);
      ctx.rotate(o.rot);
      ctx.scale(s, s);
      this.drawObject(ctx, o, s);
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------
  // Style resolver
  // ------------------------------------------------------------------
  styleFor(o, pxScale) {
    const lw = Math.max(0.025, 1.4 / pxScale);
    switch (this.style) {
      case 'ink':
        return { body: '#fbf8f0', accent: '#e9e0cc', line: '#111014', red: '#7b2c28', lw, hatch: true, glow: null, text: '#111014' };
      case 'toon':
        return { body: o.fill, accent: '#ffffff', line: '#1b2350', red: '#e8344e', lw: lw * 1.3, hatch: false, glow: null, text: '#1b2350', shine: true };
      case 'gothic': {
        const rim = o.seed > 0.55 ? '#e0284f' : (o.seed > 0.25 ? '#7fb8e0' : '#c9b9ec');
        return { body: '#120a14', accent: '#22121f', line: rim, red: '#e0284f', lw: lw * 1.1, hatch: false, glow: rim, text: rim };
      }
      case 'dream':
      default:
        return { body: o.fill, accent: '#ffffff', line: '#ffe08a', red: '#ff5c8a', lw: lw * 1.2, hatch: false, glow: o.fill, text: '#2a1240', shine: true };
    }
  }

  fs(ctx, S, fill = S.body) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = S.lw;
    ctx.strokeStyle = S.line;
    ctx.stroke();
  }

  hatch(ctx, S, x0, y0, x1, y1, n = 5) {
    if (!S.hatch) return;
    ctx.save();
    ctx.lineWidth = S.lw * 0.6;
    ctx.strokeStyle = 'rgba(17, 16, 20, 0.7)';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      ctx.beginPath();
      ctx.moveTo(x0 + (x1 - x0) * t, y0);
      ctx.lineTo(x0 + (x1 - x0) * t - 0.18, y1);
      ctx.stroke();
    }
    ctx.restore();
  }

  shine(ctx, S, x, y, rx, ry) {
    if (!S.shine) return;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Canvas text at tiny unit sizes is unreliable, so draw it at 100x and scale down
  label(ctx, text, x, y, size, weight = 'bold', family = 'Georgia, serif') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.01, 0.01);
    ctx.font = `${weight} ${Math.round(size * 100)}px ${family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  drawObject(ctx, o, pxScale) {
    const S = this.styleFor(o, pxScale);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const big = pxScale > 16;
    if (!big) {
      // small, far objects: no shadows (cheap)
    } else if (S.glow) {
      ctx.shadowColor = S.glow;
      ctx.shadowBlur = 14;
    } else if (this.style === 'ink') {
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
    } else if (this.style === 'toon') {
      ctx.shadowColor = 'rgba(10, 14, 40, 0.45)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
    }
    const detail = pxScale > 14;
    switch (o.type) {
      case 'watch': this.drawWatch(ctx, S, detail); break;
      case 'key': this.drawKey(ctx, S); break;
      case 'teacup': this.drawTeacup(ctx, S, detail); break;
      case 'card': this.drawCard(ctx, S, o, detail); break;
      case 'jar': this.drawJar(ctx, S, detail, pxScale); break;
      case 'bottle': this.drawBottle(ctx, S, detail, pxScale); break;
      case 'mushroom': this.drawMushroom(ctx, S); break;
      case 'hat': this.drawHat(ctx, S, detail, pxScale); break;
      case 'book': this.drawBook(ctx, S); break;
      case 'rose': this.drawRose(ctx, S); break;
      default: this.drawWatch(ctx, S, detail);
    }
  }

  // ------------------------------------------------------------------
  // Shapes (unit space ~[-1, 1])
  // ------------------------------------------------------------------
  drawWatch(ctx, S, detail) {
    // chain loop + crown
    ctx.beginPath();
    ctx.arc(0, -1.08, 0.2, 0, Math.PI * 2);
    ctx.lineWidth = S.lw * 1.4;
    ctx.strokeStyle = S.line;
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(-0.12, -0.98, 0.24, 0.2);
    this.fs(ctx, S, this.style === 'ink' ? S.accent : (this.style === 'gothic' ? S.accent : '#ffcf3f'));
    // case
    ctx.beginPath();
    ctx.arc(0, 0, 0.82, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'toon' ? '#ffcf3f' : (this.style === 'dream' ? '#ffd23f' : S.accent));
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // face
    ctx.beginPath();
    ctx.arc(0, 0, 0.66, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'gothic' ? '#1c1220' : '#fbf6e8');
    if (detail) {
      ctx.lineWidth = S.lw * 0.8;
      ctx.strokeStyle = S.line;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 0.52, Math.sin(a) * 0.52);
        ctx.lineTo(Math.cos(a) * 0.6, Math.sin(a) * 0.6);
        ctx.stroke();
      }
    }
    const t = this.time;
    ctx.lineWidth = S.lw * 1.4;
    ctx.strokeStyle = this.style === 'gothic' ? S.line : '#111014';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(t * 2.4) * 0.45, Math.sin(t * 2.4) * 0.45);
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(t * 0.3 - 1) * 0.3, Math.sin(t * 0.3 - 1) * 0.3);
    ctx.stroke();
    this.shine(ctx, S, -0.3, -0.35, 0.18, 0.08);
  }

  drawKey(ctx, S) {
    ctx.beginPath();
    // bow (ornate ring)
    ctx.arc(-0.62, 0, 0.36, 0, Math.PI * 2);
    ctx.moveTo(-0.62 + 0.16, 0);
    ctx.arc(-0.62, 0, 0.16, 0, Math.PI * 2, true);
    // shaft
    ctx.rect(-0.28, -0.08, 1.2, 0.16);
    // bits
    ctx.rect(0.62, 0.08, 0.1, 0.28);
    ctx.rect(0.8, 0.08, 0.1, 0.2);
    ctx.fillStyle = this.style === 'toon' ? '#ffcf3f' : (this.style === 'dream' ? '#ffd23f' : S.body);
    ctx.fill('evenodd');
    ctx.lineWidth = S.lw;
    ctx.strokeStyle = S.line;
    ctx.stroke();
  }

  drawTeacup(ctx, S, detail) {
    // saucer
    ctx.beginPath();
    ctx.ellipse(0, 0.62, 0.95, 0.2, 0, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'toon' ? '#f5f1e6' : S.accent);
    // handle
    ctx.beginPath();
    ctx.ellipse(0.72, 0.02, 0.26, 0.22, 0, 0, Math.PI * 2);
    ctx.lineWidth = S.lw * 3;
    ctx.strokeStyle = S.line;
    ctx.stroke();
    // cup
    ctx.beginPath();
    ctx.moveTo(-0.75, -0.35);
    ctx.lineTo(0.75, -0.35);
    ctx.bezierCurveTo(0.72, 0.3, 0.45, 0.58, 0, 0.58);
    ctx.bezierCurveTo(-0.45, 0.58, -0.72, 0.3, -0.75, -0.35);
    ctx.closePath();
    this.fs(ctx, S);
    // rim / tea
    ctx.beginPath();
    ctx.ellipse(0, -0.35, 0.75, 0.13, 0, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'gothic' ? '#3a0a16' : '#b9773a');
    if (detail) {
      ctx.beginPath();
      ctx.moveTo(-0.6, 0.0);
      ctx.bezierCurveTo(-0.3, 0.12, 0.3, 0.12, 0.6, 0.0);
      ctx.lineWidth = S.lw;
      ctx.strokeStyle = S.red;
      ctx.stroke();
    }
    this.hatch(ctx, S, 0.2, -0.2, 0.6, 0.45, 4);
    this.shine(ctx, S, -0.45, -0.08, 0.1, 0.22);
  }

  drawCard(ctx, S, o, detail) {
    const w = 0.66;
    const h = 0.95;
    const r = 0.1;
    ctx.beginPath();
    ctx.moveTo(-w + r, -h);
    ctx.lineTo(w - r, -h);
    ctx.quadraticCurveTo(w, -h, w, -h + r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(-w + r, h);
    ctx.quadraticCurveTo(-w, h, -w, h - r);
    ctx.lineTo(-w, -h + r);
    ctx.quadraticCurveTo(-w, -h, -w + r, -h);
    ctx.closePath();
    const face = this.style === 'gothic' ? '#140b16' : '#fdfaf2';
    this.fs(ctx, S, face);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const isRed = o.suit === '♥' || o.suit === '♦';
    const suitCol = this.style === 'gothic'
      ? (isRed ? '#e0284f' : '#c9b9ec')
      : (isRed ? (this.style === 'ink' ? '#7b2c28' : '#e8344e') : '#111014');
    ctx.fillStyle = suitCol;
    this.label(ctx, o.suit, 0, 0.06, 1.1, 'normal', 'serif');
    if (detail) {
      this.label(ctx, o.suit, -0.47, -0.7, 0.32, 'normal', 'serif');
      this.label(ctx, o.suit, 0.47, 0.7, 0.32, 'normal', 'serif');
      ctx.lineWidth = S.lw * 0.6;
      ctx.strokeStyle = suitCol;
      ctx.strokeRect(-w + 0.12, -h + 0.12, (w - 0.12) * 2, (h - 0.12) * 2);
    }
  }

  drawJar(ctx, S, detail, px) {
    // lid
    ctx.beginPath();
    ctx.rect(-0.5, -0.95, 1.0, 0.22);
    this.fs(ctx, S, this.style === 'toon' ? '#ff9a3c' : S.accent);
    // body
    ctx.beginPath();
    ctx.moveTo(-0.46, -0.73);
    ctx.lineTo(0.46, -0.73);
    ctx.quadraticCurveTo(0.7, -0.6, 0.66, -0.2);
    ctx.lineTo(0.62, 0.78);
    ctx.quadraticCurveTo(0.6, 0.95, 0.4, 0.95);
    ctx.lineTo(-0.4, 0.95);
    ctx.quadraticCurveTo(-0.6, 0.95, -0.62, 0.78);
    ctx.lineTo(-0.66, -0.2);
    ctx.quadraticCurveTo(-0.7, -0.6, -0.46, -0.73);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'gothic' ? '#120a14' : (this.style === 'ink' ? '#fbf8f0' : 'rgba(255, 245, 225, 0.85)'));
    // label
    ctx.beginPath();
    ctx.rect(-0.56, -0.18, 1.12, 0.5);
    this.fs(ctx, S, this.style === 'gothic' ? '#1f1018' : '#fdf3dc');
    if (detail && px > 22) {
      ctx.fillStyle = S.text;
      this.label(ctx, 'MERMELADA', 0, -0.02, 0.15);
      this.label(ctx, 'de naranja', 0, 0.17, 0.13, 'italic');
    }
    this.hatch(ctx, S, 0.25, 0.4, 0.55, 0.9, 4);
    this.shine(ctx, S, -0.4, -0.45, 0.07, 0.18);
  }

  drawBottle(ctx, S, detail, px) {
    ctx.beginPath();
    ctx.moveTo(-0.14, -0.98);
    ctx.lineTo(0.14, -0.98);
    ctx.lineTo(0.14, -0.55);
    ctx.quadraticCurveTo(0.55, -0.4, 0.55, 0.0);
    ctx.lineTo(0.55, 0.85);
    ctx.quadraticCurveTo(0.55, 0.98, 0.4, 0.98);
    ctx.lineTo(-0.4, 0.98);
    ctx.quadraticCurveTo(-0.55, 0.98, -0.55, 0.85);
    ctx.lineTo(-0.55, 0.0);
    ctx.quadraticCurveTo(-0.55, -0.4, -0.14, -0.55);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'toon' ? '#4f8df0' : (this.style === 'dream' ? S.body : S.body));
    // tag on a string
    ctx.beginPath();
    ctx.moveTo(0.1, -0.6);
    ctx.lineTo(0.62, -0.25);
    ctx.lineWidth = S.lw * 0.7;
    ctx.strokeStyle = S.line;
    ctx.stroke();
    ctx.save();
    ctx.translate(0.72, -0.05);
    ctx.rotate(0.35);
    ctx.beginPath();
    ctx.rect(-0.3, -0.18, 0.6, 0.36);
    this.fs(ctx, S, this.style === 'gothic' ? '#1f1018' : '#fdf3dc');
    if (detail && px > 22) {
      ctx.fillStyle = S.text;
      this.label(ctx, 'BÉBEME', 0, 0.01, 0.12);
    }
    ctx.restore();
    this.shine(ctx, S, -0.3, 0.1, 0.07, 0.3);
  }

  drawMushroom(ctx, S) {
    // stem
    ctx.beginPath();
    ctx.moveTo(-0.22, 0.0);
    ctx.quadraticCurveTo(-0.3, 0.7, -0.25, 0.95);
    ctx.lineTo(0.25, 0.95);
    ctx.quadraticCurveTo(0.3, 0.7, 0.22, 0.0);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'gothic' ? '#1c1220' : '#f5ecd8');
    // cap
    ctx.beginPath();
    ctx.moveTo(-0.95, 0.05);
    ctx.bezierCurveTo(-0.95, -0.9, 0.95, -0.9, 0.95, 0.05);
    ctx.quadraticCurveTo(0, 0.22, -0.95, 0.05);
    ctx.closePath();
    const capCol = this.style === 'toon' ? '#e8344e' : (this.style === 'ink' ? S.body : S.body);
    this.fs(ctx, S, capCol);
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.style === 'gothic' ? S.line : (this.style === 'ink' ? '#111014' : '#ffffff');
    [[-0.45, -0.3, 0.12], [0.15, -0.5, 0.1], [0.55, -0.2, 0.09], [-0.1, -0.15, 0.07]].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    this.hatch(ctx, S, -0.15, 0.2, 0.2, 0.9, 4);
  }

  drawHat(ctx, S, detail, px) {
    // brim
    ctx.beginPath();
    ctx.ellipse(0, 0.65, 0.98, 0.22, 0, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'toon' ? '#3f8a4f' : S.body);
    // crown
    ctx.beginPath();
    ctx.moveTo(-0.55, 0.62);
    ctx.lineTo(-0.66, -0.85);
    ctx.quadraticCurveTo(0, -1.02, 0.66, -0.85);
    ctx.lineTo(0.55, 0.62);
    ctx.quadraticCurveTo(0, 0.74, -0.55, 0.62);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'toon' ? '#3f8a4f' : S.body);
    // band
    ctx.beginPath();
    ctx.moveTo(-0.6, 0.2);
    ctx.quadraticCurveTo(0, 0.32, 0.6, 0.2);
    ctx.lineTo(0.58, 0.45);
    ctx.quadraticCurveTo(0, 0.56, -0.58, 0.45);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'gothic' ? S.line : S.red);
    // the famous price tag
    ctx.save();
    ctx.translate(0.32, 0.05);
    ctx.rotate(0.18);
    ctx.beginPath();
    ctx.rect(-0.18, -0.14, 0.36, 0.26);
    this.fs(ctx, S, '#fdf3dc');
    if (detail && px > 22) {
      ctx.fillStyle = '#111014';
      this.label(ctx, '10/6', 0, 0, 0.12);
    }
    ctx.restore();
    this.hatch(ctx, S, 0.25, -0.7, 0.55, 0.15, 5);
  }

  drawBook(ctx, S) {
    ctx.beginPath();
    ctx.rect(-0.62, -0.88, 1.24, 1.76);
    this.fs(ctx, S, this.style === 'toon' ? '#9b4fd6' : (this.style === 'ink' ? '#efe6d2' : S.body));
    ctx.beginPath();
    ctx.rect(-0.62, -0.88, 0.22, 1.76);
    this.fs(ctx, S, this.style === 'gothic' ? S.accent : S.red);
    ctx.shadowBlur = 0;
    ctx.lineWidth = S.lw * 0.8;
    ctx.strokeStyle = this.style === 'ink' ? S.line : '#ffe08a';
    ctx.beginPath();
    ctx.moveTo(-0.2, -0.45);
    ctx.lineTo(0.45, -0.45);
    ctx.moveTo(-0.2, -0.3);
    ctx.lineTo(0.3, -0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0.12, 0.25, 0.22, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawRose(ctx, S) {
    // stem + leaf
    ctx.beginPath();
    ctx.moveTo(0, 0.25);
    ctx.quadraticCurveTo(0.1, 0.6, -0.05, 1.0);
    ctx.lineWidth = S.lw * 1.6;
    ctx.strokeStyle = this.style === 'gothic' ? '#3b5a4a' : '#2f7a46';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0.2, 0.62, 0.22, 0.09, -0.6, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'gothic' ? '#16241c' : '#3fa35a');
    // bloom: painted red (or half painted, white beneath)
    const red = this.style === 'ink' ? '#7b2c28' : (this.style === 'gothic' ? '#b0183a' : '#e8344e');
    ctx.beginPath();
    ctx.arc(0, -0.1, 0.48, 0, Math.PI * 2);
    this.fs(ctx, S, red);
    ctx.shadowBlur = 0;
    ctx.lineWidth = S.lw;
    ctx.strokeStyle = this.style === 'ink' ? '#111014' : 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    for (let i = 0; i < 26; i++) {
      const a = i * 0.55;
      const r = 0.04 + i * 0.016;
      const x = Math.cos(a) * r;
      const y = -0.1 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}


// --- js/systems/tunnelRings.js ---
/**
 * Tunnel Rings — live perspective rings that rush toward the camera,
 * giving each rabbit hole real depth and speed on top of the painted layer.
 *
 *  ink    (1865) → engraved double rules with hatching ticks and bookshelf
 *                  segments (the cupboards and shelves on the walls of the well)
 *  toon   (1951) → scalloped candy rings in turquoise / violet / gold with
 *                  pearls and twinkling stars, additive glow
 *  gothic (2011) → jagged thorn rings in wine and steel, crimson glints
 */

const TOON_COLS = [
  [64, 224, 214],
  [176, 92, 236],
  [255, 214, 72],
  [255, 122, 168],
  [110, 170, 255]
];

class TunnelRings {
  constructor(style = 'ink') {
    this.style = style;
    this.rings = [];
    this.count = 14;
    this.time = 0;
    this.stars = [];
  }

  reset() {
    this.rings = [];
    for (let i = 0; i < this.count; i++) {
      this.rings.push(this.makeRing(0.25 + (i / this.count) * 3.4));
    }
    this.stars = [];
  }

  makeRing(z) {
    return {
      z,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      kind: Math.random(),
      col: TOON_COLS[Math.floor(Math.random() * TOON_COLS.length)],
      lobes: 10 + Math.floor(Math.random() * 10),
      seed: Math.random() * 1000
    };
  }

  update(dt, speedMult = 1) {
    if (this.rings.length === 0) this.reset();
    this.time += dt * speedMult;
    for (let i = 0; i < this.rings.length; i++) {
      const r = this.rings[i];
      r.z -= dt * speedMult * (0.22 + r.z * 0.14);
      r.rot += r.spin * dt * speedMult * (this.style === 'gothic' ? -1.4 : 1);
      if (r.z <= 0.18) {
        this.rings[i] = this.makeRing(3.6 + Math.random() * 0.3);
      }
    }

    if (this.style === 'toon') {
      if (Math.random() < dt * 14 * speedMult) {
        this.stars.push({
          a: Math.random() * Math.PI * 2,
          z: 3.4,
          life: 0,
          size: 0.6 + Math.random() * 1.2,
          col: TOON_COLS[Math.floor(Math.random() * TOON_COLS.length)]
        });
      }
      for (let i = this.stars.length - 1; i >= 0; i--) {
        const s = this.stars[i];
        s.z -= dt * speedMult * (0.3 + s.z * 0.2);
        s.life += dt;
        if (s.z <= 0.2) this.stars.splice(i, 1);
      }
    }
  }

  render(ctx, width, height, cx, cy, alpha = 1) {
    if (alpha <= 0.01) return;
    const unit = Math.min(width, height);
    const hw = width / 2;
    const hh = height / 2;
    const sorted = this.rings.slice().sort((a, b) => b.z - a.z);

    ctx.save();
    for (const ring of sorted) {
      const persp = 1 / ring.z;
      const R = unit * 0.16 * persp;
      // Curved-tunnel parallax: far rings sit at the vanishing point, near rings at screen center
      const k = Math.min(1, 0.28 / ring.z);
      const rx = cx + (hw - cx) * k;
      const ry = cy + (hh - cy) * k;
      const farFade = Math.min(1, (3.7 - ring.z) / 1.0);
      const nearFade = Math.min(1, (ring.z - 0.18) / 0.35);
      const a = Math.max(0, Math.min(farFade, nearFade)) * alpha;
      if (a <= 0.01) continue;

      if (this.style === 'ink') this.drawInk(ctx, rx, ry, R, ring, a, persp);
      else if (this.style === 'toon') this.drawToon(ctx, rx, ry, R, ring, a, persp);
      else this.drawGothic(ctx, rx, ry, R, ring, a, persp);
    }

    if (this.style === 'toon') this.drawStars(ctx, width, height, cx, cy, alpha);
    ctx.restore();
  }

  drawInk(ctx, x, y, R, ring, a, persp) {
    const lw = Math.max(0.6, persp * 0.9);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = `rgba(14, 12, 16, ${0.55 * a})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = lw * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, R * 1.035, 0, Math.PI * 2);
    ctx.stroke();

    if (ring.kind < 0.45) {
      // bookshelf band: books of varied height pointing inward (two batched paths)
      const n = 70;
      ctx.lineWidth = Math.max(0.5, persp * 0.6);
      const black = new Path2D();
      const red = new Path2D();
      for (let i = 0; i < n; i++) {
        if (Math.sin(ring.seed * 3 + i) > 0.82) continue;
        const t = ring.rot + (i / n) * Math.PI * 2;
        const hgt = R * (0.06 + 0.07 * Math.abs(Math.sin(ring.seed + i * 1.7)));
        const c = Math.cos(t);
        const s = Math.sin(t);
        const path = Math.sin(ring.seed + i * 2.3) > 0.9 ? red : black;
        path.moveTo(x + c * R, y + s * R);
        path.lineTo(x + c * (R - hgt), y + s * (R - hgt));
      }
      ctx.strokeStyle = `rgba(14, 12, 16, ${0.6 * a})`;
      ctx.stroke(black);
      ctx.strokeStyle = `rgba(123, 44, 40, ${0.8 * a})`;
      ctx.stroke(red);
    } else {
      // engraved hatching ticks
      const n = 48;
      ctx.lineWidth = Math.max(0.4, persp * 0.45);
      ctx.strokeStyle = `rgba(14, 12, 16, ${0.45 * a})`;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const t = ring.rot + (i / n) * Math.PI * 2;
        const c = Math.cos(t);
        const s = Math.sin(t);
        ctx.moveTo(x + c * R, y + s * R);
        ctx.lineTo(x + Math.cos(t + 0.04) * R * 1.06, y + Math.sin(t + 0.04) * R * 1.06);
      }
      ctx.stroke();
    }
  }

  drawToon(ctx, x, y, R, ring, a, persp) {
    const [r, g, b] = ring.col;
    const lobes = ring.lobes;
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    const steps = lobes * 8;
    for (let i = 0; i <= steps; i++) {
      const t = ring.rot + (i / steps) * Math.PI * 2;
      const scallop = 1 + 0.045 * Math.abs(Math.sin((i / steps) * Math.PI * lobes));
      const px = x + Math.cos(t) * R * scallop;
      const py = y + Math.sin(t) * R * scallop;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.38 * a})`;
    ctx.lineWidth = Math.max(1, persp * 3.2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 * a})`;
    ctx.lineWidth = Math.max(0.5, persp * 0.9);
    ctx.stroke();

    // pearls on the lobe tips
    if (ring.kind > 0.4) {
      ctx.fillStyle = `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, ${0.55 * a})`;
      const pr = Math.max(0.8, persp * 2.2);
      for (let i = 0; i < lobes; i++) {
        const t = ring.rot + ((i + 0.5) / lobes) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(t) * R * 1.045, y + Math.sin(t) * R * 1.045, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawGothic(ctx, x, y, R, ring, a, persp) {
    const n = 64;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const t = ring.rot + (i / n) * Math.PI * 2;
      const thorn = i % 4 === 0 ? 1.07 + 0.05 * Math.sin(ring.seed + i) : 1.0;
      const px = x + Math.cos(t) * R * thorn;
      const py = y + Math.sin(t) * R * thorn;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const isSteel = ring.kind > 0.7;
    ctx.strokeStyle = isSteel ? `rgba(110, 170, 210, ${0.32 * a})` : `rgba(150, 18, 44, ${0.5 * a})`;
    ctx.lineWidth = Math.max(0.8, persp * 1.8);
    ctx.stroke();

    // crimson glints that slide around the ring
    ctx.globalCompositeOperation = 'lighter';
    const gl = 3;
    for (let i = 0; i < gl; i++) {
      const t = ring.rot * 3 + this.time * 0.6 + (i / gl) * Math.PI * 2 + ring.seed;
      const gx = x + Math.cos(t) * R;
      const gy = y + Math.sin(t) * R;
      const gr = Math.max(2, persp * 9);
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      grad.addColorStop(0, `rgba(255, 70, 110, ${0.55 * a})`);
      grad.addColorStop(1, 'rgba(255, 70, 110, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawStars(ctx, width, height, cx, cy, alpha) {
    const unit = Math.min(width, height);
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.stars) {
      const persp = 1 / s.z;
      const R = unit * 0.22 * persp;
      const x = cx + Math.cos(s.a) * R;
      const y = cy + Math.sin(s.a) * R;
      const size = s.size * persp * 2.4;
      const tw = 0.6 + 0.4 * Math.sin(s.life * 9 + s.a * 5);
      const a = Math.min(1, (3.4 - s.z) * 1.5) * tw * alpha;
      const [r, g, b] = s.col;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.85 * a})`;
      ctx.lineWidth = Math.max(0.6, size * 0.25);
      ctx.beginPath();
      ctx.moveTo(x - size * 2, y);
      ctx.lineTo(x + size * 2, y);
      ctx.moveTo(x, y - size * 2);
      ctx.lineTo(x, y + size * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * a})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, size * 0.45), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}


// --- js/systems/interludeScene.js ---
/**
 * Interlude Scene — the space between eras.
 * Replaces the flat black screen behind the narrative phrases with a living,
 * slowly turning rabbit-hole spiral, Wonderland objects drifting upward as we
 * keep falling, glowing dust, and a huge ghostly year that marks the time jump.
 *
 * Themes:
 *   opening → warm dusk before the fall (paper cut-outs, golden dust)
 *   1       → toward 1951: midnight blue spiral, gold & turquoise, toon objects
 *   2       → toward 2011: blackened wine spiral, crimson embers, gothic objects
 *   3       → toward CREATE: iridescent violet spiral, every color at once
 */

const THEMES = {
  opening: {
    bgIn: '#1a1220', bgOut: '#06040a',
    armA: 'rgba(235, 196, 120, 0.035)', armB: 'rgba(0, 0, 0, 0.0)',
    dust: [[255, 214, 140], [255, 240, 210]],
    style: 'ink', year: '', objAlpha: 0.55, objects: 9
  },
  1: {
    bgIn: '#18245a', bgOut: '#04061a',
    armA: 'rgba(70, 120, 230, 0.10)', armB: 'rgba(255, 210, 80, 0.035)',
    dust: [[255, 214, 72], [100, 230, 220], [200, 160, 255]],
    style: 'toon', year: '1951', objAlpha: 0.8, objects: 12
  },
  2: {
    bgIn: '#2a0612', bgOut: '#020103',
    armA: 'rgba(160, 20, 50, 0.10)', armB: 'rgba(90, 140, 190, 0.035)',
    dust: [[230, 40, 80], [140, 190, 230]],
    style: 'gothic', year: '2011', objAlpha: 0.85, objects: 11
  },
  3: {
    bgIn: '#2b0f4a', bgOut: '#05020c',
    armA: 'rgba(180, 90, 255, 0.10)', armB: 'rgba(255, 210, 80, 0.05)',
    dust: [[180, 92, 255], [255, 210, 63], [63, 214, 198], [255, 111, 168]],
    style: 'dream', year: 'HOY', objAlpha: 0.8, objects: 12
  }
};

class InterludeScene {
  constructor() {
    this.theme = THEMES.opening;
    this.themeKey = 'opening';
    this.time = 0;
    this.alpha = 0;
    this.targetAlpha = 0;
    this.objects = new WonderObjects({ style: 'ink', mode: 'drift', maxObjects: 10 });
    this.dust = [];
    this.pulse = 0;
  }

  setTheme(key) {
    this.themeKey = key;
    this.theme = THEMES[key] || THEMES.opening;
    this.objects.setStyle(this.theme.style);
    this.objects.maxObjects = this.theme.objects;
    this.objects.reset(true);
    this.dust = [];
    for (let i = 0; i < 90; i++) this.dust.push(this.makeDust(true));
  }

  show(key) {
    this.setTheme(key);
    this.alpha = 0;
    this.targetAlpha = 1;
  }

  hide() {
    this.targetAlpha = 0;
  }

  /** Called on every phrase change for a small breathing accent */
  bump() {
    this.pulse = 1;
  }

  makeDust(randomY = false) {
    const cols = this.theme.dust;
    return {
      x: Math.random(),
      y: randomY ? Math.random() : 1.05,
      r: 0.6 + Math.random() * 2.2,
      v: 0.01 + Math.random() * 0.035,
      ph: Math.random() * Math.PI * 2,
      col: cols[Math.floor(Math.random() * cols.length)]
    };
  }

  update(dt, width, height) {
    this.time += dt;
    this.alpha += (this.targetAlpha - this.alpha) * Math.min(1, dt * 1.6);
    this.pulse = Math.max(0, this.pulse - dt * 1.2);
    if (this.alpha < 0.002 && this.targetAlpha === 0) return;
    this.objects.update(dt, 1, width, height);
    for (let i = 0; i < this.dust.length; i++) {
      const d = this.dust[i];
      d.y -= d.v * dt;
      d.ph += dt;
      if (d.y < -0.05) this.dust[i] = this.makeDust(false);
    }
  }

  isVisible() {
    return this.alpha > 0.002;
  }

  render(ctx, width, height, cx, cy) {
    if (!this.isVisible()) return;
    const T = this.theme;
    const a = this.alpha;
    const maxR = Math.hypot(width, height) * 0.75;

    ctx.save();
    ctx.globalAlpha = a;

    // 1. Deep radial ground
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    bg.addColorStop(0, T.bgIn);
    bg.addColorStop(1, T.bgOut);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Hypnotic twisting spiral arms (the hole keeps turning)
    const arms = 10;
    const twist = 0.0062;
    const rot = this.time * 0.12;
    for (let k = 0; k < arms; k++) {
      const base = rot + (k / arms) * Math.PI * 2;
      const span = (Math.PI * 2) / arms / 2;
      ctx.beginPath();
      const steps = 46;
      for (let i = 0; i <= steps; i++) {
        const r = (i / steps) * maxR;
        const th = base + r * twist;
        const px = cx + Math.cos(th) * r;
        const py = cy + Math.sin(th) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      for (let i = steps; i >= 0; i--) {
        const r = (i / steps) * maxR;
        const th = base + span + r * twist;
        ctx.lineTo(cx + Math.cos(th) * r, cy + Math.sin(th) * r);
      }
      ctx.closePath();
      ctx.fillStyle = k % 2 === 0 ? T.armA : T.armB;
      ctx.fill();
    }

    // 3. Ghostly giant year
    if (T.year) {
      const fs = Math.min(width * 0.36, height * 0.62);
      ctx.save();
      ctx.translate(cx, cy + Math.sin(this.time * 0.5) * 6);
      ctx.font = `900 ${Math.round(fs)}px "Cinzel", "Times New Roman", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const breathe = 0.05 + this.pulse * 0.05;
      ctx.fillStyle = `rgba(255, 255, 255, ${breathe})`;
      ctx.fillText(T.year, 0, 0);
      ctx.lineWidth = 1.2;
      const c = T.dust[0];
      ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.16 + this.pulse * 0.2})`;
      ctx.strokeText(T.year, 0, 0);
      ctx.restore();
    }

    // 4. Drifting Wonderland objects
    this.objects.render(ctx, width, height, cx, cy, T.objAlpha * a);

    // 5. Glowing dust motes
    ctx.globalCompositeOperation = 'lighter';
    for (const d of this.dust) {
      const x = d.x * width + Math.sin(d.ph * 0.7) * 14;
      const y = d.y * height;
      const tw = 0.45 + 0.55 * Math.sin(d.ph * 2.2);
      const [r, g, b] = d.col;
      const rad = d.r * 3;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.7 * tw * a})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // 6. Center darkness so the text breathes
    const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.55);
    vg.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
    vg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);

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
 *
 * Every world opens through a keyhole (the tiny door Alice finds at the bottom of
 * the well) and every forward exit is a dive deeper into the hole: the camera
 * plunges, the scene zoom-blurs, speed lines streak and the keyhole closes.
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
const cinematicKicker = document.getElementById('cinematic-kicker');
const cinematicProgress = document.getElementById('cinematic-progress');

// Era HUD & sound toggle
const eraHud = document.getElementById('era-hud');
const soundToggle = document.getElementById('sound-toggle');

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
const fx = new PostFX();
const sfx = new SoundFX();
const interlude = new InterludeScene();

// Chapter metadata shown in the HUD and above the interlude phrases
const ERA_INFO = [
  { num: 'I', year: '1865', label: 'El libro' },
  { num: 'II', year: '1951', label: 'La animación' },
  { num: 'III', year: '2011', label: 'El videojuego' },
  { num: 'IV', year: 'Hoy', label: 'Tu madriguera' }
];
const SUITS = ['♠', '♥', '♦', '♣'];

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

  setMuted(m) {
    this.bgMusic.muted = m;
  }

  start() {
    sfx.ensure();
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
    this.isTransitioning = true;

    // Progress pips: one playing-card suit per phrase
    cinematicProgress.innerHTML = this.phrases
      .map((_, i) => `<span class="pip" data-i="${i}">${SUITS[i % 4]}</span>`)
      .join('');

    cinematicOverlay.style.display = 'flex';
    cinematicOverlay.classList.remove('leaving');
    requestAnimationFrame(() => cinematicOverlay.classList.add('shown'));
    setTimeout(() => this.showCurrentPhrase(), 650);
  }

  renderPhrase(text) {
    const words = text.split(/\s+/);
    const isLeitmotif = /madriguera/.test(text) && /momento más tarde/.test(text);
    const isQuestion = /^¿/.test(text);
    const isShort = text.length < 40;
    cinematicPhraseText.className = 'cinematic-phrase-text' +
      (isLeitmotif ? ' leitmotif' : '') + (isQuestion ? ' question' : '') + (isShort && !isQuestion ? ' short' : '');
    const stagger = Math.max(0.018, Math.min(0.07, 1.6 / words.length));
    cinematicPhraseText.innerHTML = words
      .map((w, i) => `<span class="w" style="--d:${(i * stagger).toFixed(3)}s">${w}</span>`)
      .join(' ');
  }

  updatePips() {
    cinematicProgress.querySelectorAll('.pip').forEach((el, i) => {
      el.classList.toggle('done', i < this.currentIndex);
      el.classList.toggle('current', i === this.currentIndex);
    });
  }

  showCurrentPhrase() {
    if (this.currentIndex >= this.phrases.length) {
      this.finish();
      return;
    }

    const text = this.phrases[this.currentIndex];
    cinematicPhraseText.classList.remove('visible');

    setTimeout(() => {
      this.renderPhrase(text);
      this.updatePips();
      interlude.bump();
      // force reflow so the word animation restarts
      void cinematicPhraseText.offsetWidth;
      cinematicPhraseText.classList.add('visible');
      this.isTransitioning = false;
    }, 260);
  }

  advance() {
    if (!this.isActive || this.isTransitioning) return;
    this.isTransitioning = true;

    cinematicPhraseText.classList.add('leaving');
    cinematicPhraseText.classList.remove('visible');

    setTimeout(() => {
      cinematicPhraseText.classList.remove('leaving');
      this.currentIndex++;
      if (this.currentIndex >= this.phrases.length) {
        this.finish();
      } else {
        this.showCurrentPhrase();
      }
    }, 340);
  }

  finish() {
    this.isActive = false;
    cinematicOverlay.classList.add('leaving');
    cinematicOverlay.classList.remove('shown');
    sfx.whoosh(0.9, true);
    // The keyhole closes on the interlude, then the next world opens through it
    fx.irisTo(0, 0.75, { shape: 'keyhole', rim: [235, 196, 120] });
    setTimeout(() => {
      cinematicOverlay.style.display = 'none';
      cinematicOverlay.classList.remove('leaving');
      if (this.onAllFinished) {
        this.onAllFinished();
      }
    }, 800);
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
      const suit = SUITS[this.currentIndex % 4];
      finalPhraseElement.dataset.suit = suit;
      finalPhraseElement.classList.toggle('red-suit', suit === '♥' || suit === '♦');
      const tilt = item.type === 'title-phrase' ? -2 : ((Math.random() - 0.5) * 3.2);
      finalPhraseElement.style.setProperty('--tilt', tilt.toFixed(2) + 'deg');
      if (item.type === 'title-phrase') {
        finalPhraseElement.innerHTML = item.text.split('').map((ch, i) =>
          `<span class="l" style="--d:${(i * 0.055).toFixed(3)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
        ).join('');
      } else {
        finalPhraseElement.textContent = item.text;
      }
      void finalPhraseElement.offsetWidth;
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
        sfx.chime(880);
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
function showEraHud(era) {
  const info = ERA_INFO[era];
  if (!info || !eraHud) return;
  eraHud.innerHTML = `<span class="era-num">${info.num}</span><span class="era-sep"></span>` +
    `<span class="era-year">${info.year}</span><span class="era-label">${info.label}</span>`;
  eraHud.dataset.era = era;
  eraHud.classList.add('visible');
}

function hideEraHud() {
  if (eraHud) eraHud.classList.remove('visible');
}

function startOpeningBook() {
  interlude.show('opening');
  fx.setLook('opening');
  fx.setIris(1);
  hideEraHud();
  openingBookContainer.classList.remove('book-falling');
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
  hideEraHud();

  // Living interlude behind the phrases, fading up from the closed keyhole
  interlude.show(eraIndex);
  fx.setLook('interlude');
  fx.setIris(1);
  const info = ERA_INFO[eraIndex];
  cinematicKicker.innerHTML = `<span class="k-num">${info.num}</span><span class="k-dot">✦</span>` +
    `<span class="k-year">${info.year}</span><span class="k-dot">✦</span><span class="k-label">${info.label}</span>`;
  cinematicOverlay.dataset.era = eraIndex;

  cinematicPresenter.start(CINEMATIC_PHRASES[eraIndex], () => {
    transitionManager.onNarrativeFinished();
  });
}

// User action handler for Book Opening
let bookExiting = false;
function handleBookOpeningAction() {
  audio.init();

  if (bookTypewriter.isTyping) {
    bookTypewriter.fastForward();
    return;
  }

  if (bookTypewriter.isComplete && !bookExiting) {
    // The book itself tumbles into the rabbit hole and the keyhole closes behind it
    bookExiting = true;
    narrativeContinueHint.classList.remove('visible');
    openingBookContainer.classList.add('book-falling');
    sfx.whoosh(1.3, true);
    fx.irisTo(0, 0.8, { delay: 0.45, shape: 'keyhole', rim: [235, 196, 120] });
    setTimeout(() => {
      narrativeOverlay.classList.add('hidden');
      narrativeOverlay.style.display = 'none';
      bookExiting = false;
      transitionManager.onNarrativeFinished();
    }, 1300);
  }
}

// ==========================================================================
// SUBSYSTEM INITIALIZATION & TRANSITION MANAGER
// ==========================================================================
pocketWatch = new PocketWatch(watchCanvas, (direction) => {
  audio.triggerTransitionWhoosh();
  transitionManager.triggerWatchTransition(direction);
});
pocketWatch.onTick = () => sfx.tick();

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
      showEraHud(era);
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
      hideEraHud();
    },
    onLeaveCreate: () => {
      createControlsPanel.style.display = 'none';
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
      hideEraHud();
      finalReflectionPresenter.start();
    },
    onResumeCreate: () => {
      finalReflectionPresenter.hide();
      createControlsPanel.style.display = 'flex';
      watchContainer.classList.add('visible');
      showEraHud(3);
    }
  },
  fx,
  sfx
);

// Sound toggle (music + effects)
let isMuted = false;
try { isMuted = localStorage.getItem('wb-muted') === '1'; } catch (e) { /* storage unavailable */ }
function applyMute() {
  audio.setMuted(isMuted);
  sfx.setEnabled(!isMuted);
  if (soundToggle) {
    soundToggle.classList.toggle('muted', isMuted);
    soundToggle.setAttribute('aria-label', isMuted ? 'Activar sonido' : 'Silenciar');
  }
}
applyMute();
if (soundToggle) {
  soundToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    try { localStorage.setItem('wb-muted', isMuted ? '1' : '0'); } catch (err) { /* ignore */ }
    applyMute();
  });
  soundToggle.addEventListener('mousedown', (e) => e.stopPropagation());
}

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
  transitionManager.activeEra = 0;
  createStage.isActive = false;
  fx.irisTo(0, 0.6, { shape: 'circle', rim: [255, 215, 90], onDone: () => {
    transitionManager.setState(States.OPENING_BOOK);
  } });
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
  fx.resize(width, height);
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
  if (e.target.closest('#watch-container') || e.target.closest('#create-controls-panel') || e.target.closest('#final-reflection-overlay') || e.target.closest('#sound-toggle')) {
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

  // Update Transition Manager & post FX
  transitionManager.update(dt);
  fx.update(dt);
  const speedMult = transitionManager.tunnelSpeedMultiplier;
  const state = transitionManager.state;
  const inCreate = state === States.CREATE_ACTIVE || state === States.CONTEMPLATING;

  // Smooth vanishing point parallax
  const targetCx = width / 2 + mouseTargetX * 22;
  const targetCy = height / 2 + mouseTargetY * 16;
  cx += (targetCx - cx) * Math.min(1.0, dt * 3);
  cy += (targetCy - cy) * Math.min(1.0, dt * 3);

  // Update only what is on screen
  lightWaves.update(dt, transitionManager.activeEra, speedMult);
  transitionManager.updateScene(dt);
  if (inCreate) createStage.update(dt, speedMult);
  interlude.update(dt, width, height);
  alice.update(dt, speedMult);

  // 0. Interlude world (opening & between eras)
  if (transitionManager.isInterludeState()) {
    interlude.render(ctx, width, height, width / 2 + (cx - width / 2) * 0.5, height / 2 + (cy - height / 2) * 0.5);
  }

  // 1. Active generative rabbit hole tunnel (+ depth rings & objects) or CREATE stage
  transitionManager.renderTunnels(ctx, width, height, cx, cy);

  // 2. Alice with depth, trail and era aura
  if (transitionManager.activeEra < 3 && !transitionManager.isInterludeState()) {
    alice.render(ctx, width, height, cx, cy);
  }

  // 3. Post FX: speed lines, vignette, grain, flashes, keyhole iris
  fx.render(ctx, cx, cy);

  // 4. Pocket Watch
  pocketWatch.update(dt);
  pocketWatch.render();
}

// Debug hook (only with ?debug in the URL) to jump between scenes
if (location.search.indexOf('debug') !== -1) {
  window.__WB = { transitionManager, States, fx, cinematicPresenter, finalReflectionPresenter, createStage };
}

// Start the experience
transitionManager.start();
requestAnimationFrame(animate);


})();
