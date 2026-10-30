/**
 * Scene 1: Book Tunnel (Original Book, 1865)
 * Inspired by Lewis Carroll & John Tenniel.
 * Monochromatic antique engraving, spreading ink and grayscale pen strokes,
 * with luminous WHITE letters forming a spiral word tunnel directly
 * ON TOP of the spreading ink layer.
 */
import { noise } from '../math/noise.js';

export class BookTunnel {
  constructor() {
    this.time = 0;
    this.initialized = false;
    this.width = 0;
    this.height = 0;

    // Persistent canvas for ink and paper accumulation
    this.inkCanvas = document.createElement('canvas');
    this.inkCtx = this.inkCanvas.getContext('2d');

    // Dedicated overlay canvas for text, ensuring letters appear ON TOP of spreading ink
    this.textCanvas = document.createElement('canvas');
    this.textCtx = this.textCanvas.getContext('2d');

    // Complete original paragraph of Lewis Carroll
    this.fullParagraph = 
      "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir. " +
      "Al principio, la madriguera del conejo se extendía en línea recta como un túnel, y después torció bruscamente hacia abajo, tan bruscamente que Alicia no tuvo siquiera tiempo de pensar en detenerse y se encontró cayendo por lo que parecía un pozo muy profundo. " +
      "O el pozo era en verdad profundo, o ella caía muy despacio, porque Alicia, mientras descendía, tuvo tiempo sobrado para mirar a su alrededor y para preguntarse qué iba a suceder después. " +
      "Primero, intentó mirar hacia abajo y ver a dónde iría a parar, pero estaba todo demasiado oscuro para distinguir nada. " +
      "Después miró hacia las paredes del pozo y observó que estaban cubiertas de armarios y estantes para libros: aquí y allá vio mapas y cuadros, colgados de clavos. " +
      "Cogió, a su paso, un jarro de los estantes. Llevaba una etiqueta que decía: MERMELADA DE NARANJA, pero vio, con desencanto, que estaba vacío. ";

    this.words = this.fullParagraph.split(/\s+/).filter(w => w.length > 0);

    // Active spiral text streamers that continuously stream words outward
    this.textStreamers = [];
    this.maxStreamers = 6;
    // Words slowly dissolve so the spiral stays legible and alive
    this.textFadeTimer = 0;
    this.nextStreamerTime = 0;

    // Concentric paper ring bands with drop shadows
    this.paperRings = [];
    this.nextRingTime = 0;
    this.ringInterval = 1.25;

    // Multi-tone pen agents spreading ink across the canvas
    this.penAgents = [];
    this.maxPenAgents = 30;

    // Completed paths for light wave traversal
    this.recentPaths = [];
    this.maxRecentPaths = 50;

    // Compatibility getter
    this.offscreenCanvas = this.inkCanvas;
  }

  init(width, height) {
    this.width = width;
    this.height = height;

    this.inkCanvas.width = width;
    this.inkCanvas.height = height;
    this.textCanvas.width = width;
    this.textCanvas.height = height;

    // Crisp ivory paper ground
    this.inkCtx.fillStyle = '#faf7f2';
    this.inkCtx.fillRect(0, 0, width, height);

    // Clear text layer
    this.textCtx.clearRect(0, 0, width, height);

    // Deep vanishing point aperture in center
    const cx = width / 2;
    const cy = height / 2;
    const coreGrad = this.inkCtx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.65, '#0c0c10');
    coreGrad.addColorStop(1, 'rgba(250, 247, 242, 0)');
    this.inkCtx.fillStyle = coreGrad;
    this.inkCtx.beginPath();
    this.inkCtx.arc(cx, cy, 38, 0, Math.PI * 2);
    this.inkCtx.fill();

    this.textStreamers = [];
    this.paperRings = [];
    this.penAgents = [];
    this.recentPaths = [];
    this.time = 0;
    this.nextRingTime = 0.4;
    this.nextStreamerTime = 0;

    // Seed 6 text streamers immediately so words begin emerging at once
    for (let i = 0; i < 6; i++) {
      this.spawnTextStreamer(i * (Math.PI * 2 / 6));
    }

    // Seed initial ink spreading agents
    for (let i = 0; i < 16; i++) {
      this.spawnPenAgent();
    }

    this.initialized = true;
  }

  resize(width, height) {
    if (!this.initialized || this.width !== width || this.height !== height) {
      const tempInk = document.createElement('canvas');
      tempInk.width = this.width;
      tempInk.height = this.height;
      const tCtx = tempInk.getContext('2d');
      if (this.width > 0 && this.height > 0) {
        tCtx.drawImage(this.inkCanvas, 0, 0);
      }

      this.width = width;
      this.height = height;
      this.inkCanvas.width = width;
      this.inkCanvas.height = height;
      this.textCanvas.width = width;
      this.textCanvas.height = height;

      if (tempInk.width > 0 && tempInk.height > 0) {
        this.inkCtx.drawImage(tempInk, 0, 0, width, height);
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
    const maxCorner = Math.hypot(this.width, this.height) * 0.85;

    this.textStreamers.push({
      baseAngle,
      currentR: 20 + Math.random() * 18, // starts near vanishing point
      currentAngle: baseAngle,
      spiralPitch: 36 + Math.random() * 26, // outward radial growth per turn
      angularSpeed: 0.70 + Math.random() * 0.35,
      wordIndex: Math.floor(Math.random() * this.words.length),
      charTimer: 0,
      charInterval: 0.038, // brisk, readable typing stream
      maxDist: maxCorner,
      isDone: false
    });
  }

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
      expansionSpeed: 26 + Math.random() * 32,
      rotationAngle: Math.random() * Math.PI * 2,
      rotationSpeed: (0.025 + Math.random() * 0.035) * (Math.random() > 0.5 ? 1 : -1),
      irregularity: 0.030 + Math.random() * 0.035,
      words: ringWords,
      isStamped: false,
      shadowBlur: 14 + Math.random() * 16,
      lineWidth: 1.2 + Math.random() * 1.5
    });
  }

  spawnPenAgent() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const startR = 12 + Math.random() * 40;
    const maxCorner = Math.hypot(this.width, this.height) * 0.85;

    // Multi-Tone Grayscale Pen Agents
    const tier = Math.random();
    let strokeColor, strokeWidth, opacity;

    if (tier < 0.07) {
      // Rubric red: the red ink of illuminated Victorian chapter openings
      strokeColor = '123, 44, 40';
      strokeWidth = 1.2 + Math.random() * 1.8;
      opacity = 0.7 + Math.random() * 0.25;
    } else if (tier < 0.35) {
      // Light graphite gray
      strokeColor = '175, 170, 162';
      strokeWidth = 0.8 + Math.random() * 1.2;
      opacity = 0.35 + Math.random() * 0.25;
    } else if (tier < 0.70) {
      // Medium charcoal gray
      strokeColor = '95, 90, 84';
      strokeWidth = 1.0 + Math.random() * 1.6;
      opacity = 0.55 + Math.random() * 0.25;
    } else {
      // Deep Victorian jet ink
      strokeColor = '12, 12, 16';
      strokeWidth = 1.4 + Math.random() * 2.2;
      opacity = 0.75 + Math.random() * 0.25;
    }

    this.penAgents.push({
      x: cx + Math.cos(angle) * startR,
      y: cy + Math.sin(angle) * startR,
      angle: angle,
      r: startR,
      speedR: 42 + Math.random() * 56,
      speedTheta: (0.40 + Math.random() * 0.65) * (Math.random() > 0.45 ? 1 : -1),
      noiseScale: 0.0024 + Math.random() * 0.0025,
      strokeColor,
      lineWidth: strokeWidth,
      opacity,
      isHatch: Math.random() > 0.52,
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
    const inkCtx = this.inkCtx;
    const textCtx = this.textCtx;

    // =========================================================================
    // 1. SPREADING INK LAYER (Cut Paper Rings, Pen Agents, Spreading Stains)
    // =========================================================================

    // Structural paper rings with drop shadows
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

      inkCtx.save();
      inkCtx.beginPath();
      inkCtx.moveTo(pts[0].x, pts[0].y);
      for (let s = 1; s < pts.length; s++) {
        inkCtx.lineTo(pts[s].x, pts[s].y);
      }
      inkCtx.closePath();

      // Sharp shadow & paper cut edge
      inkCtx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      inkCtx.shadowBlur = ring.shadowBlur;
      inkCtx.shadowOffsetX = 0;
      inkCtx.shadowOffsetY = 4;
      inkCtx.strokeStyle = 'rgba(12, 12, 16, 0.82)';
      inkCtx.lineWidth = ring.lineWidth;
      inkCtx.stroke();
      inkCtx.restore();

      if (ring.currentRadius >= ring.targetRadius) {
        this.paperRings.splice(i, 1);
      }
    }

    // Maintain active ink pen agents
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

      // Draw progressive ink stroke
      inkCtx.save();
      inkCtx.beginPath();
      inkCtx.moveTo(prevX, prevY);
      inkCtx.lineTo(p.x, p.y);
      inkCtx.strokeStyle = `rgba(${p.strokeColor}, ${p.opacity})`;
      inkCtx.lineWidth = p.lineWidth;
      inkCtx.lineCap = 'round';
      inkCtx.stroke();

      // Cross-hatching ticks (Victorian engraving)
      if (p.isHatch && Math.random() > 0.58) {
        const hLen = 4 + Math.random() * 10;
        const normAngle = p.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        inkCtx.beginPath();
        inkCtx.moveTo(p.x, p.y);
        inkCtx.lineTo(p.x + Math.cos(normAngle) * hLen, p.y + Math.sin(normAngle) * hLen);
        inkCtx.strokeStyle = `rgba(${p.strokeColor}, ${p.opacity * 0.85})`;
        inkCtx.lineWidth = Math.max(0.5, p.lineWidth * 0.65);
        inkCtx.stroke();
      }
      inkCtx.restore();

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

    // =========================================================================
    // 2. LUMINOUS WHITE WORD TUNNEL LAYER (Drawn ON TOP of spreading ink)
    // =========================================================================

    // Maintain continuous spiral word streamers
    if (this.textStreamers.length < this.maxStreamers) {
      this.nextStreamerTime -= dt * speedMult;
      if (this.nextStreamerTime <= 0) {
        this.spawnTextStreamer();
        this.nextStreamerTime = (1.2 + Math.random() * 1.2) / Math.max(1, speedMult * 0.85);
      }
    }

    // Gentle dissolve of older words (stepped so 8-bit alpha never leaves ghosts)
    this.textFadeTimer += dt * speedMult;
    if (this.textFadeTimer >= 0.22) {
      this.textFadeTimer = 0;
      textCtx.save();
      textCtx.globalCompositeOperation = 'destination-out';
      textCtx.fillStyle = 'rgba(0, 0, 0, 0.11)';
      textCtx.fillRect(0, 0, this.width, this.height);
      textCtx.restore();
    }

    // Stamp white letters onto textCanvas (which renders directly on top of inkCanvas)
    for (let i = this.textStreamers.length - 1; i >= 0; i--) {
      const st = this.textStreamers[i];
      st.charTimer += dt * speedMult;

      while (st.charTimer >= st.charInterval && st.wordIndex < this.words.length) {
        st.charTimer -= st.charInterval;
        const currentWord = this.words[st.wordIndex];
        st.wordIndex++;

        // Advance along Archimedean spiral
        const dAngle = 0.28;
        st.currentAngle += dAngle;
        st.currentR += (st.spiralPitch / (Math.PI * 2)) * dAngle;

        // Position on spiral
        const px = cx + Math.cos(st.currentAngle) * st.currentR;
        const py = cy + Math.sin(st.currentAngle) * st.currentR;

        // Perspective font scaling: small at center, large at corners
        const fontSize = Math.max(10, Math.min(28, Math.floor(10 + (st.currentR / 340) * 16)));

        textCtx.save();
        textCtx.translate(px, py);
        textCtx.rotate(st.currentAngle + Math.PI / 2);

        // LUMINOUS WHITE TYPOGRAPHY with dark drop shadow:
        // Highly visible on black ink as pure white, and visible on paper via shadow
        textCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        textCtx.shadowBlur = 6;
        textCtx.shadowOffsetX = 0;
        textCtx.shadowOffsetY = 2;

        const isKeyWord = /^(Alicia|madriguera|conejo|MERMELADA|NARANJA|pozo|cayendo)/i.test(currentWord);
        textCtx.font = `${isKeyWord ? 'italic 700' : '700'} ${isKeyWord ? fontSize + 4 : fontSize}px "IM Fell English", "Cormorant Garamond", "Times New Roman", serif`;
        textCtx.fillStyle = isKeyWord ? '#ffd98a' : '#ffffff'; // white words, gilded key words
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        textCtx.fillText(currentWord, 0, 0);

        // Subtle white ink connecting ligature
        if (Math.random() > 0.45) {
          const wWidth = textCtx.measureText(currentWord).width;
          textCtx.beginPath();
          textCtx.moveTo(-wWidth / 2, fontSize * 0.48);
          textCtx.lineTo(wWidth / 2 + 4, fontSize * 0.48);
          textCtx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          textCtx.lineWidth = 0.9;
          textCtx.stroke();
        }

        textCtx.restore();

        // Loop seamlessly through words
        if (st.wordIndex >= this.words.length) {
          st.wordIndex = 0;
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
  }

  render(ctx, width, height, cx, cy, lightWaves, alpha = 1.0) {
    if (alpha <= 0.001) return;

    this.resize(width, height);

    ctx.save();
    ctx.globalAlpha = alpha;

    // 1. Render Spreading Ink & Paper Layer
    ctx.drawImage(this.inkCanvas, 0, 0);

    // 2. Light wave shimmers across existing paths
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
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * wave.intensity})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // 3. Central Vanishing Point Dark Core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
    coreGrad.addColorStop(0, '#000000');
    coreGrad.addColorStop(0.65, '#0a0a0e');
    coreGrad.addColorStop(1, 'rgba(250, 247, 242, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();

    // 4. Render LUMINOUS WHITE WORD LAYER ON TOP OF EVERYTHING
    ctx.drawImage(this.textCanvas, 0, 0);

    ctx.restore();
  }
}
