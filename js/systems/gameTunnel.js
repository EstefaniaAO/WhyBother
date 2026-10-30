/**
 * Scene 3: Game Tunnel (American McGee's Alice, 2000)
 * Authentic Dark Watercolor & Dense Gothic Pigment (ACUARELA OSCURA).
 * Burgundy, muted crimson, wine red, petrol blue, indigo, dark violet, deep purple, bluish gray.
 * Twisted asymmetric spirals, interlocking thorny roots, dense concentrated stains.
 * Expanded to cover full screen from center to corners.
 */
import { FastMath } from '../math/noise.js';
import { FlowField } from './flowField.js';
import { ColorGrid } from './colorGrid.js';
import { BrushAgent } from './brushAgent.js';

export class GameTunnel {
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
