/**
 * Post FX & Transition Layer — WHY BOTHER?
 * - Keyhole / circle iris wipes (the tiny door of Wonderland as the gate between eras)
 * - Era-tinted vignette and analogue paper grain
 * - Radial speed lines while diving through the hole
 * - Colored flashes
 * - Synthesized whoosh & chime (WebAudio, no external files)
 */

const ERA_LOOK = {
  // vignette inner/outer, grain amount, rim color for the keyhole
  opening: { vig: 'rgba(6, 4, 10, 0.85)', grain: 0.07, rim: [235, 196, 120] },
  0: { vig: 'rgba(30, 20, 10, 0.55)', grain: 0.11, rim: [235, 196, 120] },
  1: { vig: 'rgba(6, 10, 34, 0.70)', grain: 0.06, rim: [140, 235, 230] },
  2: { vig: 'rgba(14, 0, 6, 0.85)', grain: 0.09, rim: [235, 50, 90] },
  3: { vig: 'rgba(8, 4, 18, 0.55)', grain: 0.05, rim: [255, 215, 90] },
  interlude: { vig: 'rgba(0, 0, 0, 0.80)', grain: 0.07, rim: [235, 196, 120] }
};

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class PostFX {
  constructor() {
    this.width = 0;
    this.height = 0;

    // Iris: 1 = fully open, 0 = fully closed (black)
    this.iris = 1;
    this.irisTween = null;
    this.irisShape = 'keyhole';
    this.irisRim = [235, 196, 120];

    this.flash = { alpha: 0, color: '255, 255, 255', decay: 2.2 };
    this.speedLines = 0;
    this.look = ERA_LOOK.opening;
    this.time = 0;

    this.maskCanvas = document.createElement('canvas');
    this.maskCtx = this.maskCanvas.getContext('2d');

    // Pre-generated grain tile
    this.grainCanvas = document.createElement('canvas');
    this.grainCanvas.width = 180;
    this.grainCanvas.height = 180;
    const g = this.grainCanvas.getContext('2d');
    const img = g.createImageData(180, 180);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    this.grainPattern = null;

    this.vignetteCache = { key: '', grad: null };
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.maskCanvas.width = width;
    this.maskCanvas.height = height;
    this.vignetteCache.key = '';
  }

  setLook(key) {
    this.look = ERA_LOOK[key] || ERA_LOOK.interlude;
    this.vignetteCache.key = '';
  }

  /**
   * Animate the iris to a target openness.
   * @param {number} to 0 closed .. 1 open
   * @param {number} duration seconds
   * @param {object} opts { shape: 'keyhole'|'circle', delay, from, rim:[r,g,b], onDone }
   */
  irisTo(to, duration = 1.0, opts = {}) {
    if (opts.shape) this.irisShape = opts.shape;
    if (opts.rim) this.irisRim = opts.rim;
    const from = opts.from !== undefined ? opts.from : this.iris;
    this.iris = from;
    this.irisTween = {
      from,
      to,
      duration: Math.max(0.01, duration),
      delay: opts.delay || 0,
      t: 0,
      onDone: opts.onDone || null
    };
  }

  setIris(v) {
    this.iris = v;
    this.irisTween = null;
  }

  triggerFlash(color = '255, 255, 255', alpha = 0.8, decay = 2.2) {
    this.flash.color = color;
    this.flash.alpha = Math.max(this.flash.alpha, alpha);
    this.flash.decay = decay;
  }

  update(dt) {
    this.time += dt;
    if (this.irisTween) {
      const tw = this.irisTween;
      if (tw.delay > 0) {
        tw.delay -= dt;
      } else {
        tw.t += dt;
        const p = Math.min(1, tw.t / tw.duration);
        this.iris = tw.from + (tw.to - tw.from) * easeInOutCubic(p);
        if (p >= 1) {
          this.irisTween = null;
          if (tw.onDone) tw.onDone();
        }
      }
    }
    if (this.flash.alpha > 0) {
      this.flash.alpha = Math.max(0, this.flash.alpha - dt * this.flash.decay);
    }
  }

  // ------------------------------------------------------------------
  // Keyhole path in a local unit (R = scale)
  // ------------------------------------------------------------------
  keyholePath(ctx, cx, cy, R) {
    const headR = R * 0.5;
    const headY = cy - R * 0.32;
    ctx.moveTo(cx + headR, headY);
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.moveTo(cx - R * 0.2, headY + headR * 0.55);
    ctx.lineTo(cx + R * 0.2, headY + headR * 0.55);
    ctx.lineTo(cx + R * 0.46, cy + R * 1.02);
    ctx.quadraticCurveTo(cx, cy + R * 1.1, cx - R * 0.46, cy + R * 1.02);
    ctx.closePath();
  }

  renderIris(ctx, cx, cy) {
    if (this.iris >= 0.999) return;
    const w = this.width;
    const h = this.height;
    const m = this.maskCtx;

    // Keyhole needs a larger scale to cover the screen when fully open
    const diag = Math.hypot(w, h);
    const maxR = this.irisShape === 'keyhole' ? diag * 1.25 : diag * 0.6;
    const R = Math.max(0, this.iris) * maxR;

    m.setTransform(1, 0, 0, 1, 0, 0);
    m.globalCompositeOperation = 'source-over';
    m.clearRect(0, 0, w, h);
    m.fillStyle = '#030205';
    m.fillRect(0, 0, w, h);

    if (R > 0.5) {
      m.globalCompositeOperation = 'destination-out';
      m.beginPath();
      if (this.irisShape === 'keyhole') {
        this.keyholePath(m, cx, cy, R);
      } else {
        m.arc(cx, cy, R, 0, Math.PI * 2);
      }
      m.fill();
    }

    ctx.save();
    ctx.drawImage(this.maskCanvas, 0, 0);

    // Glowing rim around the opening (gold / era tinted)
    if (R > 1 && this.iris < 0.98) {
      const [r, g, b] = this.irisRim;
      const rimAlpha = Math.min(1, (1 - this.iris) * 3) * Math.min(1, this.iris * 12);
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      if (this.irisShape === 'keyhole') {
        this.keyholePath(ctx, cx, cy, R);
      } else {
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
      }
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.9 * rimAlpha})`;
      ctx.shadowBlur = 28;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.85 * rimAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * rimAlpha})`;
      ctx.stroke();
    }
    ctx.restore();
  }

  renderSpeedLines(ctx, cx, cy) {
    if (this.speedLines <= 0.02) return;
    const w = this.width;
    const h = this.height;
    const maxR = Math.hypot(w, h) * 0.75;
    const count = Math.floor(30 + this.speedLines * 70);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r1 = maxR * (0.12 + Math.random() * 0.5);
      const r2 = r1 + maxR * (0.1 + Math.random() * 0.35) * this.speedLines;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      const [r, g, b] = this.look.rim;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.05 + Math.random() * 0.22 * this.speedLines})`;
      ctx.lineWidth = 0.6 + Math.random() * 2.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  renderVignette(ctx, cx, cy) {
    const w = this.width;
    const h = this.height;
    const key = `${Math.round(cx)}_${Math.round(cy)}_${this.look.vig}`;
    if (this.vignetteCache.key !== key) {
      const r = Math.hypot(w, h) * 0.62;
      const g = ctx.createRadialGradient(cx, cy, r * 0.42, cx, cy, r);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, this.look.vig);
      this.vignetteCache = { key, grad: g };
    }
    ctx.save();
    ctx.fillStyle = this.vignetteCache.grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  renderGrain(ctx) {
    if (!this.grainPattern) {
      this.grainPattern = ctx.createPattern(this.grainCanvas, 'repeat');
    }
    if (!this.grainPattern || this.look.grain <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.look.grain;
    ctx.globalCompositeOperation = 'overlay';
    const ox = Math.floor(Math.random() * 180);
    const oy = Math.floor(Math.random() * 180);
    ctx.translate(-ox, -oy);
    ctx.fillStyle = this.grainPattern;
    ctx.fillRect(0, 0, this.width + 180, this.height + 180);
    ctx.restore();
  }

  renderFlash(ctx) {
    if (this.flash.alpha <= 0.002) return;
    ctx.save();
    ctx.fillStyle = `rgba(${this.flash.color}, ${this.flash.alpha})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  /**
   * Final composite pass, called after all scene layers are drawn
   */
  render(ctx, cx, cy) {
    this.renderSpeedLines(ctx, cx, cy);
    this.renderVignette(ctx, cx, cy);
    this.renderGrain(ctx);
    this.renderFlash(ctx);
    this.renderIris(ctx, cx, cy);
  }
}

/**
 * Tiny synthesized sound design layer.
 * Independent of the music <audio> element so it works from file:// too.
 */
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.noiseBuffer = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) {
      return false;
    }
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? 0.22 : 0;
  }

  whoosh(duration = 1.6, up = true) {
    if (!this.enabled || !this.ensure()) return;
    const c = this.ctx;
    const t0 = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(up ? 220 : 2600, t0);
    bp.frequency.exponentialRampToValueAtTime(up ? 2800 : 180, t0 + duration);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.9, t0 + duration * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  }

  chime(baseFreq = 660) {
    if (!this.enabled || !this.ensure()) return;
    const c = this.ctx;
    const t0 = c.currentTime;
    const notes = [1, 1.25, 1.5, 2];
    notes.forEach((m, i) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = baseFreq * m;
      const g = c.createGain();
      const st = t0 + i * 0.09;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(0.35 / (i + 1), st + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 1.6);
      o.connect(g).connect(this.master);
      o.start(st);
      o.stop(st + 1.7);
    });
  }

  tick() {
    if (!this.enabled || !this.ensure()) return;
    const c = this.ctx;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.value = 1800;
    const g = c.createGain();
    g.gain.setValueAtTime(0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
    o.connect(g).connect(this.master);
    o.start(t0);
    o.stop(t0 + 0.05);
  }
}
