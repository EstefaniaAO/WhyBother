/**
 * Scene 1: Book Tunnel (Original Book, 1865)
 * Inspired by Reference 1: The original text paragraph literally builds the spiral tunnel
 * expanding from the central vanishing point all the way to the screen corners.
 * Strictly monochromatic (SOLO BLANCO Y NEGRO). High contrast black ink on cut paper.
 */
import { noise } from '../math/noise.js';

export class BookTunnel {
  constructor() {
    this.time = 0;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Persistent offscreen canvas buffer
    this.offscreenCanvas = document.createElement('canvas');
    this.offCtx = this.offscreenCanvas.getContext('2d');

    // Complete original paragraph of Lewis Carroll provided by user
    this.fullParagraph = 
      "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir. " +
      "Al principio, la madriguera del conejo se extendía en línea recta como un túnel, y después torció bruscamente hacia abajo, tan bruscamente que Alicia no tuvo siquiera tiempo de pensar en detenerse y se encontró cayendo por lo que parecía un pozo muy profundo. " +
      "O el pozo era en verdad profundo, o ella caía muy despacio, porque Alicia, mientras descendía, tuvo tiempo sobrado para mirar a su alrededor y para preguntarse qué iba a suceder después. " +
      "Primero, intentó mirar hacia abajo y ver a dónde iría a parar, pero estaba todo demasiado oscuro para distinguir nada. " +
      "Después miró hacia las paredes del pozo y observó que estaban cubiertas de armarios y estantes para libros: aquí y allá vio mapas y cuadros, colgados de clavos. " +
      "Cogió, a su paso, un jarro de los estantes. Llevaba una etiqueta que decía: MERMELADA DE NARANJA, pero vio, con desencanto, que estaba vacío. ";

    this.words = this.fullParagraph.split(/\s+/).filter(w => w.length > 0);

    // Progressive spiral text streamers (streams of words forming the tunnel)
    this.textStreamers = [];
    this.maxStreamers = 6;
    this.nextStreamerTime = 0;

    // Concentric paper ring bands with drop shadows (Reference 1)
    this.paperRings = [];
    this.nextRingTime = 0;
    this.ringInterval = 1.3;

    // Fine ink pen agents accompanying the text
    this.penAgents = [];
    this.maxPenAgents = 20;

    // Completed paths for subtle light wave shimmer
    this.recentPaths = [];
    this.maxRecentPaths = 45;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    // Crisp heavy white/ivory paper ground
    this.offCtx.fillStyle = '#faf8f5';
    this.offCtx.fillRect(0, 0, width, height);

    // Initial deep center aperture (black hole at center)
    const cx = width / 2;
    const cy = height / 2;
    const coreGrad = this.offCtx.createRadialGradient(cx, cy, 0, cx, cy, 36);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.7, '#0a0a0a');
    coreGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    this.offCtx.fillStyle = coreGrad;
    this.offCtx.beginPath();
    this.offCtx.arc(cx, cy, 36, 0, Math.PI * 2);
    this.offCtx.fill();

    this.textStreamers = [];
    this.paperRings = [];
    this.penAgents = [];
    this.recentPaths = [];
    this.time = 0;
    this.nextRingTime = 0.2;
    this.nextStreamerTime = 0.1;

    // Seed initial text streamers from center
    for (let i = 0; i < 3; i++) {
      this.spawnTextStreamer(i * (Math.PI * 2 / 3));
    }

    // Seed initial pen agents
    for (let i = 0; i < 8; i++) {
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

  spawnTextStreamer(startAngle = null) {
    const baseAngle = startAngle !== null ? startAngle : Math.random() * Math.PI * 2;
    const maxCorner = Math.hypot(this.width, this.height) * 0.78;

    this.textStreamers.push({
      baseAngle,
      currentR: 16 + Math.random() * 20,
      currentAngle: baseAngle,
      spiralPitch: 36 + Math.random() * 28, // Radial growth per full revolution
      angularSpeed: 0.65 + Math.random() * 0.35,
      wordIndex: 0,
      charTimer: 0,
      charInterval: 0.045, // Progressive character typing speed
      maxDist: maxCorner,
      isDone: false
    });
  }

  spawnPaperRing() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxScreenRadius = Math.hypot(this.width, this.height) * (0.28 + Math.random() * 0.50);

    // Subset of original text words for ring edge stamping
    const wordCount = 14 + Math.floor(Math.random() * 18);
    const startIdx = Math.floor(Math.random() * (this.words.length - wordCount));
    const ringWords = [];
    for (let i = 0; i < wordCount; i++) {
      ringWords.push(this.words[(startIdx + i) % this.words.length]);
    }

    this.paperRings.push({
      currentRadius: 22 + Math.random() * 18,
      targetRadius: maxScreenRadius,
      expansionSpeed: 26 + Math.random() * 32,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: (0.03 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1),
      irregularity: 0.035 + Math.random() * 0.04,
      words: ringWords,
      isStamped: false,
      shadowBlur: 14 + Math.random() * 16,
      lineWidth: 1.4 + Math.random() * 1.6
    });
  }

  spawnPenAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const startR = 10 + Math.random() * 22;
    const maxCorner = Math.hypot(this.width, this.height) * 0.78;

    this.penAgents.push({
      x: cx + Math.cos(angle) * startR,
      y: cy + Math.sin(angle) * startR,
      angle: angle,
      r: startR,
      speedR: 45 + Math.random() * 60,
      speedTheta: (0.42 + Math.random() * 0.75) * (Math.random() > 0.4 ? 1 : -1),
      noiseScale: 0.0022 + Math.random() * 0.003,
      lineWidth: 0.8 + Math.random() * 2.2,
      opacity: 0.7 + Math.random() * 0.3, // Deep crisp black ink
      isHatch: Math.random() > 0.55,
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
    const offCtx = this.offCtx;

    // 1. Maintain and spawn spiral text streamers
    if (this.textStreamers.length < this.maxStreamers) {
      this.nextStreamerTime -= dt * speedMult;
      if (this.nextStreamerTime <= 0) {
        this.spawnTextStreamer();
        this.nextStreamerTime = (1.5 + Math.random() * 1.5) / Math.max(1, speedMult * 0.8);
      }
    }

    // 2. Progressively type the original paragraph along expanding spirals
    for (let i = this.textStreamers.length - 1; i >= 0; i--) {
      const st = this.textStreamers[i];
      st.charTimer += dt * speedMult;

      while (st.charTimer >= st.charInterval && st.wordIndex < this.words.length) {
        st.charTimer -= st.charInterval;
        const currentWord = this.words[st.wordIndex];
        st.wordIndex++;

        // Advance along Archimedean/logarithmic spiral
        const dAngle = 0.28;
        st.currentAngle += dAngle;
        st.currentR += (st.spiralPitch / (Math.PI * 2)) * dAngle;

        // Coordinates on the spiral
        const px = cx + Math.cos(st.currentAngle) * st.currentR;
        const py = cy + Math.sin(st.currentAngle) * st.currentR;

        // Font scaling with distance from vanishing point (small in center, large in corners)
        const fontSize = Math.max(9, Math.min(26, Math.floor(10 + (st.currentR / 380) * 14)));

        offCtx.save();
        offCtx.translate(px, py);
        // Tangent rotation to follow the curve of the spiral
        offCtx.rotate(st.currentAngle + Math.PI / 2);

        // High-contrast pure black ink serif typography
        offCtx.font = `700 ${fontSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        offCtx.fillStyle = '#080808';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(currentWord, 0, 0);

        // Subtle ink underline or ligature connecting the spiral words
        if (Math.random() > 0.45) {
          const wMetrics = offCtx.measureText(currentWord);
          const wWidth = wMetrics.width;
          offCtx.beginPath();
          offCtx.moveTo(-wWidth / 2, fontSize * 0.48);
          offCtx.lineTo(wWidth / 2 + 5, fontSize * 0.48);
          offCtx.strokeStyle = 'rgba(10, 10, 10, 0.65)';
          offCtx.lineWidth = 0.9;
          offCtx.stroke();
        }

        offCtx.restore();

        // Check if word loop is complete (start over paragraph seamlessly)
        if (st.wordIndex >= this.words.length) {
          st.wordIndex = 0; // Seamless sequential loop of the paragraph
        }

        // Record recent path coordinate for light wave traversal
        this.recentPaths.push([{ x: px, y: py, r: st.currentR }]);
        if (this.recentPaths.length > this.maxRecentPaths) {
          this.recentPaths.shift();
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

    // 3. Spawning concentric paper rings
    this.nextRingTime -= dt * speedMult;
    if (this.nextRingTime <= 0) {
      this.spawnPaperRing();
      this.nextRingTime = this.ringInterval / Math.max(1, speedMult * 0.8);
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

      // Sharp shadow & paper cut edge
      offCtx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      offCtx.shadowBlur = ring.shadowBlur;
      offCtx.shadowOffsetX = 0;
      offCtx.shadowOffsetY = 4;
      offCtx.strokeStyle = 'rgba(10, 10, 10, 0.85)';
      offCtx.lineWidth = ring.lineWidth;
      offCtx.stroke();
      offCtx.restore();

      // Stamp typography along paper ring edges
      if (ring.currentRadius > 60 && !ring.isStamped) {
        offCtx.save();
        const fontSize = Math.max(10, Math.min(26, Math.floor(ring.currentRadius * 0.058)));
        offCtx.font = `700 ${fontSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        offCtx.fillStyle = '#080808';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';

        const fullSentence = ring.words.join('   ');
        const chars = fullSentence.split('');
        const stepAngle = (Math.PI * 2) / chars.length;

        for (let c = 0; c < chars.length; c++) {
          const charAngle = ring.rotationAngle + c * stepAngle;
          const charR = ring.currentRadius + 4;
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

    // 4. Maintain active ink pen agents
    while (this.penAgents.length < this.maxPenAgents) {
      this.spawnPenAgent();
    }

    for (let i = this.penAgents.length - 1; i >= 0; i--) {
      const p = this.penAgents[i];
      p.age += dt * speedMult;

      const prevX = p.x;
      const prevY = p.y;

      const nAngle = noise.noise2D(p.x * p.noiseScale, p.y * p.noiseScale + this.time * 0.05) * Math.PI * 2;
      p.angle += p.speedTheta * dt * speedMult + Math.sin(nAngle) * 0.38 * dt * speedMult;
      p.r += p.speedR * dt * speedMult;

      p.x = cx + Math.cos(p.angle) * p.r;
      p.y = cy + Math.sin(p.angle) * p.r;

      offCtx.save();
      offCtx.beginPath();
      offCtx.moveTo(prevX, prevY);
      offCtx.lineTo(p.x, p.y);
      offCtx.strokeStyle = `rgba(10, 10, 10, ${p.opacity})`;
      offCtx.lineWidth = p.lineWidth;
      offCtx.lineCap = 'round';
      offCtx.stroke();

      if (p.isHatch && Math.random() > 0.58) {
        const hLen = 5 + Math.random() * 10;
        const normAngle = p.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        offCtx.beginPath();
        offCtx.moveTo(p.x, p.y);
        offCtx.lineTo(p.x + Math.cos(normAngle) * hLen, p.y + Math.sin(normAngle) * hLen);
        offCtx.strokeStyle = `rgba(15, 15, 15, ${p.opacity * 0.85})`;
        offCtx.lineWidth = 0.7;
        offCtx.stroke();
      }
      offCtx.restore();

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
  }

  render(ctx, width, height, cx, cy, lightWaves, alpha = 1.0) {
    if (alpha <= 0.001) return;

    this.resize(width, height);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Subtle paper grain light wave highlight (no neon)
    if (lightWaves && lightWaves.waves.length > 0) {
      const maxR = Math.hypot(width, height) * 0.75;

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
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.6, '#0a0a0a');
    coreGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
