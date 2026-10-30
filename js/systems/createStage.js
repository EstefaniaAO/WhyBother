/**
 * CREATE Stage — WHY BOTHER?
 * The user transitions from passive observer to active co-creator.
 * Inspired by Omniharmonic: Organic, dynamic, and complex generative composition.
 * Multi-focal fluid fields, autonomous agent networks, persistent pigment accumulation,
 * and indirect cursor influence (deflection, vortex wells, flick impulses).
 */

import { noise, FastMath } from '../math/noise.js';
import { ColorGrid } from './colorGrid.js';
import { BrushAgent } from './brushAgent.js';

export class CreateStage {
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
