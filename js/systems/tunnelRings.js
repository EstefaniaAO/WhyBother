/**
 * Tunnel Rings — live perspective rings that rush toward the camera,
 * giving each rabbit hole real depth and speed on top of the painted layer.
 *
 *  ink    (1865) → engraved double rules with hatching ticks and bookshelf
 *                  segments (the cupboards and shelves on the walls of the well)
 *  toon   (1951) → scalloped candy rings in turquoise / violet / gold with
 *                  pearls and twinkling stars, additive glow
 *  gothic (2011) → jagged thorn rings in wine and steel, crimson glints
 */

const TOON_COLS = [
  [64, 224, 214],
  [176, 92, 236],
  [255, 214, 72],
  [255, 122, 168],
  [110, 170, 255]
];

export class TunnelRings {
  constructor(style = 'ink') {
    this.style = style;
    this.rings = [];
    this.count = 14;
    this.time = 0;
    this.stars = [];
  }

  reset() {
    this.rings = [];
    for (let i = 0; i < this.count; i++) {
      this.rings.push(this.makeRing(0.25 + (i / this.count) * 3.4));
    }
    this.stars = [];
  }

  makeRing(z) {
    return {
      z,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      kind: Math.random(),
      col: TOON_COLS[Math.floor(Math.random() * TOON_COLS.length)],
      lobes: 10 + Math.floor(Math.random() * 10),
      seed: Math.random() * 1000
    };
  }

  update(dt, speedMult = 1) {
    if (this.rings.length === 0) this.reset();
    this.time += dt * speedMult;
    for (let i = 0; i < this.rings.length; i++) {
      const r = this.rings[i];
      r.z -= dt * speedMult * (0.22 + r.z * 0.14);
      r.rot += r.spin * dt * speedMult * (this.style === 'gothic' ? -1.4 : 1);
      if (r.z <= 0.18) {
        this.rings[i] = this.makeRing(3.6 + Math.random() * 0.3);
      }
    }

    if (this.style === 'toon') {
      if (Math.random() < dt * 14 * speedMult) {
        this.stars.push({
          a: Math.random() * Math.PI * 2,
          z: 3.4,
          life: 0,
          size: 0.6 + Math.random() * 1.2,
          col: TOON_COLS[Math.floor(Math.random() * TOON_COLS.length)]
        });
      }
      for (let i = this.stars.length - 1; i >= 0; i--) {
        const s = this.stars[i];
        s.z -= dt * speedMult * (0.3 + s.z * 0.2);
        s.life += dt;
        if (s.z <= 0.2) this.stars.splice(i, 1);
      }
    }
  }

  render(ctx, width, height, cx, cy, alpha = 1) {
    if (alpha <= 0.01) return;
    const unit = Math.min(width, height);
    const hw = width / 2;
    const hh = height / 2;
    const sorted = this.rings.slice().sort((a, b) => b.z - a.z);

    ctx.save();
    for (const ring of sorted) {
      const persp = 1 / ring.z;
      const R = unit * 0.16 * persp;
      // Curved-tunnel parallax: far rings sit at the vanishing point, near rings at screen center
      const k = Math.min(1, 0.28 / ring.z);
      const rx = cx + (hw - cx) * k;
      const ry = cy + (hh - cy) * k;
      const farFade = Math.min(1, (3.7 - ring.z) / 1.0);
      const nearFade = Math.min(1, (ring.z - 0.18) / 0.35);
      const a = Math.max(0, Math.min(farFade, nearFade)) * alpha;
      if (a <= 0.01) continue;

      if (this.style === 'ink') this.drawInk(ctx, rx, ry, R, ring, a, persp);
      else if (this.style === 'toon') this.drawToon(ctx, rx, ry, R, ring, a, persp);
      else this.drawGothic(ctx, rx, ry, R, ring, a, persp);
    }

    if (this.style === 'toon') this.drawStars(ctx, width, height, cx, cy, alpha);
    ctx.restore();
  }

  drawInk(ctx, x, y, R, ring, a, persp) {
    const lw = Math.max(0.6, persp * 0.9);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = `rgba(14, 12, 16, ${0.55 * a})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = lw * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, R * 1.035, 0, Math.PI * 2);
    ctx.stroke();

    if (ring.kind < 0.45) {
      // bookshelf band: books of varied height pointing inward (two batched paths)
      const n = 70;
      ctx.lineWidth = Math.max(0.5, persp * 0.6);
      const black = new Path2D();
      const red = new Path2D();
      for (let i = 0; i < n; i++) {
        if (Math.sin(ring.seed * 3 + i) > 0.82) continue;
        const t = ring.rot + (i / n) * Math.PI * 2;
        const hgt = R * (0.06 + 0.07 * Math.abs(Math.sin(ring.seed + i * 1.7)));
        const c = Math.cos(t);
        const s = Math.sin(t);
        const path = Math.sin(ring.seed + i * 2.3) > 0.9 ? red : black;
        path.moveTo(x + c * R, y + s * R);
        path.lineTo(x + c * (R - hgt), y + s * (R - hgt));
      }
      ctx.strokeStyle = `rgba(14, 12, 16, ${0.6 * a})`;
      ctx.stroke(black);
      ctx.strokeStyle = `rgba(123, 44, 40, ${0.8 * a})`;
      ctx.stroke(red);
    } else {
      // engraved hatching ticks
      const n = 48;
      ctx.lineWidth = Math.max(0.4, persp * 0.45);
      ctx.strokeStyle = `rgba(14, 12, 16, ${0.45 * a})`;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const t = ring.rot + (i / n) * Math.PI * 2;
        const c = Math.cos(t);
        const s = Math.sin(t);
        ctx.moveTo(x + c * R, y + s * R);
        ctx.lineTo(x + Math.cos(t + 0.04) * R * 1.06, y + Math.sin(t + 0.04) * R * 1.06);
      }
      ctx.stroke();
    }
  }

  drawToon(ctx, x, y, R, ring, a, persp) {
    const [r, g, b] = ring.col;
    const lobes = ring.lobes;
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    const steps = lobes * 8;
    for (let i = 0; i <= steps; i++) {
      const t = ring.rot + (i / steps) * Math.PI * 2;
      const scallop = 1 + 0.045 * Math.abs(Math.sin((i / steps) * Math.PI * lobes));
      const px = x + Math.cos(t) * R * scallop;
      const py = y + Math.sin(t) * R * scallop;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.38 * a})`;
    ctx.lineWidth = Math.max(1, persp * 3.2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 * a})`;
    ctx.lineWidth = Math.max(0.5, persp * 0.9);
    ctx.stroke();

    // pearls on the lobe tips
    if (ring.kind > 0.4) {
      ctx.fillStyle = `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, ${0.55 * a})`;
      const pr = Math.max(0.8, persp * 2.2);
      for (let i = 0; i < lobes; i++) {
        const t = ring.rot + ((i + 0.5) / lobes) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(t) * R * 1.045, y + Math.sin(t) * R * 1.045, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawGothic(ctx, x, y, R, ring, a, persp) {
    const n = 64;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const t = ring.rot + (i / n) * Math.PI * 2;
      const thorn = i % 4 === 0 ? 1.07 + 0.05 * Math.sin(ring.seed + i) : 1.0;
      const px = x + Math.cos(t) * R * thorn;
      const py = y + Math.sin(t) * R * thorn;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const isSteel = ring.kind > 0.7;
    ctx.strokeStyle = isSteel ? `rgba(110, 170, 210, ${0.32 * a})` : `rgba(150, 18, 44, ${0.5 * a})`;
    ctx.lineWidth = Math.max(0.8, persp * 1.8);
    ctx.stroke();

    // crimson glints that slide around the ring
    ctx.globalCompositeOperation = 'lighter';
    const gl = 3;
    for (let i = 0; i < gl; i++) {
      const t = ring.rot * 3 + this.time * 0.6 + (i / gl) * Math.PI * 2 + ring.seed;
      const gx = x + Math.cos(t) * R;
      const gy = y + Math.sin(t) * R;
      const gr = Math.max(2, persp * 9);
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      grad.addColorStop(0, `rgba(255, 70, 110, ${0.55 * a})`);
      grad.addColorStop(1, 'rgba(255, 70, 110, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawStars(ctx, width, height, cx, cy, alpha) {
    const unit = Math.min(width, height);
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.stars) {
      const persp = 1 / s.z;
      const R = unit * 0.22 * persp;
      const x = cx + Math.cos(s.a) * R;
      const y = cy + Math.sin(s.a) * R;
      const size = s.size * persp * 2.4;
      const tw = 0.6 + 0.4 * Math.sin(s.life * 9 + s.a * 5);
      const a = Math.min(1, (3.4 - s.z) * 1.5) * tw * alpha;
      const [r, g, b] = s.col;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.85 * a})`;
      ctx.lineWidth = Math.max(0.6, size * 0.25);
      ctx.beginPath();
      ctx.moveTo(x - size * 2, y);
      ctx.lineTo(x + size * 2, y);
      ctx.moveTo(x, y - size * 2);
      ctx.lineTo(x, y + size * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * a})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, size * 0.45), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}
