/**
 * Scene 3: Game Tunnel (American McGee's Alice, 2000 / Alice Madness)
 * Authentic Dark Watercolor & Dense Gothic Pigment (ACUARELA OSCURA).
 * Dominated by midnight blue, dark petrol, deep indigo, burgundy, dark wine, and dark violet,
 * balanced with luminous steel-blue and crimson contrast highlights towards corners.
 * Features organic abstract crimson pigment splatters, elongated droplets, and branching tendrils.
 */
import { FastMath, noise } from '../math/noise.js';
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

    const col = this.getColorForRadius(baseR);

    // Varied Brush Hierarchy (Inspired by reference painting strata)
    const category = Math.random();
    let thickness, opacity, speed, maxLife, numPasses, bristleSpread;

    if (category < 0.35) {
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

    this.agents.push(new BrushAgent({
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
    }));
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

    // Organic Abstract Crimson Splatters
    this.nextSplatterTime -= dt * speedMult;
    if (this.nextSplatterTime <= 0) {
      this.spawnAbstractSplatter();
      this.nextSplatterTime = (2.2 + Math.random() * 2.2) / Math.max(1, speedMult * 0.85);
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
      const targetCol = this.getColorForRadius(currentR);
      agent.currentColor = FastMath.blendRGB(agent.currentColor, targetCol, 0.04);

      agent.update(dt, this.flowField, this.colorGrid, cx, cy, this.time, speedMult);
      agent.drawSegment(offCtx);

      // Occasional organic splatter spawned along high-curvature turns of dark agents
      if (Math.random() > 0.985 && agent.currentColor.r > 100) {
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
