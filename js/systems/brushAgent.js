/**
 * Watercolor BrushAgent
 * Autonomous brush entity that paints progressive, tapered, multi-pass watercolor strokes
 * onto the persistent canvas buffer, interacting with the flow field and pigment grid.
 */
import { FastMath, noise } from '../math/noise.js';

export class BrushAgent {
  constructor(config = {}) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.speed = config.speed || 55;
    this.maxSteerForce = config.maxSteerForce || 4.5;

    this.baseThickness = config.thickness || 12;
    this.baseOpacity = config.opacity || 0.32;
    this.color = config.color || { r: 100, g: 150, b: 200 };
    this.currentColor = { ...this.color };

    this.maxLife = config.maxLife || 6.5;
    this.age = 0;
    this.isDead = false;

    // Organic watercolor bristle offsets & dampening
    this.numPasses = config.numPasses || 3;
    this.bristleSpread = config.bristleSpread || 0.45;
    this.isWet = config.isWet !== undefined ? config.isWet : true;
    this.isGothic = config.isGothic || false;
    // Additive luminous halo strength (0 = none). Makes fine threads glow.
    this.glow = config.glow || 0;

    this.history = [];
  }

  update(dt, flowField, colorGrid, cx, cy, time, speedMult = 1.0) {
    if (this.isDead) return;

    this.age += dt * speedMult;
    const prevX = this.x;
    const prevY = this.y;

    // 1. Steering force towards FlowField vector
    const desired = flowField.getForce(this.x, this.y, cx, cy, time);
    const steerX = (desired.x * this.speed - this.vx) * this.maxSteerForce;
    const steerY = (desired.y * this.speed - this.vy) * this.maxSteerForce;

    this.vx += steerX * dt * speedMult;
    this.vy += steerY * dt * speedMult;

    // Constrain velocity
    const currentSpeed = Math.hypot(this.vx, this.vy) || 0.001;
    this.vx = (this.vx / currentSpeed) * this.speed;
    this.vy = (this.vy / currentSpeed) * this.speed;

    this.x += this.vx * dt * speedMult;
    this.y += this.vy * dt * speedMult;

    // 2. Pigment Dragging & Wet Color Blending
    if (colorGrid) {
      const sampled = colorGrid.samplePigment(this.x, this.y);
      if (sampled.density > 0.1 && sampled.color) {
        // Drag existing wet pigment, blending smoothly
        this.currentColor = FastMath.blendRGB(this.currentColor, sampled.color, 0.08);
      }
      colorGrid.depositPigment(this.x, this.y, this.currentColor, 0.12 * dt * speedMult);
    }

    // 3. Tapered Envelope (natural brush entry, body, and exit)
    const lifeRatio = this.age / this.maxLife;
    const taper = Math.sin(lifeRatio * Math.PI); // 0 -> 1 -> 0 smooth bell curve
    const currentThickness = Math.max(1.0, this.baseThickness * Math.pow(taper, 0.7));
    const currentOpacity = Math.max(0.05, this.baseOpacity * (0.4 + 0.6 * taper));

    // 4. Save path coordinate
    const distFromCenter = Math.hypot(this.x - cx, this.y - cy);
    this.history.push({
      x: this.x,
      y: this.y,
      r: distFromCenter,
      prevX,
      prevY,
      thickness: currentThickness,
      opacity: currentOpacity,
      color: { ...this.currentColor }
    });

    if (this.age >= this.maxLife) {
      this.isDead = true;
    }
  }

  /**
   * Renders the latest progressive segment directly onto the persistent canvas buffer
   */
  drawSegment(ctx) {
    if (this.history.length < 2) return;

    const cur = this.history[this.history.length - 1];
    const prev = this.history[this.history.length - 2];

    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0.1) return;

    // Normal perpendicular vector for multi-pass watercolor bristle spread
    const nx = -dy / dist;
    const ny = dx / dist;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const col = cur.color;
    const mainAlpha = cur.opacity;

    // Pass 1: Broad translucent wet wash / softened edges
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(cur.x, cur.y);
    ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${(mainAlpha * 0.35).toFixed(3)})`;
    ctx.lineWidth = cur.thickness * 1.6;
    ctx.stroke();

    // Pass 2: Main pigment body with bristle texture
    for (let p = 0; p < this.numPasses; p++) {
      const spreadOffset = (p - (this.numPasses - 1) / 2) * (cur.thickness * this.bristleSpread * 0.35);
      const px1 = prev.x + nx * spreadOffset;
      const py1 = prev.y + ny * spreadOffset;
      const px2 = cur.x + nx * spreadOffset;
      const py2 = cur.y + ny * spreadOffset;

      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px2, py2);

      // Pigment density variation: center passes are richer
      const centerFactor = 1.0 - Math.abs(p - (this.numPasses - 1) / 2) / Math.max(1, this.numPasses);
      const passAlpha = mainAlpha * (0.5 + 0.5 * centerFactor);

      ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${passAlpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(0.8, cur.thickness * (0.35 + 0.25 * centerFactor));
      ctx.stroke();
    }

    // Pass 2b: Luminous additive halo for glowing threads
    if (this.glow > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${(mainAlpha * 0.22 * this.glow).toFixed(3)})`;
      ctx.lineWidth = cur.thickness * 3.2 + 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(mainAlpha * 0.18 * this.glow).toFixed(3)})`;
      ctx.lineWidth = Math.max(0.6, cur.thickness * 0.3);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }

    // Pass 3: If gothic scene, sharp barbed thorns
    if (this.isGothic && Math.random() > 0.6) {
      const thornLen = cur.thickness * (0.6 + Math.random() * 1.2);
      const side = Math.random() > 0.5 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cur.x, cur.y);
      ctx.lineTo(cur.x + nx * side * thornLen, cur.y + ny * side * thornLen);
      ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${(mainAlpha * 0.85).toFixed(3)})`;
      ctx.lineWidth = Math.max(0.9, cur.thickness * 0.22);
      ctx.stroke();
    }

    ctx.restore();
  }
}
