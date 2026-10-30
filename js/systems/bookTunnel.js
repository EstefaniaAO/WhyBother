/**
 * Scene 1: Book Tunnel (Original Book, 1865)
 * Pure Monochromatic Antique Ink on Cut Paper (SOLO BLANCO Y NEGRO).
 * Concentric paper rings, deep cut shadows, hand-drawn ink pen spirals,
 * and typographic literary fragments stamped along organic spiral curves.
 */
import { noise, FastMath } from '../math/noise.js';

export class BookTunnel {
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
    this.maxPenAgents = 26;

    // Concentric paper ring growth queue
    this.paperRings = [];
    this.nextRingTime = 0;
    this.ringInterval = 1.4;

    // Spiral text arms that stream words into the rabbit hole
    this.spiralTextArms = [];
    this.nextSpiralTextTime = 0;

    // Completed paths for subtle light wave traversal
    this.recentPaths = [];
    this.maxRecentPaths = 45;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    // Initial white paper ground
    this.offCtx.fillStyle = '#faf8f5';
    this.offCtx.fillRect(0, 0, width, height);

    // Initial deep center aperture (black hole at center)
    const cx = width / 2;
    const cy = height / 2;
    const coreGrad = this.offCtx.createRadialGradient(cx, cy, 0, cx, cy, 35);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.7, '#1a1a1a');
    coreGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    this.offCtx.fillStyle = coreGrad;
    this.offCtx.beginPath();
    this.offCtx.arc(cx, cy, 35, 0, Math.PI * 2);
    this.offCtx.fill();

    this.penAgents = [];
    this.paperRings = [];
    this.spiralTextArms = [];
    this.recentPaths = [];
    this.time = 0;
    this.nextRingTime = 0.3;
    this.nextSpiralTextTime = 0.6;

    // Spawn initial pen agents near the center
    for (let i = 0; i < 7; i++) {
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
    const startR = 10 + Math.random() * 24;

    this.penAgents.push({
      x: cx + Math.cos(angle) * startR,
      y: cy + Math.sin(angle) * startR,
      angle: angle,
      r: startR,
      speedR: 42 + Math.random() * 60,
      speedTheta: (0.45 + Math.random() * 0.75) * (Math.random() > 0.4 ? 1 : -1),
      noiseScale: 0.0028 + Math.random() * 0.0035,
      lineWidth: 0.7 + Math.random() * 2.2,
      opacity: 0.45 + Math.random() * 0.45,
      isHatch: Math.random() > 0.6,
      history: [],
      maxDist: Math.hypot(this.width, this.height) * 0.60,
      age: 0
    });
  }

  spawnPaperRing() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const wordCount = 14 + Math.floor(Math.random() * 18);
    const ringWords = [];
    const startIdx = Math.floor(Math.random() * (this.words.length - wordCount));
    for (let i = 0; i < wordCount; i++) {
      ringWords.push(this.words[(startIdx + i) % this.words.length]);
    }

    this.paperRings.push({
      currentRadius: 26 + Math.random() * 20,
      targetRadius: Math.hypot(this.width, this.height) * (0.12 + Math.random() * 0.46),
      expansionSpeed: 24 + Math.random() * 32,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: (0.04 + Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1),
      irregularity: 0.04 + Math.random() * 0.05,
      words: ringWords,
      isStamped: false,
      shadowBlur: 10 + Math.random() * 16,
      lineWidth: 1.2 + Math.random() * 1.8
    });
  }

  spawnSpiralText() {
    const phrase = this.texts[Math.floor(Math.random() * this.texts.length)];
    this.spiralTextArms.push({
      text: phrase,
      chars: phrase.split(''),
      currentIndex: 0,
      baseAngle: Math.random() * Math.PI * 2,
      currentR: 20 + Math.random() * 25,
      spiralGrowth: 28 + Math.random() * 24, // radius expansion per turn
      charStepTimer: 0,
      charInterval: 0.06 + Math.random() * 0.04,
      fontSize: 10 + Math.floor(Math.random() * 14),
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
      this.nextSpiralTextTime = (2.2 + Math.random() * 1.8) / Math.max(1, speedMult * 0.8);
    }

    // 3. Progressively stamp spiral text streams
    for (let i = this.spiralTextArms.length - 1; i >= 0; i--) {
      const arm = this.spiralTextArms[i];
      arm.charStepTimer += dt * speedMult;

      while (arm.charStepTimer >= arm.charInterval && arm.currentIndex < arm.chars.length) {
        arm.charStepTimer -= arm.charInterval;
        const ch = arm.chars[arm.currentIndex];
        arm.currentIndex++;

        // Spiral coordinates
        const turns = (arm.currentIndex * 0.095);
        const theta = arm.baseAngle + turns * Math.PI * 2;
        const r = arm.currentR + turns * arm.spiralGrowth;

        // Stamp character along spiral curve
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r;

        offCtx.save();
        offCtx.translate(px, py);
        offCtx.rotate(theta + Math.PI / 2);
        const dynamicSize = Math.max(9, Math.min(24, Math.floor(arm.fontSize * (0.6 + (r / 350)))));
        offCtx.font = `600 ${dynamicSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        offCtx.fillStyle = 'rgba(18, 18, 18, 0.88)';
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

      const numPts = 90;
      const pts = [];
      for (let s = 0; s <= numPts; s++) {
        const theta = (s / numPts) * Math.PI * 2;
        const n = noise.fbm2D(
          Math.cos(theta) * 2.2 + ring.targetRadius * 0.01,
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

      offCtx.shadowColor = 'rgba(0, 0, 0, 0.16)';
      offCtx.shadowBlur = ring.shadowBlur;
      offCtx.shadowOffsetX = 0;
      offCtx.shadowOffsetY = 3;
      offCtx.strokeStyle = 'rgba(15, 15, 15, 0.75)';
      offCtx.lineWidth = ring.lineWidth;
      offCtx.stroke();
      offCtx.restore();

      // Stamp typography along the ring perimeters
      if (ring.currentRadius > 60 && !ring.isStamped) {
        offCtx.save();
        const fontSize = Math.max(9, Math.min(26, Math.floor(ring.currentRadius * 0.065)));
        offCtx.font = `600 ${fontSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        offCtx.fillStyle = '#111111';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';

        const fullSentence = ring.words.join('   ');
        const chars = fullSentence.split('');
        const stepAngle = (Math.PI * 2) / chars.length;

        for (let c = 0; c < chars.length; c++) {
          const charAngle = ring.rotationAngle + c * stepAngle;
          const charR = ring.currentRadius + 3;
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
      p.angle += p.speedTheta * dt * speedMult + Math.sin(nAngle) * 0.35 * dt * speedMult;
      p.r += p.speedR * dt * speedMult;

      p.x = cx + Math.cos(p.angle) * p.r;
      p.y = cy + Math.sin(p.angle) * p.r;

      offCtx.save();
      offCtx.beginPath();
      offCtx.moveTo(prevX, prevY);
      offCtx.lineTo(p.x, p.y);
      offCtx.strokeStyle = `rgba(18, 18, 18, ${p.opacity})`;
      offCtx.lineWidth = p.lineWidth;
      offCtx.lineCap = 'round';
      offCtx.stroke();

      if (p.isHatch && Math.random() > 0.6) {
        const hLen = 4 + Math.random() * 8;
        const normAngle = p.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        offCtx.beginPath();
        offCtx.moveTo(p.x, p.y);
        offCtx.lineTo(p.x + Math.cos(normAngle) * hLen, p.y + Math.sin(normAngle) * hLen);
        offCtx.strokeStyle = `rgba(30, 30, 30, ${p.opacity * 0.65})`;
        offCtx.lineWidth = 0.6;
        offCtx.stroke();
      }
      offCtx.restore();

      p.history.push({ x: p.x, y: p.y, r: p.r });

      const distFromCenter = Math.hypot(p.x - cx, p.y - cy);
      if (distFromCenter >= p.maxDist || p.age > 8.0) {
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
      const maxR = Math.hypot(width, height) * 0.55;

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
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.6, '#181818');
    coreGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
