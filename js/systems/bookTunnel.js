/**
 * Scene 1: Book Tunnel (Original Book, 1865)
 * Inspired by Lewis Carroll & John Tenniel.
 * Monochromatic antique engraving, spreading ink washes with grayscale depth,
 * and a progressive tunnel built with the words of the book.
 * When ink spreads and darkens the tunnel, words are rendered in crisp, luminous WHITE
 * directly over the spreading ink layer from the central vanishing point to the corners.
 */
import { noise } from '../math/noise.js';

export class BookTunnel {
  constructor() {
    this.time = 0;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Persistent offscreen canvas buffer for spreading ink & paper texture
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

    // Active spiral word streamers emerging from vanishing point
    this.textStreamers = [];
    this.maxStreamers = 8;
    this.nextStreamerTime = 0;

    // Permanent stamped white words over the ink layer
    this.stampedWords = [];
    this.maxStampedWords = 420;

    // Concentric paper ring bands with drop shadows (structural tunnel arches)
    this.paperRings = [];
    this.nextRingTime = 0;
    this.ringInterval = 1.35;

    // Multi-tone spreading ink pen agents (grays and blacks for depth)
    this.penAgents = [];
    this.maxPenAgents = 30;

    // Ink wash blooms spreading on paper
    this.inkBlooms = [];
    this.nextBloomTime = 0;

    // Completed paths for light wave traversal
    this.recentPaths = [];
    this.maxRecentPaths = 50;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    // Initial paper ground: antique ivory transitioning into dark ink core
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.hypot(width, height) * 0.82;

    const bgGrad = this.offCtx.createRadialGradient(cx, cy, 15, cx, cy, maxR);
    bgGrad.addColorStop(0.0, '#060608');
    bgGrad.addColorStop(0.35, '#121216');
    bgGrad.addColorStop(0.70, '#1c1b1f');
    bgGrad.addColorStop(1.0, '#f2eee6');
    this.offCtx.fillStyle = bgGrad;
    this.offCtx.fillRect(0, 0, width, height);

    this.textStreamers = [];
    this.stampedWords = [];
    this.paperRings = [];
    this.penAgents = [];
    this.inkBlooms = [];
    this.recentPaths = [];
    this.time = 0;
    this.nextRingTime = 0.4;
    this.nextStreamerTime = 0.1;
    this.nextBloomTime = 0.2;

    // Spawn initial streams directly from vanishing point
    for (let i = 0; i < 4; i++) {
      this.spawnTextStreamer((i / 4) * Math.PI * 2);
    }

    // Spawn initial spreading ink pen agents
    for (let i = 0; i < 16; i++) {
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
    const maxCorner = Math.hypot(this.width, this.height) * 0.85;

    this.textStreamers.push({
      baseAngle,
      currentR: 16 + Math.random() * 18, // starts at vanishing point
      currentAngle: baseAngle,
      spiralPitch: 36 + Math.random() * 24, // outward radial expansion
      angularSpeed: 0.65 + Math.random() * 0.35,
      wordIndex: Math.floor(Math.random() * this.words.length),
      charTimer: 0,
      charInterval: 0.040, // fluid typewriter cadence
      maxDist: maxCorner,
      isDone: false
    });
  }

  /**
   * Spawns spreading ink bloom puddle ("regando la tinta")
   */
  spawnInkBloom() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const r = 20 + Math.random() * (Math.hypot(this.width, this.height) * 0.52);
    const radius = 25 + Math.random() * 65;

    // Spreading ink bloom in deep black and charcoal
    const offCtx = this.offCtx;
    offCtx.save();
    const grad = offCtx.createRadialGradient(
      cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 0,
      cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, radius
    );
    grad.addColorStop(0.0, 'rgba(10, 10, 14, 0.22)');
    grad.addColorStop(0.6, 'rgba(22, 22, 28, 0.12)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    offCtx.fillStyle = grad;
    offCtx.beginPath();
    offCtx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, radius, 0, Math.PI * 2);
    offCtx.fill();
    offCtx.restore();
  }

  /**
   * Spawns structural cut-paper concentric ring arches
   */
  spawnPaperRing() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const maxScreenRadius = Math.hypot(this.width, this.height) * (0.35 + Math.random() * 0.50);

    this.paperRings.push({
      currentRadius: 24 + Math.random() * 18,
      targetRadius: maxScreenRadius,
      expansionSpeed: 24 + Math.random() * 30,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: (0.025 + Math.random() * 0.035) * (Math.random() > 0.5 ? 1 : -1),
      irregularity: 0.032 + Math.random() * 0.038,
      shadowBlur: 14 + Math.random() * 16,
      lineWidth: 1.2 + Math.random() * 1.5
    });
  }

  /**
   * Spawns multi-tone ink pen agents (Graphite gray, charcoal, and dense black)
   */
  spawnPenAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const startR = 10 + Math.random() * 32;
    const maxCorner = Math.hypot(this.width, this.height) * 0.85;

    // Grayscale Depth Tiers
    const tier = Math.random();
    let strokeColor, strokeWidth, opacity;

    if (tier < 0.35) {
      strokeColor = '160, 155, 148';
      strokeWidth = 0.8 + Math.random() * 1.2;
      opacity = 0.35 + Math.random() * 0.25;
    } else if (tier < 0.70) {
      strokeColor = '78, 74, 70';
      strokeWidth = 1.0 + Math.random() * 1.5;
      opacity = 0.55 + Math.random() * 0.25;
    } else {
      strokeColor = '12, 12, 16';
      strokeWidth = 1.4 + Math.random() * 2.2;
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
    const cx = this.width / 2;
    const cy = this.height / 2;
    const offCtx = this.offCtx;

    // 1. Spreading ink bloom puddles ("regando la tinta")
    this.nextBloomTime -= dt * speedMult;
    if (this.nextBloomTime <= 0) {
      this.spawnInkBloom();
      this.nextBloomTime = 0.8 / Math.max(1, speedMult * 0.85);
    }

    // 2. Progressive Tunnel Word Streamers
    if (this.textStreamers.length < this.maxStreamers) {
      this.nextStreamerTime -= dt * speedMult;
      if (this.nextStreamerTime <= 0) {
        this.spawnTextStreamer();
        this.nextStreamerTime = (1.2 + Math.random() * 1.2) / Math.max(1, speedMult * 0.85);
      }
    }

    for (let i = this.textStreamers.length - 1; i >= 0; i--) {
      const st = this.textStreamers[i];
      st.charTimer += dt * speedMult;

      while (st.charTimer >= st.charInterval && st.wordIndex < this.words.length) {
        st.charTimer -= st.charInterval;
        const currentWord = this.words[st.wordIndex];
        st.wordIndex++;

        // Advance along spiral
        const dAngle = 0.26;
        st.currentAngle += dAngle;
        st.currentR += (st.spiralPitch / (Math.PI * 2)) * dAngle;

        const px = cx + Math.cos(st.currentAngle) * st.currentR;
        const py = cy + Math.sin(st.currentAngle) * st.currentR;

        // Dynamic font size scaling with radius (perspective depth)
        const fontSize = Math.max(10, Math.min(27, Math.floor(11 + (st.currentR / 340) * 15)));

        // Record stamped white word into persistent top collection
        this.stampedWords.push({
          word: currentWord,
          x: px,
          y: py,
          rotation: st.currentAngle + Math.PI / 2,
          fontSize,
          opacity: Math.min(1.0, 0.45 + (st.currentR / 200))
        });

        if (this.stampedWords.length > this.maxStampedWords) {
          this.stampedWords.shift();
        }

        // Loop seamlessly through words
        if (st.wordIndex >= this.words.length) {
          st.wordIndex = 0;
        }

        // Record path coordinate for light waves
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

    // 3. Structural Concentric Cut-Paper Rings
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

      offCtx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      offCtx.shadowBlur = ring.shadowBlur;
      offCtx.shadowOffsetX = 0;
      offCtx.shadowOffsetY = 4;
      offCtx.strokeStyle = 'rgba(12, 12, 16, 0.85)';
      offCtx.lineWidth = ring.lineWidth;
      offCtx.stroke();
      offCtx.restore();

      if (ring.currentRadius >= ring.targetRadius) {
        this.paperRings.splice(i, 1);
      }
    }

    // 4. Spreading Ink Pen Agents
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

      offCtx.save();
      offCtx.beginPath();
      offCtx.moveTo(prevX, prevY);
      offCtx.lineTo(p.x, p.y);
      offCtx.strokeStyle = `rgba(${p.strokeColor}, ${p.opacity})`;
      offCtx.lineWidth = p.lineWidth;
      offCtx.lineCap = 'round';
      offCtx.stroke();

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

    // 1. Draw base persistent spreading ink canvas
    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // 2. Light wave glaze across the tunnel paths
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
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.36 * wave.intensity})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // 3. Crisp WHITE words rendered directly on top of the spreading ink layer
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.stampedWords.length; i++) {
      const item = this.stampedWords[i];

      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);

      // Deep dark drop shadow ensuring maximum legibility on both dark ink and light paper
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Pure WHITE typography with high opacity
      ctx.font = `700 ${item.fontSize}px "Cormorant Garamond", "Cinzel", "Times New Roman", serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${item.opacity})`;
      ctx.fillText(item.word, 0, 0);

      ctx.restore();
    }
    ctx.restore();

    // 4. Central deep vanishing point core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.65, '#0a0a0e');
    coreGrad.addColorStop(1, 'rgba(10, 10, 14, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
