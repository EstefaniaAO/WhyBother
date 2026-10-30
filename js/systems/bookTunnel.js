/**
 * Scene 1: Book Tunnel (Original Book, 1865)
 * Inspired by Lewis Carroll & John Tenniel.
 * Monochromatic antique engraving, cut paper with drop shadows,
 * grayscale depth tiers, and progressive spiral word streamers
 * building the perspective tunnel outward from the central vanishing point to the corners.
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

    // Complete original paragraph of Lewis Carroll
    this.fullParagraph = 
      "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir. " +
      "Al principio, la madriguera del conejo se extendía en línea recta como un túnel, y después torció bruscamente hacia abajo, tan bruscamente que Alicia no tuvo siquiera tiempo de pensar en detenerse y se encontró cayendo por lo que parecía un pozo muy profundo. " +
      "O el pozo era en verdad profundo, o ella caía muy despacio, porque Alicia, mientras descendía, tuvo tiempo sobrado para mirar a su alrededor y para preguntarse qué iba a suceder después. " +
      "Primero, intentó mirar hacia abajo y ver a dónde iría a parar, pero estaba todo demasiado oscuro para distinguir nada. " +
      "Después miró hacia las paredes del pozo y observó que estaban cubiertas de armarios y estantes para libros: aquí y allá vio mapas y cuadros, colgados de clavos. " +
      "Cogió, a su paso, un jarro de los estantes. Llevaba una etiqueta que decía: MERMELADA DE NARANJA, pero vio, con desencanto, que estaba vacío. ";

    this.words = this.fullParagraph.split(/\s+/).filter(w => w.length > 0);

    // Progressive spiral text streamers building the tunnel walls
    this.textStreamers = [];
    this.maxStreamers = 8;
    this.nextStreamerTime = 0;

    // Concentric paper ring bands with drop shadows (structural tunnel arches)
    this.paperRings = [];
    this.nextRingTime = 0;
    this.ringInterval = 1.35;

    // Multi-tone engraving pen agents (grays and deep blacks for depth)
    this.penAgents = [];
    this.maxPenAgents = 28;

    // Tunnel progressive emergence timer
    this.tunnelAge = 0;

    // Completed paths for light wave traversal
    this.recentPaths = [];
    this.maxRecentPaths = 50;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    // Crisp heavy ivory paper ground
    this.offCtx.fillStyle = '#faf8f4';
    this.offCtx.fillRect(0, 0, width, height);

    // Initial deep vanishing point aperture
    const cx = width / 2;
    const cy = height / 2;
    const coreGrad = this.offCtx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.65, '#0e0e12');
    coreGrad.addColorStop(1, 'rgba(250, 248, 244, 0)');
    this.offCtx.fillStyle = coreGrad;
    this.offCtx.beginPath();
    this.offCtx.arc(cx, cy, 38, 0, Math.PI * 2);
    this.offCtx.fill();

    this.textStreamers = [];
    this.paperRings = [];
    this.penAgents = [];
    this.recentPaths = [];
    this.time = 0;
    this.tunnelAge = 0;
    this.nextRingTime = 0.5;
    this.nextStreamerTime = 0.2;

    // Initial pen agents with multi-tonal depth
    for (let i = 0; i < 14; i++) {
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

  /**
   * Spawns a spiral text stream emerging directly from the central vanishing point
   */
  spawnTextStreamer(startAngle = null) {
    const baseAngle = startAngle !== null ? startAngle : Math.random() * Math.PI * 2;
    const maxCorner = Math.hypot(this.width, this.height) * 0.84;

    this.textStreamers.push({
      baseAngle,
      currentR: 18 + Math.random() * 16, // starts tight at vanishing point
      currentAngle: baseAngle,
      spiralPitch: 34 + Math.random() * 24, // outward growth per revolution
      angularSpeed: 0.65 + Math.random() * 0.35,
      wordIndex: Math.floor(Math.random() * this.words.length),
      charTimer: 0,
      charInterval: 0.042, // steady, readable word-stream cadence
      maxDist: maxCorner,
      isDone: false
    });
  }

  /**
   * Spawns expanding cut-paper ring arches with drop shadows
   */
  spawnPaperRing() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const wordCount = 12 + Math.floor(Math.random() * 16);
    const startIdx = Math.floor(Math.random() * (this.words.length - wordCount));
    const ringWords = [];
    for (let i = 0; i < wordCount; i++) {
      ringWords.push(this.words[(startIdx + i) % this.words.length]);
    }

    const maxScreenRadius = Math.hypot(this.width, this.height) * (0.32 + Math.random() * 0.52);

    this.paperRings.push({
      currentRadius: 24 + Math.random() * 18,
      targetRadius: maxScreenRadius,
      expansionSpeed: 24 + Math.random() * 30,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: (0.025 + Math.random() * 0.035) * (Math.random() > 0.5 ? 1 : -1),
      irregularity: 0.032 + Math.random() * 0.038,
      words: ringWords,
      isStamped: false,
      shadowBlur: 14 + Math.random() * 16,
      lineWidth: 1.2 + Math.random() * 1.5
    });
  }

  /**
   * Spawns multi-tone engraving pen agent (Grayscale tiers + deep black)
   */
  spawnPenAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const startR = 12 + Math.random() * 35;
    const maxCorner = Math.hypot(this.width, this.height) * 0.84;

    // Grayscale Depth Tiers:
    // 1. Light graphite gray (distant paper etching)
    // 2. Medium charcoal gray (mid-ground cross-hatching)
    // 3. Rich Victorian jet ink (foreground contrast)
    const tier = Math.random();
    let strokeColor, strokeWidth, opacity;

    if (tier < 0.35) {
      // Light graphite gray
      strokeColor = '178, 172, 164';
      strokeWidth = 0.6 + Math.random() * 1.0;
      opacity = 0.35 + Math.random() * 0.25;
    } else if (tier < 0.70) {
      // Medium charcoal gray
      strokeColor = '98, 92, 86';
      strokeWidth = 0.9 + Math.random() * 1.4;
      opacity = 0.55 + Math.random() * 0.25;
    } else {
      // Rich deep ink black
      strokeColor = '14, 14, 16';
      strokeWidth = 1.2 + Math.random() * 1.8;
      opacity = 0.75 + Math.random() * 0.25;
    }

    this.penAgents.push({
      x: cx + Math.cos(angle) * startR,
      y: cy + Math.sin(angle) * startR,
      angle: angle,
      r: startR,
      speedR: 38 + Math.random() * 52,
      speedTheta: (0.38 + Math.random() * 0.68) * (Math.random() > 0.45 ? 1 : -1),
      noiseScale: 0.0024 + Math.random() * 0.0025,
      strokeColor,
      lineWidth: strokeWidth,
      opacity,
      isHatch: Math.random() > 0.50,
      history: [],
      maxDist: maxCorner,
      age: 0
    });
  }

  update(dt, speedMult = 1.0) {
    if (!this.initialized) return;

    this.time += dt * speedMult;
    this.tunnelAge += dt * speedMult;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const offCtx = this.offCtx;

    // 1. Progressive Tunnel Word Streamers:
    // Pace streamer appearance so the tunnel of words builds steadily from the center
    if (this.textStreamers.length < this.maxStreamers) {
      this.nextStreamerTime -= dt * speedMult;
      if (this.nextStreamerTime <= 0) {
        this.spawnTextStreamer();
        this.nextStreamerTime = (1.4 + Math.random() * 1.4) / Math.max(1, speedMult * 0.85);
      }
    }

    // Advance word streamers along spirals
    for (let i = this.textStreamers.length - 1; i >= 0; i--) {
      const st = this.textStreamers[i];
      st.charTimer += dt * speedMult;

      while (st.charTimer >= st.charInterval && st.wordIndex < this.words.length) {
        st.charTimer -= st.charInterval;
        const currentWord = this.words[st.wordIndex];
        st.wordIndex++;

        // Advance along spiral
        const dAngle = 0.27;
        st.currentAngle += dAngle;
        st.currentR += (st.spiralPitch / (Math.PI * 2)) * dAngle;

        // Position on spiral
        const px = cx + Math.cos(st.currentAngle) * st.currentR;
        const py = cy + Math.sin(st.currentAngle) * st.currentR;

        // Dynamic font size scaling with radius (perspective depth)
        // Starts small near center, grows larger towards corners
        const fontSize = Math.max(9, Math.min(26, Math.floor(10 + (st.currentR / 360) * 14)));

        offCtx.save();
        offCtx.translate(px, py);
        // Tangent rotation to follow the curve of the tunnel spiral
        offCtx.rotate(st.currentAngle + Math.PI / 2);

        // High contrast black ink typography
        offCtx.font = `700 ${fontSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        offCtx.fillStyle = '#0a0a0c';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(currentWord, 0, 0);

        // Subtle connecting ligature / pen underline
        if (Math.random() > 0.48) {
          const wWidth = offCtx.measureText(currentWord).width;
          offCtx.beginPath();
          offCtx.moveTo(-wWidth / 2, fontSize * 0.48);
          offCtx.lineTo(wWidth / 2 + 4, fontSize * 0.48);
          offCtx.strokeStyle = 'rgba(14, 14, 16, 0.65)';
          offCtx.lineWidth = 0.85;
          offCtx.stroke();
        }

        offCtx.restore();

        // Loop seamlessly through words
        if (st.wordIndex >= this.words.length) {
          st.wordIndex = 0;
        }

        // Record recent path for subtle light wave shimmer
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

    // 2. Structural Concentric Cut-Paper Rings
    this.nextRingTime -= dt * speedMult;
    if (this.nextRingTime <= 0) {
      this.spawnPaperRing();
      this.nextRingTime = this.ringInterval / Math.max(1, speedMult * 0.85);
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
          y: cy + Math.sin(theta) * r
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
      offCtx.shadowColor = 'rgba(0, 0, 0, 0.20)';
      offCtx.shadowBlur = ring.shadowBlur;
      offCtx.shadowOffsetX = 0;
      offCtx.shadowOffsetY = 4;
      offCtx.strokeStyle = 'rgba(12, 12, 14, 0.80)';
      offCtx.lineWidth = ring.lineWidth;
      offCtx.stroke();
      offCtx.restore();

      // Stamp typography along paper ring edges
      if (ring.currentRadius > 62 && !ring.isStamped) {
        offCtx.save();
        const fontSize = Math.max(10, Math.min(26, Math.floor(ring.currentRadius * 0.056)));
        offCtx.font = `700 ${fontSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
        offCtx.fillStyle = '#08080a';
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

    // 3. Multi-Tone Pen Agents (Grayscale & Charcoal Depth)
    while (this.penAgents.length < this.maxPenAgents) {
      this.spawnPenAgent();
    }

    for (let i = this.penAgents.length - 1; i >= 0; i--) {
      const p = this.penAgents[i];
      p.age += dt * speedMult;

      const prevX = p.x;
      const prevY = p.y;

      const nAngle = noise.noise2D(p.x * p.noiseScale, p.y * p.noiseScale + this.time * 0.05) * Math.PI * 2;
      p.angle += p.speedTheta * dt * speedMult + Math.sin(nAngle) * 0.36 * dt * speedMult;
      p.r += p.speedR * dt * speedMult;

      p.x = cx + Math.cos(p.angle) * p.r;
      p.y = cy + Math.sin(p.angle) * p.r;

      // Draw progressive stroke with assigned tone
      offCtx.save();
      offCtx.beginPath();
      offCtx.moveTo(prevX, prevY);
      offCtx.lineTo(p.x, p.y);
      offCtx.strokeStyle = `rgba(${p.strokeColor}, ${p.opacity})`;
      offCtx.lineWidth = p.lineWidth;
      offCtx.lineCap = 'round';
      offCtx.stroke();

      // Cross-hatching ticks (Victorian engraving style)
      if (p.isHatch && Math.random() > 0.58) {
        const hLen = 4 + Math.random() * 9;
        const normAngle = p.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        offCtx.beginPath();
        offCtx.moveTo(p.x, p.y);
        offCtx.lineTo(p.x + Math.cos(normAngle) * hLen, p.y + Math.sin(normAngle) * hLen);
        offCtx.strokeStyle = `rgba(${p.strokeColor}, ${p.opacity * 0.8})`;
        offCtx.lineWidth = Math.max(0.5, p.lineWidth * 0.6);
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
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.32 * wave.intensity})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // Defined, deep central vanishing point core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 36);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.62, '#0c0c0e');
    coreGrad.addColorStop(1, 'rgba(250, 248, 244, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
