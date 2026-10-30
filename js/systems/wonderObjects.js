/**
 * Wonder Objects — the things Alice sees on the walls of the well.
 * "...cupboards and book-shelves; here and there maps and pictures hung upon pegs.
 *  She took down a jar... ORANGE MARMALADE..."
 *
 * Procedural vector objects (pocket watches, keys, teacups, playing cards, jars,
 * "BÉBEME" bottles, mushrooms, top hats, books, roses) drawn in the visual
 * language of each era:
 *   ink    → 1865 Tenniel engraving: paper fills, jet-black lines, hatching
 *   toon   → 1951 animation: flat saturated fills, navy cel outline, highlight
 *   gothic → 2011 game: near-black silhouettes with crimson / steel rim light
 *   dream  → CREATE prelude: iridescent fills with golden outline
 *
 * Two motion modes:
 *   'tunnel' → objects fly out of the vanishing point toward the camera (z-depth)
 *   'drift'  → objects float upward past the viewer, as if we keep falling
 */

const WO_TYPES = ['watch', 'key', 'teacup', 'card', 'jar', 'bottle', 'mushroom', 'hat', 'book', 'rose', 'card', 'watch'];
const WO_SUITS = ['♠', '♥', '♦', '♣'];

const WO_TOON_FILLS = ['#ffcf3f', '#35c9c1', '#9b4fd6', '#ff7aa8', '#4f8df0', '#ff9a3c', '#f5f1e6'];
const WO_DREAM_FILLS = ['#b45cff', '#ffd23f', '#3fd6c6', '#ff6fa8', '#6fb6ff', '#c9b2ff'];

function woPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class WonderObjects {
  constructor(options = {}) {
    this.style = options.style || 'ink';
    this.mode = options.mode || 'tunnel';
    this.maxObjects = options.maxObjects || 14;
    this.objects = [];
    this.time = 0;
    this.spawnTimer = 0;
    this.alpha = 1;
    this.width = 0;
    this.height = 0;
  }

  setStyle(style) {
    this.style = style;
  }

  reset(prefill = true) {
    this.objects = [];
    if (prefill) {
      for (let i = 0; i < this.maxObjects; i++) {
        this.objects.push(this.makeObject(true));
      }
    }
  }

  makeObject(randomDepth = false) {
    const type = woPick(WO_TYPES);
    const o = {
      type,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.6,
      fill: this.style === 'dream' ? woPick(WO_DREAM_FILLS) : woPick(WO_TOON_FILLS),
      suit: woPick(WO_SUITS),
      seed: Math.random()
    };
    if (this.mode === 'tunnel') {
      o.angle = Math.random() * Math.PI * 2;
      o.orbit = (Math.random() - 0.5) * 0.35;
      o.radial = 0.55 + Math.random() * 0.75; // radial distance factor
      o.z = randomDepth ? 0.35 + Math.random() * 3.2 : 3.2 + Math.random() * 0.6;
      o.speed = 0.55 + Math.random() * 0.4;
      o.size = 0.75 + Math.random() * 0.6;
    } else {
      o.x = Math.random();
      o.y = randomDepth ? Math.random() * 1.3 - 0.15 : 1.15 + Math.random() * 0.2;
      o.depth = 0.35 + Math.random() * 0.65; // parallax / size / speed
      o.sway = Math.random() * Math.PI * 2;
      o.size = 0.7 + Math.random() * 0.7;
    }
    return o;
  }

  update(dt, speedMult = 1, width = 0, height = 0) {
    this.time += dt * speedMult;
    if (width) this.width = width;
    if (height) this.height = height;

    while (this.objects.length < this.maxObjects) {
      this.objects.push(this.makeObject(false));
    }

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      o.rot += o.spin * dt * speedMult;
      if (this.mode === 'tunnel') {
        o.z -= o.speed * dt * speedMult * (0.35 + o.z * 0.18);
        o.angle += o.orbit * dt * speedMult;
        if (o.z <= 0.12) {
          this.objects[i] = this.makeObject(false);
        }
      } else {
        o.y -= (0.035 + o.depth * 0.07) * dt * speedMult;
        o.sway += dt * 0.6;
        if (o.y < -0.25) {
          this.objects[i] = this.makeObject(false);
        }
      }
    }
  }

  render(ctx, width, height, cx, cy, alpha = 1) {
    if (alpha <= 0.01) return;
    const unit = Math.min(width, height);

    // Sort far to near
    const list = this.mode === 'tunnel'
      ? this.objects.slice().sort((a, b) => b.z - a.z)
      : this.objects.slice().sort((a, b) => a.depth - b.depth);

    for (const o of list) {
      let x, y, s, a;
      if (this.mode === 'tunnel') {
        const persp = 1 / o.z;
        const R = unit * 0.32 * o.radial * persp;
        x = cx + Math.cos(o.angle) * R;
        y = cy + Math.sin(o.angle) * R;
        s = unit * 0.045 * o.size * persp;
        // fade in from the deep, fade near camera
        const farFade = Math.min(1, (3.6 - o.z) / 1.2);
        const nearFade = Math.min(1, (o.z - 0.12) / 0.25);
        a = Math.max(0, Math.min(farFade, nearFade));
        if (x < -s * 2 || x > width + s * 2 || y < -s * 2 || y > height + s * 2) continue;
      } else {
        x = o.x * width + Math.sin(o.sway) * 30 * o.depth;
        y = o.y * height;
        s = unit * 0.05 * o.size * (0.5 + o.depth);
        a = 0.35 + o.depth * 0.65;
      }
      if (a <= 0.01 || s < 1.5) continue;

      ctx.save();
      ctx.globalAlpha = a * alpha;
      ctx.translate(x, y);
      ctx.rotate(o.rot);
      ctx.scale(s, s);
      this.drawObject(ctx, o, s);
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------
  // Style resolver
  // ------------------------------------------------------------------
  styleFor(o, pxScale) {
    const lw = Math.max(0.025, 1.4 / pxScale);
    switch (this.style) {
      case 'ink':
        return { body: '#fbf8f0', accent: '#e9e0cc', line: '#111014', red: '#7b2c28', lw, hatch: true, glow: null, text: '#111014' };
      case 'toon':
        return { body: o.fill, accent: '#ffffff', line: '#1b2350', red: '#e8344e', lw: lw * 1.3, hatch: false, glow: null, text: '#1b2350', shine: true };
      case 'gothic': {
        const rim = o.seed > 0.55 ? '#e0284f' : (o.seed > 0.25 ? '#7fb8e0' : '#c9b9ec');
        return { body: '#120a14', accent: '#22121f', line: rim, red: '#e0284f', lw: lw * 1.1, hatch: false, glow: rim, text: rim };
      }
      case 'dream':
      default:
        return { body: o.fill, accent: '#ffffff', line: '#ffe08a', red: '#ff5c8a', lw: lw * 1.2, hatch: false, glow: o.fill, text: '#2a1240', shine: true };
    }
  }

  fs(ctx, S, fill = S.body) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = S.lw;
    ctx.strokeStyle = S.line;
    ctx.stroke();
  }

  hatch(ctx, S, x0, y0, x1, y1, n = 5) {
    if (!S.hatch) return;
    ctx.save();
    ctx.lineWidth = S.lw * 0.6;
    ctx.strokeStyle = 'rgba(17, 16, 20, 0.7)';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      ctx.beginPath();
      ctx.moveTo(x0 + (x1 - x0) * t, y0);
      ctx.lineTo(x0 + (x1 - x0) * t - 0.18, y1);
      ctx.stroke();
    }
    ctx.restore();
  }

  shine(ctx, S, x, y, rx, ry) {
    if (!S.shine) return;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Canvas text at tiny unit sizes is unreliable, so draw it at 100x and scale down
  label(ctx, text, x, y, size, weight = 'bold', family = 'Georgia, serif') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.01, 0.01);
    ctx.font = `${weight} ${Math.round(size * 100)}px ${family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  drawObject(ctx, o, pxScale) {
    const S = this.styleFor(o, pxScale);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const big = pxScale > 16;
    if (!big) {
      // small, far objects: no shadows (cheap)
    } else if (S.glow) {
      ctx.shadowColor = S.glow;
      ctx.shadowBlur = 14;
    } else if (this.style === 'ink') {
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
    } else if (this.style === 'toon') {
      ctx.shadowColor = 'rgba(10, 14, 40, 0.45)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
    }
    const detail = pxScale > 14;
    switch (o.type) {
      case 'watch': this.drawWatch(ctx, S, detail); break;
      case 'key': this.drawKey(ctx, S); break;
      case 'teacup': this.drawTeacup(ctx, S, detail); break;
      case 'card': this.drawCard(ctx, S, o, detail); break;
      case 'jar': this.drawJar(ctx, S, detail, pxScale); break;
      case 'bottle': this.drawBottle(ctx, S, detail, pxScale); break;
      case 'mushroom': this.drawMushroom(ctx, S); break;
      case 'hat': this.drawHat(ctx, S, detail, pxScale); break;
      case 'book': this.drawBook(ctx, S); break;
      case 'rose': this.drawRose(ctx, S); break;
      default: this.drawWatch(ctx, S, detail);
    }
  }

  // ------------------------------------------------------------------
  // Shapes (unit space ~[-1, 1])
  // ------------------------------------------------------------------
  drawWatch(ctx, S, detail) {
    // chain loop + crown
    ctx.beginPath();
    ctx.arc(0, -1.08, 0.2, 0, Math.PI * 2);
    ctx.lineWidth = S.lw * 1.4;
    ctx.strokeStyle = S.line;
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(-0.12, -0.98, 0.24, 0.2);
    this.fs(ctx, S, this.style === 'ink' ? S.accent : (this.style === 'gothic' ? S.accent : '#ffcf3f'));
    // case
    ctx.beginPath();
    ctx.arc(0, 0, 0.82, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'toon' ? '#ffcf3f' : (this.style === 'dream' ? '#ffd23f' : S.accent));
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // face
    ctx.beginPath();
    ctx.arc(0, 0, 0.66, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'gothic' ? '#1c1220' : '#fbf6e8');
    if (detail) {
      ctx.lineWidth = S.lw * 0.8;
      ctx.strokeStyle = S.line;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 0.52, Math.sin(a) * 0.52);
        ctx.lineTo(Math.cos(a) * 0.6, Math.sin(a) * 0.6);
        ctx.stroke();
      }
    }
    const t = this.time;
    ctx.lineWidth = S.lw * 1.4;
    ctx.strokeStyle = this.style === 'gothic' ? S.line : '#111014';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(t * 2.4) * 0.45, Math.sin(t * 2.4) * 0.45);
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(t * 0.3 - 1) * 0.3, Math.sin(t * 0.3 - 1) * 0.3);
    ctx.stroke();
    this.shine(ctx, S, -0.3, -0.35, 0.18, 0.08);
  }

  drawKey(ctx, S) {
    ctx.beginPath();
    // bow (ornate ring)
    ctx.arc(-0.62, 0, 0.36, 0, Math.PI * 2);
    ctx.moveTo(-0.62 + 0.16, 0);
    ctx.arc(-0.62, 0, 0.16, 0, Math.PI * 2, true);
    // shaft
    ctx.rect(-0.28, -0.08, 1.2, 0.16);
    // bits
    ctx.rect(0.62, 0.08, 0.1, 0.28);
    ctx.rect(0.8, 0.08, 0.1, 0.2);
    ctx.fillStyle = this.style === 'toon' ? '#ffcf3f' : (this.style === 'dream' ? '#ffd23f' : S.body);
    ctx.fill('evenodd');
    ctx.lineWidth = S.lw;
    ctx.strokeStyle = S.line;
    ctx.stroke();
  }

  drawTeacup(ctx, S, detail) {
    // saucer
    ctx.beginPath();
    ctx.ellipse(0, 0.62, 0.95, 0.2, 0, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'toon' ? '#f5f1e6' : S.accent);
    // handle
    ctx.beginPath();
    ctx.ellipse(0.72, 0.02, 0.26, 0.22, 0, 0, Math.PI * 2);
    ctx.lineWidth = S.lw * 3;
    ctx.strokeStyle = S.line;
    ctx.stroke();
    // cup
    ctx.beginPath();
    ctx.moveTo(-0.75, -0.35);
    ctx.lineTo(0.75, -0.35);
    ctx.bezierCurveTo(0.72, 0.3, 0.45, 0.58, 0, 0.58);
    ctx.bezierCurveTo(-0.45, 0.58, -0.72, 0.3, -0.75, -0.35);
    ctx.closePath();
    this.fs(ctx, S);
    // rim / tea
    ctx.beginPath();
    ctx.ellipse(0, -0.35, 0.75, 0.13, 0, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'gothic' ? '#3a0a16' : '#b9773a');
    if (detail) {
      ctx.beginPath();
      ctx.moveTo(-0.6, 0.0);
      ctx.bezierCurveTo(-0.3, 0.12, 0.3, 0.12, 0.6, 0.0);
      ctx.lineWidth = S.lw;
      ctx.strokeStyle = S.red;
      ctx.stroke();
    }
    this.hatch(ctx, S, 0.2, -0.2, 0.6, 0.45, 4);
    this.shine(ctx, S, -0.45, -0.08, 0.1, 0.22);
  }

  drawCard(ctx, S, o, detail) {
    const w = 0.66;
    const h = 0.95;
    const r = 0.1;
    ctx.beginPath();
    ctx.moveTo(-w + r, -h);
    ctx.lineTo(w - r, -h);
    ctx.quadraticCurveTo(w, -h, w, -h + r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(-w + r, h);
    ctx.quadraticCurveTo(-w, h, -w, h - r);
    ctx.lineTo(-w, -h + r);
    ctx.quadraticCurveTo(-w, -h, -w + r, -h);
    ctx.closePath();
    const face = this.style === 'gothic' ? '#140b16' : '#fdfaf2';
    this.fs(ctx, S, face);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const isRed = o.suit === '♥' || o.suit === '♦';
    const suitCol = this.style === 'gothic'
      ? (isRed ? '#e0284f' : '#c9b9ec')
      : (isRed ? (this.style === 'ink' ? '#7b2c28' : '#e8344e') : '#111014');
    ctx.fillStyle = suitCol;
    this.label(ctx, o.suit, 0, 0.06, 1.1, 'normal', 'serif');
    if (detail) {
      this.label(ctx, o.suit, -0.47, -0.7, 0.32, 'normal', 'serif');
      this.label(ctx, o.suit, 0.47, 0.7, 0.32, 'normal', 'serif');
      ctx.lineWidth = S.lw * 0.6;
      ctx.strokeStyle = suitCol;
      ctx.strokeRect(-w + 0.12, -h + 0.12, (w - 0.12) * 2, (h - 0.12) * 2);
    }
  }

  drawJar(ctx, S, detail, px) {
    // lid
    ctx.beginPath();
    ctx.rect(-0.5, -0.95, 1.0, 0.22);
    this.fs(ctx, S, this.style === 'toon' ? '#ff9a3c' : S.accent);
    // body
    ctx.beginPath();
    ctx.moveTo(-0.46, -0.73);
    ctx.lineTo(0.46, -0.73);
    ctx.quadraticCurveTo(0.7, -0.6, 0.66, -0.2);
    ctx.lineTo(0.62, 0.78);
    ctx.quadraticCurveTo(0.6, 0.95, 0.4, 0.95);
    ctx.lineTo(-0.4, 0.95);
    ctx.quadraticCurveTo(-0.6, 0.95, -0.62, 0.78);
    ctx.lineTo(-0.66, -0.2);
    ctx.quadraticCurveTo(-0.7, -0.6, -0.46, -0.73);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'gothic' ? '#120a14' : (this.style === 'ink' ? '#fbf8f0' : 'rgba(255, 245, 225, 0.85)'));
    // label
    ctx.beginPath();
    ctx.rect(-0.56, -0.18, 1.12, 0.5);
    this.fs(ctx, S, this.style === 'gothic' ? '#1f1018' : '#fdf3dc');
    if (detail && px > 22) {
      ctx.fillStyle = S.text;
      this.label(ctx, 'MERMELADA', 0, -0.02, 0.15);
      this.label(ctx, 'de naranja', 0, 0.17, 0.13, 'italic');
    }
    this.hatch(ctx, S, 0.25, 0.4, 0.55, 0.9, 4);
    this.shine(ctx, S, -0.4, -0.45, 0.07, 0.18);
  }

  drawBottle(ctx, S, detail, px) {
    ctx.beginPath();
    ctx.moveTo(-0.14, -0.98);
    ctx.lineTo(0.14, -0.98);
    ctx.lineTo(0.14, -0.55);
    ctx.quadraticCurveTo(0.55, -0.4, 0.55, 0.0);
    ctx.lineTo(0.55, 0.85);
    ctx.quadraticCurveTo(0.55, 0.98, 0.4, 0.98);
    ctx.lineTo(-0.4, 0.98);
    ctx.quadraticCurveTo(-0.55, 0.98, -0.55, 0.85);
    ctx.lineTo(-0.55, 0.0);
    ctx.quadraticCurveTo(-0.55, -0.4, -0.14, -0.55);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'toon' ? '#4f8df0' : (this.style === 'dream' ? S.body : S.body));
    // tag on a string
    ctx.beginPath();
    ctx.moveTo(0.1, -0.6);
    ctx.lineTo(0.62, -0.25);
    ctx.lineWidth = S.lw * 0.7;
    ctx.strokeStyle = S.line;
    ctx.stroke();
    ctx.save();
    ctx.translate(0.72, -0.05);
    ctx.rotate(0.35);
    ctx.beginPath();
    ctx.rect(-0.3, -0.18, 0.6, 0.36);
    this.fs(ctx, S, this.style === 'gothic' ? '#1f1018' : '#fdf3dc');
    if (detail && px > 22) {
      ctx.fillStyle = S.text;
      this.label(ctx, 'BÉBEME', 0, 0.01, 0.12);
    }
    ctx.restore();
    this.shine(ctx, S, -0.3, 0.1, 0.07, 0.3);
  }

  drawMushroom(ctx, S) {
    // stem
    ctx.beginPath();
    ctx.moveTo(-0.22, 0.0);
    ctx.quadraticCurveTo(-0.3, 0.7, -0.25, 0.95);
    ctx.lineTo(0.25, 0.95);
    ctx.quadraticCurveTo(0.3, 0.7, 0.22, 0.0);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'gothic' ? '#1c1220' : '#f5ecd8');
    // cap
    ctx.beginPath();
    ctx.moveTo(-0.95, 0.05);
    ctx.bezierCurveTo(-0.95, -0.9, 0.95, -0.9, 0.95, 0.05);
    ctx.quadraticCurveTo(0, 0.22, -0.95, 0.05);
    ctx.closePath();
    const capCol = this.style === 'toon' ? '#e8344e' : (this.style === 'ink' ? S.body : S.body);
    this.fs(ctx, S, capCol);
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.style === 'gothic' ? S.line : (this.style === 'ink' ? '#111014' : '#ffffff');
    [[-0.45, -0.3, 0.12], [0.15, -0.5, 0.1], [0.55, -0.2, 0.09], [-0.1, -0.15, 0.07]].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    this.hatch(ctx, S, -0.15, 0.2, 0.2, 0.9, 4);
  }

  drawHat(ctx, S, detail, px) {
    // brim
    ctx.beginPath();
    ctx.ellipse(0, 0.65, 0.98, 0.22, 0, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'toon' ? '#3f8a4f' : S.body);
    // crown
    ctx.beginPath();
    ctx.moveTo(-0.55, 0.62);
    ctx.lineTo(-0.66, -0.85);
    ctx.quadraticCurveTo(0, -1.02, 0.66, -0.85);
    ctx.lineTo(0.55, 0.62);
    ctx.quadraticCurveTo(0, 0.74, -0.55, 0.62);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'toon' ? '#3f8a4f' : S.body);
    // band
    ctx.beginPath();
    ctx.moveTo(-0.6, 0.2);
    ctx.quadraticCurveTo(0, 0.32, 0.6, 0.2);
    ctx.lineTo(0.58, 0.45);
    ctx.quadraticCurveTo(0, 0.56, -0.58, 0.45);
    ctx.closePath();
    this.fs(ctx, S, this.style === 'gothic' ? S.line : S.red);
    // the famous price tag
    ctx.save();
    ctx.translate(0.32, 0.05);
    ctx.rotate(0.18);
    ctx.beginPath();
    ctx.rect(-0.18, -0.14, 0.36, 0.26);
    this.fs(ctx, S, '#fdf3dc');
    if (detail && px > 22) {
      ctx.fillStyle = '#111014';
      this.label(ctx, '10/6', 0, 0, 0.12);
    }
    ctx.restore();
    this.hatch(ctx, S, 0.25, -0.7, 0.55, 0.15, 5);
  }

  drawBook(ctx, S) {
    ctx.beginPath();
    ctx.rect(-0.62, -0.88, 1.24, 1.76);
    this.fs(ctx, S, this.style === 'toon' ? '#9b4fd6' : (this.style === 'ink' ? '#efe6d2' : S.body));
    ctx.beginPath();
    ctx.rect(-0.62, -0.88, 0.22, 1.76);
    this.fs(ctx, S, this.style === 'gothic' ? S.accent : S.red);
    ctx.shadowBlur = 0;
    ctx.lineWidth = S.lw * 0.8;
    ctx.strokeStyle = this.style === 'ink' ? S.line : '#ffe08a';
    ctx.beginPath();
    ctx.moveTo(-0.2, -0.45);
    ctx.lineTo(0.45, -0.45);
    ctx.moveTo(-0.2, -0.3);
    ctx.lineTo(0.3, -0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0.12, 0.25, 0.22, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawRose(ctx, S) {
    // stem + leaf
    ctx.beginPath();
    ctx.moveTo(0, 0.25);
    ctx.quadraticCurveTo(0.1, 0.6, -0.05, 1.0);
    ctx.lineWidth = S.lw * 1.6;
    ctx.strokeStyle = this.style === 'gothic' ? '#3b5a4a' : '#2f7a46';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0.2, 0.62, 0.22, 0.09, -0.6, 0, Math.PI * 2);
    this.fs(ctx, S, this.style === 'gothic' ? '#16241c' : '#3fa35a');
    // bloom: painted red (or half painted, white beneath)
    const red = this.style === 'ink' ? '#7b2c28' : (this.style === 'gothic' ? '#b0183a' : '#e8344e');
    ctx.beginPath();
    ctx.arc(0, -0.1, 0.48, 0, Math.PI * 2);
    this.fs(ctx, S, red);
    ctx.shadowBlur = 0;
    ctx.lineWidth = S.lw;
    ctx.strokeStyle = this.style === 'ink' ? '#111014' : 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    for (let i = 0; i < 26; i++) {
      const a = i * 0.55;
      const r = 0.04 + i * 0.016;
      const x = Math.cos(a) * r;
      const y = -0.1 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
