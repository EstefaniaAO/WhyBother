/**
 * Scene 2: Movie Tunnel (1951 Animated Film)
 * Authentic Soft Watercolor & Diluted Pigment on Paper (ESTÉTICA DE ACUARELA).
 * Powdery blues, grayish celestes, soft turquoise, lavenders, lilacs, muted violets, powdery rose.
 * Driven by ColorGrid pigment simulation, autonomous BrushAgents, and multi-layer FlowField.
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

    // FlowField configuration for broad organic watercolor spirals
    this.flowField = new FlowField({
      vortexStrength: 0.85,
      radialExpansion: 0.38,
      noiseScale: 0.0018,
      noiseStrength: 0.75,
      turbulence: 0.28,
      spiralDirection: 1
    });

    // Pigment simulation & spatial coverage map
    this.colorGrid = new ColorGrid(64, 48);

    // Active autonomous brush agents
    this.agents = [];
    this.maxAgents = 22;

    // Soft pigment wash drips / stains
    this.washStains = [];
    this.nextStainTime = 0;

    // Completed paths for gentle surface light shimmers
    this.recentPaths = [];
    this.maxRecentPaths = 40;
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
    const maxR = Math.hypot(width, height) * 0.65;

    // Soft watercolor paper ground: subtle muted slate-indigo paper wash
    const bgGrad = this.offCtx.createRadialGradient(cx, cy, 15, cx, cy, maxR);
    bgGrad.addColorStop(0.0, '#0c101a');
    bgGrad.addColorStop(0.35, '#121724');
    bgGrad.addColorStop(0.75, '#182030');
    bgGrad.addColorStop(1.0, '#101420');
    this.offCtx.fillStyle = bgGrad;
    this.offCtx.fillRect(0, 0, width, height);

    this.agents = [];
    this.recentPaths = [];
    this.washStains = [];
    this.time = 0;
    this.nextStainTime = 0.5;

    // Spawn initial few watercolor strokes near center
    for (let i = 0; i < 7; i++) {
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

    // Use CoverageMap to find angles with less pigment density
    const spawnAngle = this.colorGrid.findLeastCoveredAngle(cx, cy, 60);
    const startR = 12 + Math.random() * 26;
    const x = cx + Math.cos(spawnAngle) * startR;
    const y = cy + Math.sin(spawnAngle) * startR;

    const col = this.palette[Math.floor(Math.random() * this.palette.length)];
    // Wide brushstrokes with organic watercolor texture
    const thickness = 10 + Math.random() * 26;
    const opacity = 0.18 + Math.random() * 0.26; // diluted in water

    const initForce = this.flowField.getForce(x, y, cx, cy, this.time);
    const speed = 40 + Math.random() * 45;

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
      maxLife: 5.5 + Math.random() * 4.0,
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
    const r = 40 + Math.random() * (Math.hypot(this.width, this.height) * 0.38);
    const col = this.palette[Math.floor(Math.random() * this.palette.length)];

    this.washStains.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      radius: 18 + Math.random() * 45,
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

    // Occasional soft watercolor wash puddle (wet-on-wet bloom)
    this.nextStainTime -= dt * speedMult;
    if (this.nextStainTime <= 0) {
      this.spawnWashStain();
      this.nextStainTime = 1.8 / Math.max(1, speedMult * 0.8);
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

      if (agent.isDead) {
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

    // 1. Draw persistent accumulated watercolor painting
    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // 2. Subtle light wave glazes over existing strokes (strictly no neon/lasers)
    if (lightWaves && lightWaves.waves.length > 0) {
      const maxR = Math.hypot(width, height) * 0.55;

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
            // Soft translucent watercolor glaze (soft sky/lavender sheen)
            ctx.strokeStyle = `rgba(${Math.min(255, strokeCol.r + 35)}, ${Math.min(255, strokeCol.g + 35)}, ${Math.min(255, strokeCol.b + 35)}, ${(0.32 * wave.intensity).toFixed(3)})`;
            ctx.lineWidth = 3.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // 3. Central aperture eye (soft dark watercolor core)
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
