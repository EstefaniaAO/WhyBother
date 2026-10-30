/**
 * CREATE Stage — WHY BOTHER?
<<<<<<< HEAD
 * Inspired by Alice in Wonderland fantasy surrealism & Omniharmonic generative art.
 * Palette: Rich purples & violets, warm golden yellows, deep & sky blues, turquoises,
 * lavenders, and rose accents.
 * Autonomous multi-agent organic system influenced by cursor forces (deflection, vortex wells, flick branchings).
=======
 * The user transitions from passive observer to active co-creator.
 * Inspired by Omniharmonic: Organic, dynamic, and complex generative composition.
 * Multi-focal fluid fields, autonomous agent networks, persistent pigment accumulation,
 * and indirect cursor influence (deflection, vortex wells, flick impulses).
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
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

<<<<<<< HEAD
    // Persistent canvas buffer (inherits from previous video game stage without wiping)
    this.offscreenCanvas = document.createElement('canvas');
    this.offCtx = this.offscreenCanvas.getContext('2d');

    // Rich Wonderland Surrealist Palette
    this.palette = [
      { r: 128, g: 35,  b: 165 }, // Morado profundo (rich purple)
      { r: 168, g: 75,  b: 215 }, // Violeta vibrante (vibrant violet)
      { r: 245, g: 185, b: 45  }, // Amarillo cálido / dorado (warm gold)
      { r: 255, g: 215, b: 85  }, // Oro brillante (buttercup gold)
      { r: 22,  g: 78,  b: 185 }, // Azul intenso (intense azure)
      { r: 105, g: 185, b: 245 }, // Azul cielo (sky blue)
      { r: 28,  g: 195, b: 185 }, // Turquesa vivo (rich turquoise)
      { r: 185, g: 165, b: 225 }, // Lavanda suave (soft lavender)
      { r: 235, g: 110, b: 155 }, // Rosa frambuesa (raspberry rose)
      { r: 42,  g: 22,  b: 65  }  // Acento ciruela oscuro (deep plum)
    ];

    // Pigment simulation & spatial coverage map
    this.colorGrid = new ColorGrid(80, 60);

    // Multi-class creative agent population
    this.agents = [];
    this.maxAgents = 48; // Rich multi-agent composition

    // Dynamic wandering focal centers (Omniharmonic dynamic foci)
    this.foci = [
      { x: 0, y: 0, strength: 0.9, angle: 0, speed: 0.22 },
      { x: 0, y: 0, strength: -0.85, angle: Math.PI * 0.65, speed: 0.18 },
      { x: 0, y: 0, strength: 0.75, angle: Math.PI * 1.35, speed: 0.25 },
      { x: 0, y: 0, strength: -0.7, angle: Math.PI * 1.8, speed: 0.16 }
=======
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
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
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

<<<<<<< HEAD
    // Transition progress (relaxing previous stage constraints)
=======
    // Transition progress (0 -> 1 as rabbit hole frees its central constraint)
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    this.freedomBlend = 0;
  }

  init(width, height, existingCanvas = null) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.colorGrid.resize(width, height);

<<<<<<< HEAD
    // Inherit existing canvas marks from the rabbit hole seamlessly
    if (existingCanvas) {
      this.offCtx.drawImage(existingCanvas, 0, 0, width, height);
    } else {
      this.offCtx.fillStyle = '#0f0a18';
=======
    // If coming from an existing rabbit hole, copy its canvas so nothing is erased!
    if (existingCanvas) {
      this.offCtx.drawImage(existingCanvas, 0, 0, width, height);
    } else {
      // Soft primed paper wash
      this.offCtx.fillStyle = '#f5f2eb';
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
      this.offCtx.fillRect(0, 0, width, height);
    }

    this.cursor.x = width / 2;
    this.cursor.y = height / 2;
    this.cursor.prevX = width / 2;
    this.cursor.prevY = height / 2;

<<<<<<< HEAD
    // Distribute wandering foci across the canvas
    this.foci.forEach((f, idx) => {
      const angle = (idx / this.foci.length) * Math.PI * 2;
      const r = Math.min(width, height) * (0.22 + (idx % 2) * 0.16);
      f.x = width / 2 + Math.cos(angle) * r;
      f.y = height / 2 + Math.sin(angle) * r;
    });

    this.agents = [];
    for (let i = 0; i < 20; i++) {
=======
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
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
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
<<<<<<< HEAD
    let x, y, angle;

    if (atX !== null && atY !== null) {
      x = atX;
      y = atY;
      angle = inheritAngle !== null ? inheritAngle + (Math.random() - 0.5) * 0.85 : Math.random() * Math.PI * 2;
    } else {
      if (Math.random() > 0.45 && this.foci.length > 0) {
        const focus = this.foci[Math.floor(Math.random() * this.foci.length)];
        const r = 25 + Math.random() * 95;
=======
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
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
        const a = Math.random() * Math.PI * 2;
        x = focus.x + Math.cos(a) * r;
        y = focus.y + Math.sin(a) * r;
      } else {
<<<<<<< HEAD
        // Distributed across full canvas
=======
        // Broad canvas spawn
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
        x = Math.random() * this.width;
        y = Math.random() * this.height;
      }
      angle = Math.random() * Math.PI * 2;
    }

    const col = this.palette[Math.floor(Math.random() * this.palette.length)];
<<<<<<< HEAD
    // Diverse agent forms: broad gestural strokes, fine filigrees, or medium ribbons
    const role = Math.random();
    let thickness, opacity, maxLife, speed;

    if (role < 0.28) {
      // Broad gestural watercolor wash
      thickness = 18 + Math.random() * 26;
      opacity = 0.22 + Math.random() * 0.25;
      maxLife = 6.0 + Math.random() * 4.0;
      speed = 38 + Math.random() * 32;
    } else if (role < 0.65) {
      // Medium organic ribbon
      thickness = 8 + Math.random() * 12;
      opacity = 0.32 + Math.random() * 0.35;
      maxLife = 7.0 + Math.random() * 5.0;
      speed = 52 + Math.random() * 42;
    } else {
      // Fine sinuous filigree
      thickness = 2.2 + Math.random() * 4.5;
      opacity = 0.55 + Math.random() * 0.35;
      maxLife = 8.5 + Math.random() * 5.5;
      speed = 64 + Math.random() * 50;
    }
=======
    const thickness = 6 + Math.random() * 24;
    const opacity = 0.22 + Math.random() * 0.26;
    const speed = 48 + Math.random() * 56;
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1

    this.agents.push(new BrushAgent({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
<<<<<<< HEAD
      maxSteerForce: 4.2,
      thickness,
      opacity,
      color: col,
      maxLife,
      numPasses: thickness > 15 ? 4 : (thickness > 6 ? 3 : 2),
      bristleSpread: 0.44,
      isWet: true,
      isGothic: false
=======
      maxSteerForce: 3.8,
      thickness,
      opacity,
      color: col,
      maxLife: 6.0 + Math.random() * 5.0,
      numPasses: 3,
      bristleSpread: 0.42,
      isWet: true,
      isGothic: Math.random() > 0.75
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    }));
  }

  getFlowForce(x, y, time) {
    const cx = this.width / 2;
    const cy = this.height / 2;

<<<<<<< HEAD
    // 1. Weakened remnant of central vortex during transition, relaxing to zero
    let fx = 0, fy = 0;
    if (this.freedomBlend < 0.95) {
      const dxCenter = x - cx;
      const dyCenter = y - cy;
      const distCenter = Math.hypot(dxCenter, dyCenter) + 0.001;
      const centerWeight = Math.max(0.0, 0.45 * (1.0 - this.freedomBlend));
      fx += (-dyCenter / distCenter) * centerWeight * 0.35 + (dxCenter / distCenter) * centerWeight * 0.2;
      fy += (dxCenter / distCenter) * centerWeight * 0.35 + (dyCenter / distCenter) * centerWeight * 0.2;
    }

    // 2. Dynamic wandering foci (Omniharmonic organic centers)
=======
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
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    for (const f of this.foci) {
      const fdx = x - f.x;
      const fdy = y - f.y;
      const fDist = Math.hypot(fdx, fdy) + 1.0;
<<<<<<< HEAD
      if (fDist < 420) {
        const falloff = Math.cos((fDist / 420) * (Math.PI / 2));
        const rotX = -fdy / fDist;
        const rotY = fdx / fDist;
        fx += rotX * f.strength * falloff * 0.72;
        fy += rotY * f.strength * falloff * 0.72;
      }
    }

    // 3. Multi-frequency 3D Simplex Curl Noise
    const nScale = 0.0022;
    const curl = noise.curl2D(x * nScale, y * nScale + time * 0.04);
    fx += curl.x * 0.92;
    fy += curl.y * 0.92;
=======
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
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1

    // 4. Cursor Influence: Deflection, Vortex Well, Flick Impulse
    if (this.cursor.active) {
      const cdx = x - this.cursor.x;
      const cdy = y - this.cursor.y;
      const cDist = Math.hypot(cdx, cdy) + 0.01;
<<<<<<< HEAD
      const influenceRadius = this.cursor.isDown ? 280 : 175;
=======
      const influenceRadius = this.cursor.isDown ? 260 : 160;
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1

      if (cDist < influenceRadius) {
        const cFactor = 1.0 - cDist / influenceRadius;
        const smoothFactor = cFactor * cFactor;

        if (this.cursor.isDown) {
          // Click & hold: localized rotating vortex & pigment well
          const cRotX = -cdy / cDist;
          const cRotY = cdx / cDist;
          const cPullX = -cdx / cDist;
          const cPullY = -cdy / cDist;
<<<<<<< HEAD
          // Inward swirl + vortex spin
          fx += (cRotX * 2.2 + cPullX * 0.85) * smoothFactor * (1.0 + this.cursor.holdTime * 1.8);
          fy += (cRotY * 2.2 + cPullY * 0.85) * smoothFactor * (1.0 + this.cursor.holdTime * 1.8);
        } else if (this.cursor.speed > 7.0) {
          // Rapid drag / flick: intense directional impulse
          const normSpeed = Math.min(2.8, this.cursor.speed / 14.0);
          fx += (this.cursor.vx / this.cursor.speed) * normSpeed * smoothFactor * 2.4;
          fy += (this.cursor.vy / this.cursor.speed) * normSpeed * smoothFactor * 2.4;
        } else {
          // Sinuous hover deflection / gentle orbital steering
          const cRotX = -cdy / cDist;
          const cRotY = cdx / cDist;
          fx += cRotX * smoothFactor * 0.95;
          fy += cRotY * smoothFactor * 0.95;
=======
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
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
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

<<<<<<< HEAD
    // Smoothly relax centralized rabbit hole pull (freedom blend 0 -> 1)
    if (this.freedomBlend < 1.0) {
      this.freedomBlend = Math.min(1.0, this.freedomBlend + dt * 0.14);
=======
    // Smoothly relax central constraints (freedom blend: 0 -> 1 over 8s)
    if (this.freedomBlend < 1.0) {
      this.freedomBlend = Math.min(1.0, this.freedomBlend + dt * 0.12);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    }

    // Cursor hold duration tracking
    if (this.cursor.isDown) {
      this.cursor.holdTime += dt;
<<<<<<< HEAD
      // Deposit localized rich pigment bloom around cursor
      if (Math.random() > 0.35) {
        const rad = 20 + Math.random() * 45;
        const col = this.palette[Math.floor(Math.random() * this.palette.length)];
        const grad = offCtx.createRadialGradient(this.cursor.x, this.cursor.y, 0, this.cursor.x, this.cursor.y, rad);
        grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0.16)`);
=======
      // Deposit localized rich pigment puddle when held
      if (Math.random() > 0.4) {
        const rad = 15 + Math.random() * 35;
        const col = this.palette[Math.floor(Math.random() * this.palette.length)];
        const grad = offCtx.createRadialGradient(this.cursor.x, this.cursor.y, 0, this.cursor.x, this.cursor.y, rad);
        grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0.12)`);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
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

<<<<<<< HEAD
    // Update wandering foci with smooth Lissajous & Simplex motion
    this.foci.forEach((f, idx) => {
      f.angle += f.speed * dt;
      const baseR = Math.min(this.width, this.height) * (0.24 + (idx % 2) * 0.14);
      const wanderX = noise.noise2D(idx * 15 + this.time * 0.07, idx * 8) * 110;
      const wanderY = noise.noise2D(idx * 8, idx * 15 + this.time * 0.07) * 110;
=======
    // Update wandering focal points with smooth noise
    this.foci.forEach((f, idx) => {
      f.angle += (0.12 + idx * 0.05) * dt;
      const baseR = Math.min(this.width, this.height) * (0.22 + idx * 0.08);
      const wanderX = noise.noise2D(idx * 10 + this.time * 0.08, idx * 5) * 90;
      const wanderY = noise.noise2D(idx * 5, idx * 10 + this.time * 0.08) * 90;
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
      f.x = this.width / 2 + Math.cos(f.angle) * baseR + wanderX;
      f.y = this.height / 2 + Math.sin(f.angle) * baseR + wanderY;
    });

    // Maintain creative agent population
    while (this.agents.length < this.maxAgents) {
      this.spawnAgent();
    }

<<<<<<< HEAD
    // FlowField adapter for BrushAgent
=======
    // Custom flowField adapter for BrushAgent
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
    const adapterFlow = {
      getForce: (x, y) => this.getFlowForce(x, y, this.time)
    };

    // Update and draw agents
    for (let i = this.agents.length - 1; i >= 0; i--) {
      const agent = this.agents[i];
      agent.update(dt, adapterFlow, this.colorGrid, this.width / 2, this.height / 2, this.time, speedMult);
      agent.drawSegment(offCtx);

<<<<<<< HEAD
      // Branching when cursor flicks or during high energy
      if (this.cursor.speed > 10.0 && Math.random() > 0.92 && this.agents.length < this.maxAgents + 8) {
        const distToCursor = Math.hypot(agent.x - this.cursor.x, agent.y - this.cursor.y);
        if (distToCursor < 190) {
=======
      // Occasional organic branching when cursor flicks or during high energy
      if (this.cursor.speed > 12.0 && Math.random() > 0.94 && this.agents.length < this.maxAgents + 6) {
        const distToCursor = Math.hypot(agent.x - this.cursor.x, agent.y - this.cursor.y);
        if (distToCursor < 180) {
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
          this.spawnAgent(agent.x, agent.y, Math.atan2(agent.vy, agent.vx));
        }
      }

<<<<<<< HEAD
      const isOutOfBounds = agent.x < -80 || agent.x > this.width + 80 || agent.y < -80 || agent.y > this.height + 80;
=======
      // Check bounds & life
      const isOutOfBounds = agent.x < -60 || agent.x > this.width + 60 || agent.y < -60 || agent.y > this.height + 60;
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
      if (agent.isDead || isOutOfBounds) {
        this.agents.splice(i, 1);
      }
    }

    // Gentle pigment diffusion
<<<<<<< HEAD
    this.colorGrid.diffuse(0.018 * dt * speedMult);
=======
    this.colorGrid.diffuse(0.015 * dt * speedMult);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
  }

  render(ctx) {
    if (!this.isActive) return;

    ctx.save();
    ctx.drawImage(this.offscreenCanvas, 0, 0);

<<<<<<< HEAD
    // Subtle interactive cursor aura
    if (this.cursor.active) {
      const radius = this.cursor.isDown ? 42 + Math.sin(this.time * 6) * 6 : 24;
      ctx.beginPath();
      ctx.arc(this.cursor.x, this.cursor.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.cursor.isDown ? 'rgba(255, 215, 85, 0.55)' : 'rgba(168, 75, 215, 0.3)';
      ctx.lineWidth = 1.5;
=======
    // Subtle interactive cursor halo
    if (this.cursor.active) {
      const radius = this.cursor.isDown ? 38 + Math.sin(this.time * 6) * 6 : 22;
      ctx.beginPath();
      ctx.arc(this.cursor.x, this.cursor.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.cursor.isDown ? 'rgba(215, 175, 120, 0.45)' : 'rgba(168, 145, 192, 0.25)';
      ctx.lineWidth = 1.4;
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
      ctx.stroke();
    }
    ctx.restore();
  }
}
