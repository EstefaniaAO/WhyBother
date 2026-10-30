/**
 * Interlude Scene — the space between eras.
 * Replaces the flat black screen behind the narrative phrases with a living,
 * slowly turning rabbit-hole spiral, Wonderland objects drifting upward as we
 * keep falling, glowing dust, and a huge ghostly year that marks the time jump.
 *
 * Themes:
 *   opening → warm dusk before the fall (paper cut-outs, golden dust)
 *   1       → toward 1951: midnight blue spiral, gold & turquoise, toon objects
 *   2       → toward 2011: blackened wine spiral, crimson embers, gothic objects
 *   3       → toward CREATE: iridescent violet spiral, every color at once
 */
import { WonderObjects } from './wonderObjects.js';

const THEMES = {
  opening: {
    bgIn: '#1a1220', bgOut: '#06040a',
    armA: 'rgba(235, 196, 120, 0.035)', armB: 'rgba(0, 0, 0, 0.0)',
    dust: [[255, 214, 140], [255, 240, 210]],
    style: 'ink', year: '', objAlpha: 0.55, objects: 9
  },
  1: {
    bgIn: '#18245a', bgOut: '#04061a',
    armA: 'rgba(70, 120, 230, 0.10)', armB: 'rgba(255, 210, 80, 0.035)',
    dust: [[255, 214, 72], [100, 230, 220], [200, 160, 255]],
    style: 'toon', year: '1951', objAlpha: 0.8, objects: 12
  },
  2: {
    bgIn: '#2a0612', bgOut: '#020103',
    armA: 'rgba(160, 20, 50, 0.10)', armB: 'rgba(90, 140, 190, 0.035)',
    dust: [[230, 40, 80], [140, 190, 230]],
    style: 'gothic', year: '2011', objAlpha: 0.85, objects: 11
  },
  3: {
    bgIn: '#2b0f4a', bgOut: '#05020c',
    armA: 'rgba(180, 90, 255, 0.10)', armB: 'rgba(255, 210, 80, 0.05)',
    dust: [[180, 92, 255], [255, 210, 63], [63, 214, 198], [255, 111, 168]],
    style: 'dream', year: 'HOY', objAlpha: 0.8, objects: 12
  }
};

export class InterludeScene {
  constructor() {
    this.theme = THEMES.opening;
    this.themeKey = 'opening';
    this.time = 0;
    this.alpha = 0;
    this.targetAlpha = 0;
    this.objects = new WonderObjects({ style: 'ink', mode: 'drift', maxObjects: 10 });
    this.dust = [];
    this.pulse = 0;
  }

  setTheme(key) {
    this.themeKey = key;
    this.theme = THEMES[key] || THEMES.opening;
    this.objects.setStyle(this.theme.style);
    this.objects.maxObjects = this.theme.objects;
    this.objects.reset(true);
    this.dust = [];
    for (let i = 0; i < 90; i++) this.dust.push(this.makeDust(true));
  }

  show(key) {
    this.setTheme(key);
    this.alpha = 0;
    this.targetAlpha = 1;
  }

  hide() {
    this.targetAlpha = 0;
  }

  /** Called on every phrase change for a small breathing accent */
  bump() {
    this.pulse = 1;
  }

  makeDust(randomY = false) {
    const cols = this.theme.dust;
    return {
      x: Math.random(),
      y: randomY ? Math.random() : 1.05,
      r: 0.6 + Math.random() * 2.2,
      v: 0.01 + Math.random() * 0.035,
      ph: Math.random() * Math.PI * 2,
      col: cols[Math.floor(Math.random() * cols.length)]
    };
  }

  update(dt, width, height) {
    this.time += dt;
    this.alpha += (this.targetAlpha - this.alpha) * Math.min(1, dt * 1.6);
    this.pulse = Math.max(0, this.pulse - dt * 1.2);
    if (this.alpha < 0.002 && this.targetAlpha === 0) return;
    this.objects.update(dt, 1, width, height);
    for (let i = 0; i < this.dust.length; i++) {
      const d = this.dust[i];
      d.y -= d.v * dt;
      d.ph += dt;
      if (d.y < -0.05) this.dust[i] = this.makeDust(false);
    }
  }

  isVisible() {
    return this.alpha > 0.002;
  }

  render(ctx, width, height, cx, cy) {
    if (!this.isVisible()) return;
    const T = this.theme;
    const a = this.alpha;
    const maxR = Math.hypot(width, height) * 0.75;

    ctx.save();
    ctx.globalAlpha = a;

    // 1. Deep radial ground
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    bg.addColorStop(0, T.bgIn);
    bg.addColorStop(1, T.bgOut);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Hypnotic twisting spiral arms (the hole keeps turning)
    const arms = 10;
    const twist = 0.0062;
    const rot = this.time * 0.12;
    for (let k = 0; k < arms; k++) {
      const base = rot + (k / arms) * Math.PI * 2;
      const span = (Math.PI * 2) / arms / 2;
      ctx.beginPath();
      const steps = 46;
      for (let i = 0; i <= steps; i++) {
        const r = (i / steps) * maxR;
        const th = base + r * twist;
        const px = cx + Math.cos(th) * r;
        const py = cy + Math.sin(th) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      for (let i = steps; i >= 0; i--) {
        const r = (i / steps) * maxR;
        const th = base + span + r * twist;
        ctx.lineTo(cx + Math.cos(th) * r, cy + Math.sin(th) * r);
      }
      ctx.closePath();
      ctx.fillStyle = k % 2 === 0 ? T.armA : T.armB;
      ctx.fill();
    }

    // 3. Ghostly giant year
    if (T.year) {
      const fs = Math.min(width * 0.36, height * 0.62);
      ctx.save();
      ctx.translate(cx, cy + Math.sin(this.time * 0.5) * 6);
      ctx.font = `900 ${Math.round(fs)}px "Cinzel", "Times New Roman", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const breathe = 0.05 + this.pulse * 0.05;
      ctx.fillStyle = `rgba(255, 255, 255, ${breathe})`;
      ctx.fillText(T.year, 0, 0);
      ctx.lineWidth = 1.2;
      const c = T.dust[0];
      ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.16 + this.pulse * 0.2})`;
      ctx.strokeText(T.year, 0, 0);
      ctx.restore();
    }

    // 4. Drifting Wonderland objects
    this.objects.render(ctx, width, height, cx, cy, T.objAlpha * a);

    // 5. Glowing dust motes
    ctx.globalCompositeOperation = 'lighter';
    for (const d of this.dust) {
      const x = d.x * width + Math.sin(d.ph * 0.7) * 14;
      const y = d.y * height;
      const tw = 0.45 + 0.55 * Math.sin(d.ph * 2.2);
      const [r, g, b] = d.col;
      const rad = d.r * 3;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.7 * tw * a})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // 6. Center darkness so the text breathes
    const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.55);
    vg.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
    vg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }
}
