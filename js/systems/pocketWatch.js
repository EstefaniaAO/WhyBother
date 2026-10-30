/**
 * Interactive Pocket Watch Navigation Controller
 * Located in bottom-right corner.
 * Hands tick slowly at idle. Holding or dragging spins the hands.
 * Reaching spin threshold triggers forward/backward era transition.
 */

export class PocketWatch {
  constructor(canvasElement, onTriggerTransition) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.onTrigger = onTriggerTransition;

    // Dimensions
    this.size = 180; // virtual canvas dimensions
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    // Angles
    this.hourAngle = 0;
    this.minuteAngle = 0;
    this.angularVelocity = 0.5; // base idle speed (rad/s)
    this.idleSpeed = 0.5;
    this.dragSpeed = 0;

    // Accumulated rotation for triggering transition
    this.accumulatedAngle = 0;
    this.triggerThreshold = Math.PI * 3.5; // ~1.75 full rotations to trigger

    // Interaction state
    this.isPressed = false;
    this.isDragging = false;
    this.pressStartTime = 0;
    this.lastPointerAngle = null;
    this.isTransitionActive = false;
    this.chargeLevel = 0; // 0 to 1 for visual glow

    // Era theme color for gentle watch accents (soft paper & watercolor tones)
    this.eraColors = [
      'rgba(215, 195, 160, ', // Book: warm antique parchment / brass
      'rgba(164, 195, 225, ', // Movie: soft powdery watercolor blue
      'rgba(165, 45, 68, '    // Game: rich wine red watercolor
    ];
    this.currentEra = 0;

    this.bindEvents();
  }

  setEra(era) {
    this.currentEra = era;
  }

  setTransitionState(isActive) {
    this.isTransitionActive = isActive;
  }

  bindEvents() {
    const el = this.canvas;

    const getAngleFromCenter = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return Math.atan2(clientY - cy, clientX - cx);
    };

    const handlePointerDown = (e) => {
      e.preventDefault();
      if (this.isTransitionActive) return;
      this.isPressed = true;
      this.isDragging = false;
      this.pressStartTime = performance.now();
      this.lastPointerAngle = getAngleFromCenter(e);
    };

    const handlePointerMove = (e) => {
      if (!this.isPressed || this.isTransitionActive) return;
      e.preventDefault();
      const currentAngle = getAngleFromCenter(e);

      if (this.lastPointerAngle !== null) {
        let delta = currentAngle - this.lastPointerAngle;
        // Normalize wrap-around across [-PI, PI]
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        if (Math.abs(delta) > 0.01) {
          this.isDragging = true;
          // Apply direct rotation to hands
          this.minuteAngle += delta * 1.5;
          this.hourAngle += delta * 0.2;
          this.accumulatedAngle += delta;
          this.angularVelocity = delta * 45; // simulate momentum

          this.checkTrigger();
        }
      }
      this.lastPointerAngle = currentAngle;
    };

    const handlePointerUp = () => {
      this.isPressed = false;
      this.isDragging = false;
      this.lastPointerAngle = null;
    };

    el.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    el.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  }

  checkTrigger() {
    if (this.isTransitionActive) return;

    if (Math.abs(this.accumulatedAngle) >= this.triggerThreshold) {
      const direction = this.accumulatedAngle > 0 ? 1 : -1; // 1 = clockwise (forward), -1 = counter-clockwise (backward)
      this.accumulatedAngle = 0;
      this.angularVelocity = direction * 28.0; // surge spin effect
      if (this.onTrigger) {
        this.onTrigger(direction);
      }
    }
  }

  update(dt) {
    // If user is just holding down without dragging, hands accelerate exponentially
    if (this.isPressed && !this.isDragging && !this.isTransitionActive) {
      const holdTime = (performance.now() - this.pressStartTime) / 1000;
      const accelFactor = 1.0 + holdTime * 6.0;
      const holdDir = 1; // default forward on hold
      const dAngle = holdDir * this.idleSpeed * accelFactor * dt * 5;
      this.minuteAngle += dAngle;
      this.hourAngle += dAngle * 0.12;
      this.accumulatedAngle += dAngle;
      this.angularVelocity = holdDir * (this.idleSpeed + accelFactor * 4);
      this.checkTrigger();
    } else {
      // Free spin / decay back to idle
      this.minuteAngle += this.angularVelocity * dt;
      this.hourAngle += (this.angularVelocity * 0.1) * dt;

      // Decay toward idle speed
      const targetSpeed = this.isTransitionActive ? (Math.sign(this.angularVelocity || 1) * 18.0) : this.idleSpeed;
      this.angularVelocity += (targetSpeed - this.angularVelocity) * Math.min(1.0, dt * 2.2);

      // Decay accumulated angle when released without reaching threshold
      if (!this.isPressed && !this.isTransitionActive) {
        this.accumulatedAngle *= Math.pow(0.1, dt);
      }
    }

    // Charge level [0, 1]
    this.chargeLevel = Math.min(1.0, Math.abs(this.accumulatedAngle) / this.triggerThreshold);
  }

  render() {
    const ctx = this.ctx;
    const s = this.size;
    const cx = s / 2;
    const cy = s / 2 + 6; // slightly shifted down to accommodate top winding loop
    const r = s * 0.38;

    ctx.clearRect(0, 0, s, s);

    // 1. Top Winding Crown and Chain Ring Loop
    ctx.save();
    ctx.strokeStyle = '#c5a059';
    ctx.fillStyle = '#9b7631';
    ctx.lineWidth = 3.5;

    // Hanging ring loop
    ctx.beginPath();
    ctx.arc(cx, cy - r - 14, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Winding stem
    ctx.beginPath();
    ctx.rect(cx - 5, cy - r - 8, 10, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Outer Casing (antique brass / gold)
    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // Bezel gradient
    const bezelGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.5, cx, cy, r + 9);
    bezelGrad.addColorStop(0.0, '#ffd885');
    bezelGrad.addColorStop(0.5, '#b88939');
    bezelGrad.addColorStop(0.85, '#6a4918');
    bezelGrad.addColorStop(1.0, '#3a2408');

    ctx.fillStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Energy Charge Glow Ring around dial
    if (this.chargeLevel > 0.05 || this.isTransitionActive) {
      ctx.save();
      const glowAlpha = this.isTransitionActive ? 0.9 : (this.chargeLevel * 0.85);
      const eraCol = this.eraColors[this.currentEra];
      ctx.strokeStyle = `${eraCol}${glowAlpha})`;
      ctx.lineWidth = 4 + this.chargeLevel * 4;
      ctx.shadowColor = `${eraCol}1)`;
      ctx.shadowBlur = 14 + this.chargeLevel * 16;
      ctx.beginPath();
      // Draw arc representing accumulated charge
      const startA = -Math.PI / 2;
      const endA = startA + (this.accumulatedAngle || (this.minuteAngle * 0.5));
      ctx.arc(cx, cy, r + 5, startA, endA, this.accumulatedAngle < 0);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Dial Face (Ivory parchment)
    ctx.save();
    const faceGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    faceGrad.addColorStop(0.0, '#faf7ee');
    faceGrad.addColorStop(0.7, '#ece4d0');
    faceGrad.addColorStop(1.0, '#d1c4a5');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Dial border ring
    ctx.strokeStyle = '#5a4625';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 5. Roman Numerals & Minute Ticks
    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    ctx.fillStyle = '#2d2417';
    ctx.font = 'bold 9px "Cinzel", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const numR = r - 13;
      const nx = cx + Math.cos(angle) * numR;
      const ny = cy + Math.sin(angle) * numR;
      ctx.fillText(numerals[i], nx, ny);

      // Minute ticks
      for (let m = 0; m < 5; m++) {
        const tickAngle = angle + (m / 60) * Math.PI * 2;
        const tInner = r - (m === 0 ? 5 : 3);
        const tOuter = r - 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tickAngle) * tInner, cy + Math.sin(tickAngle) * tInner);
        ctx.lineTo(cx + Math.cos(tickAngle) * tOuter, cy + Math.sin(tickAngle) * tOuter);
        ctx.lineWidth = m === 0 ? 1.4 : 0.8;
        ctx.strokeStyle = '#5a4625';
        ctx.stroke();
      }
    }

    // Dial center ornate watermark / logo
    ctx.font = 'italic 7px "Cormorant Garamond", serif';
    ctx.fillStyle = 'rgba(90, 70, 40, 0.6)';
    ctx.fillText('WONDERLAND', cx, cy - 18);
    ctx.fillText('TEMPORAL', cx, cy + 18);
    ctx.restore();

    // 6. Clock Hands (Vintage spade / teardrop style)
    ctx.save();
    ctx.translate(cx, cy);

    // Hour Hand
    ctx.save();
    ctx.rotate(this.hourAngle);
    ctx.fillStyle = '#1c150c';
    ctx.strokeStyle = '#1c150c';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(0, -r * 0.52);
    ctx.stroke();
    // Heart / spade tip
    ctx.beginPath();
    ctx.arc(0, -r * 0.40, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Minute Hand (longer and thinner)
    ctx.save();
    ctx.rotate(this.minuteAngle);
    ctx.fillStyle = '#261b0c';
    ctx.strokeStyle = '#261b0c';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.lineTo(0, -r * 0.76);
    ctx.stroke();
    // Teardrop ornament
    ctx.beginPath();
    ctx.arc(0, -r * 0.60, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Center pivot nut
    ctx.fillStyle = '#c5a059';
    ctx.strokeStyle = '#261b0c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#1c150c';
    ctx.fill();
    ctx.restore();

    // 7. Beveled Glass Convex Glint Highlight
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.clip();

    const glint = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    glint.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
    glint.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
    glint.addColorStop(0.6, 'rgba(255, 255, 255, 0.0)');
    glint.addColorStop(1.0, 'rgba(255, 255, 255, 0.25)');
    ctx.fillStyle = glint;
    ctx.fill();
    ctx.restore();
  }
}
