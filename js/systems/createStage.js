/**
 * CREATE Stage — WHY BOTHER?
 * Inspired by Alice in Wonderland fantasy surrealism & Omniharmonic generative art.
 * Palette: Rich purples & violets, warm golden yellows, deep & sky blues, turquoises,
 * lavenders, and rose accents.
 * Autonomous multi-agent organic system influenced by cursor forces (deflection, vortex wells, flick branchings).
 * Features Contemplate mode to stabilize the work into a finished presentation.
 */

import { noise } from '../math/noise.js';
import { ColorGrid } from './colorGrid.js';
import { BrushAgent } from './brushAgent.js';

export class CreateStage {
  constructor() {
    this.isActive = false;
    this.isContemplating = false;
    this.time = 0;
    this.width = 0;
    this.height = 0;
    this.emergenceAlpha = 0; // Gradually emerges from darkness (0 -> 1)

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

    this.time += dt * speedMult;
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
      f.angle += f.speed * dt;
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
      agent.update(dt, adapterFlow, this.colorGrid, this.width / 2, this.height / 2, this.time, speedMult);
      agent.drawSegment(offCtx);

      // Branching when cursor flicks or during high energy
      if (!this.isContemplating && this.cursor.speed > 10.0 && Math.random() > 0.92 && this.agents.length < this.maxAgents + 8) {
        const distToCursor = Math.hypot(agent.x - this.cursor.x, agent.y - this.cursor.y);
        if (distToCursor < 190) {
          this.spawnAgent(agent.x, agent.y, Math.atan2(agent.vy, agent.vx));
        }
      }

      const isOutOfBounds = agent.x < -80 || agent.x > this.width + 80 || agent.y < -80 || agent.y > this.height + 80;
      if (agent.isDead || isOutOfBounds) {
        this.agents.splice(i, 1);
      }
    }

    // Gentle pigment diffusion
    this.colorGrid.diffuse(0.018 * dt * speedMult);
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
