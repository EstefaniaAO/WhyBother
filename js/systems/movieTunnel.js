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

    // Rich Watercolor Palette with Deep Center Tones & Luminous Outer Tones
    this.centerColors = [
      { r: 16, g: 28, b: 56 },  // Azul Prusia profundo
      { r: 24, g: 22, b: 54 },  // Índigo abisal
      { r: 38, g: 18, b: 46 },  // Ciruela / violeta oscuro
      { r: 18, g: 46, b: 62 },  // Azul petróleo denso
      { r: 32, g: 24, b: 42 }   // Sombra berenjena suave
    ];

    this.outerColors = [
      { r: 135, g: 172, b: 212 }, // Azul empolvado clásico Disney
      { r: 168, g: 205, b: 232 }, // Celeste cielo acuarelado
      { r: 115, g: 198, b: 195 }, // Turquesa suave luminoso
      { r: 178, g: 162, b: 212 }, // Lavanda suave
      { r: 202, g: 178, b: 222 }, // Lila empolvado
      { r: 218, g: 168, b: 182 }, // Rosa empolvado
      { r: 142, g: 218, b: 214 }  // Menta translúcido
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
   * Samples color dynamically based on distance from center:
   * Dark deep tones near vanishing point, blossoming to luminous tones at edges
   */
  getColorForRadius(r) {
    const maxCorner = Math.hypot(this.width, this.height) * 0.75;
    const normDist = Math.min(1.0, r / Math.max(100, maxCorner));

    // Choose base color from center or outer palette
    const centerCol = this.centerColors[Math.floor(Math.random() * this.centerColors.length)];
    const outerCol = this.outerColors[Math.floor(Math.random() * this.outerColors.length)];

    return FastMath.blendRGB(centerCol, outerCol, Math.pow(normDist, 0.75));
  }

  spawnAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxCorner = Math.hypot(this.width, this.height) * 0.82;

    // Spawning: 65% near center, 35% seeded at mid radii for continuous stratified coverage
    const isMidSpawn = Math.random() > 0.65;
    const baseR = isMidSpawn ? (45 + Math.random() * (maxCorner * 0.42)) : (10 + Math.random() * 26);

    const spawnAngle = this.colorGrid.findLeastCoveredAngle(cx, cy, baseR);
    const x = cx + Math.cos(spawnAngle) * baseR;
    const y = cy + Math.sin(spawnAngle) * baseR;

    const col = this.getColorForRadius(baseR);

    // 3 Distinct Brush Categories for High Visual Richness (Reference Painting)
    const category = Math.random();
    let thickness, opacity, speed, maxLife, numPasses, bristleSpread;

    if (category < 0.35) {
      // 1. Broad translucent watercolor washes (soft billowing strata)
      thickness = 24 + Math.random() * 22;
      opacity = 0.16 + Math.random() * 0.14;
      speed = 18 + Math.random() * 14; // very languid, fluid
      maxLife = 18.0 + Math.random() * 8.0;
      numPasses = 4;
      bristleSpread = 0.52;
    } else if (category < 0.75) {
      // 2. Medium expressive pigment ribbons (defined curving bands)
      thickness = 10 + Math.random() * 14;
      opacity = 0.28 + Math.random() * 0.22;
      speed = 24 + Math.random() * 18;
      maxLife = 14.0 + Math.random() * 7.0;
      numPasses = 3;
      bristleSpread = 0.40;
    } else {
      // 3. Delicate sinuous filigrees (vein-like interconnecting lines)
      thickness = 2.5 + Math.random() * 4.0;
      opacity = 0.48 + Math.random() * 0.30;
      speed = 30 + Math.random() * 20;
      maxLife = 12.0 + Math.random() * 6.0;
      numPasses = 2;
      bristleSpread = 0.25;
    }

    const initForce = this.flowField.getForce(x, y, cx, cy, this.time);

    this.agents.push(new BrushAgent({
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
    }));
  }

  spawnWashStain() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const r = 25 + Math.random() * (Math.hypot(this.width, this.height) * 0.55);
    const col = this.getColorForRadius(r);

    this.washStains.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      radius: 28 + Math.random() * 75,
      color: col,
      opacity: 0.08 + Math.random() * 0.12,
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
      const targetCol = this.getColorForRadius(currentR);
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
