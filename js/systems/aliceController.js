/**
 * Alice Character Controller
 * Manages rendering of the provided Alice assets:
 * - AliceBook-Photoroom.png
 * - AliceMovie-Photoroom.png
 * - AliceGame-Photoroom.png
 * Preserves original aspect ratios, manages falling physics, initial spin-down,
 * gentle vertical floating bob, and 3D-like perspective descent/ascent during transitions.
 */

export class AliceController {
  constructor() {
    this.eraIndex = 0; // 0: Book, 1: Movie, 2: Game
    this.images = [null, null, null];
    this.isLoaded = [false, false, false];

    // Image paths in assets directory
    this.assetPaths = [
      'assets/AliceBook-Photoroom.png',
      'assets/AliceMovie-Photoroom.png',
      'assets/AliceGame-Photoroom.png'
    ];

    // Physics & transform state
    this.scale = 1.0;
    this.rotation = 0; // radians
    this.angularVelocity = 0;
    this.targetRotation = 0;
    this.verticalOffset = 0; // pixels
    this.horizontalOffset = 0;
    this.alpha = 1.0;

    // Time tracking
    this.time = 0;
    this.isIntro = true;
    this.introDuration = 3.2; // seconds for initial spin-down
    this.introElapsed = 0;

    // Parallax mouse tilt
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    this.loadAssets();
  }

  loadAssets() {
    this.assetPaths.forEach((path, index) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        this.images[index] = img;
        this.isLoaded[index] = true;
      };
      img.onerror = () => {
        console.error(`Error loading Alice asset: ${path}`);
      };
    });

    // Start initial slow spin-down animation
    this.rotation = -Math.PI * 4.5; // ~2.25 turns
    this.angularVelocity = 4.0;
  }

  setEra(index) {
    this.eraIndex = ((index % 3) + 3) % 3;
  }

  setMouse(nx, ny) {
    // nx, ny in range [-1, 1]
    this.mouseTargetX = nx * 25;
    this.mouseTargetY = ny * 18;
  }

  update(dt, speedMult = 1.0) {
    this.time += dt * speedMult;

    // Smooth mouse parallax lerp
    this.mouseX += (this.mouseTargetX - this.mouseX) * Math.min(1.0, dt * 4);
    this.mouseY += (this.mouseTargetY - this.mouseY) * Math.min(1.0, dt * 4);

    if (this.isIntro) {
      this.introElapsed += dt;
      // Exponential rotational decay towards 0
      this.rotation += this.angularVelocity * dt;
      this.angularVelocity *= Math.pow(0.25, dt);

      if (this.introElapsed >= this.introDuration || Math.abs(this.angularVelocity) < 0.05) {
        this.isIntro = false;
        this.angularVelocity = 0;
        this.rotation = 0;
      }
    } else {
      // Subtle organic vertical bobbing (falling gently in slow-motion space)
      // Compound sine wave for natural float feel
      const bob1 = Math.sin(this.time * 1.4) * 9.0;
      const bob2 = Math.sin(this.time * 2.3 + 1.2) * 4.5;
      this.verticalOffset = bob1 + bob2;

      // Subtle breath-like scale oscillation (±1.5%)
      this.scale = 1.0 + Math.sin(this.time * 1.8) * 0.015;

      // Subtle sway tilt
      this.rotation = Math.sin(this.time * 0.9) * 0.035;
    }
  }

  /**
   * Set custom transform for transitions (descent / ascent)
   */
  setTransitionTransform(scale, rotation, alpha = 1.0, offsetX = 0, offsetY = 0) {
    this.scale = scale;
    this.rotation = rotation;
    this.alpha = alpha;
    this.horizontalOffset = offsetX;
    this.verticalOffset = offsetY;
  }

  render(ctx, width, height, cx, cy) {
    const img = this.images[this.eraIndex];
    if (!img || !this.isLoaded[this.eraIndex] || this.alpha <= 0.001) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

    // Target rendering height: 38% of screen height, constrained by width
    const targetHeight = Math.min(height * 0.44, width * 0.48);
    const aspect = img.naturalWidth / img.naturalHeight;
    const drawWidth = targetHeight * aspect;
    const drawHeight = targetHeight;

    const posX = cx + this.horizontalOffset + this.mouseX;
    const posY = cy + this.verticalOffset + this.mouseY;

    ctx.translate(posX, posY);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    // Subtle drop shadow / depth aura behind Alice
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 24 * this.scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12 * this.scale;

    // Draw centered without altering proportions
    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }
}
