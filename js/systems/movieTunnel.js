/**
 * Scene 2: Movie Tunnel (1951 Animated Film)
 * Authentic Soft Watercolor & Diluted Pigment on Paper (ESTÉTICA DE ACUARELA).
 * Slower, languid, expressive watercolor ribbons with persistent pigment trails,
 * multi-scale strokes (broad washes, medium ribbons, sinuous filigrees),
 * and center-to-corner radial depth (deep midnight & prussian blues at center,
 * blossoming into luminous powdery blues, soft turquoises, and lilacs at corners).
 */
import { FastMath } from '../math/noise.js';
import { FlowField } from './flowField.js';
import { ColorGrid } from './colorGrid.js';
import { BrushAgent } from './brushAgent.js';

export class MovieTunnel {
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
