/**
 * Alice Character Controller
 * Manages rendering of the provided Alice assets:
 * - AliceBook-Photoroom.png
 * - AliceMovie-Photoroom.png
 * - AliceGame-Photoroom.png
 *
 * Implements true 3D depth cinematic animations:
 * 1. Dramatic Fall from foreground/above (scale 4.2 -> 1.0, rotating down into vanishing point).
 * 2. Settled slow-motion vertical suspension floating.
 * 3. Perspective descent into vanishing point (scale 1.0 -> 0.001) during transitions.
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
    this.rotation = 0;
    this.verticalOffset = 0;
    this.horizontalOffset = 0;
    this.alpha = 0.0;

    // Time tracking
    this.time = 0;
    this.isFalling = false;
    this.fallDuration = 3.4; // seconds for dramatic perspective fall
    this.fallElapsed = 0;
    this.onFallComplete = null;

    this.isRetracting = false;
    this.retractDuration = 1.5;
    this.retractElapsed = 0;
    this.retractDirection = 1;
    this.onRetractComplete = null;

    // Parallax mouse tilt
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    // Mode override for manual transition transforms
    this.isTransitionControlled = false;

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
  }

  setEra(index) {
    this.eraIndex = ((index % 3) + 3) % 3;
  }

  setMouse(nx, ny) {
    this.mouseTargetX = nx * 22;
    this.mouseTargetY = ny * 16;
  }

  triggerFall(eraIndex, onComplete = null) {
    this.setEra(eraIndex);
    this.isFalling = true;
    this.isRetracting = false;
    this.isTransitionControlled = false;
    this.fallDuration = 3.4;
    this.fallElapsed = 0;
    this.onFallComplete = onComplete;

    // Initial cinematic entrance state: high above foreground
    this.scale = 4.2;
    this.rotation = -Math.PI * 5.0; // spinning descent
    this.verticalOffset = -340; // above camera
    this.horizontalOffset = 45;
    this.alpha = 0.0;
  }

  triggerRetract(direction = 1, onComplete = null) {
    this.isRetracting = true;
    this.isFalling = false;
    this.isTransitionControlled = false;
    this.retractDuration = 1.5;
    this.retractElapsed = 0;
    this.retractDirection = direction;
    this.onRetractComplete = onComplete;
  }

  update(dt, speedMult = 1.0) {
    this.time += dt * speedMult;

    // Smooth mouse parallax lerp
    this.mouseX += (this.mouseTargetX - this.mouseX) * Math.min(1.0, dt * 4);
    this.mouseY += (this.mouseTargetY - this.mouseY) * Math.min(1.0, dt * 4);

    if (this.isTransitionControlled) {
      return;
    }

    if (this.isFalling) {
      this.fallElapsed += dt;
      const progress = Math.min(1.0, this.fallElapsed / this.fallDuration);

      // Ease out cubic for falling deceleration into depth
      const t = progress;
      const easeOut = 1 - Math.pow(1 - t, 3);

      // Scale drops from 4.2 down to 1.0
      this.scale = 1.0 + 3.2 * (1 - easeOut);

      // Rotation spins into vanishing point
      this.rotation = (1 - easeOut) * (-Math.PI * 5.0);

      // Position travels from high foreground into center vanishing point
      this.verticalOffset = (1 - easeOut) * -340;
      this.horizontalOffset = (1 - easeOut) * 45;
      this.alpha = Math.min(1.0, progress * 3.0);

      if (progress >= 1.0) {
        this.isFalling = false;
        this.scale = 1.0;
        this.rotation = 0;
        this.verticalOffset = 0;
        this.horizontalOffset = 0;
        this.alpha = 1.0;
        if (this.onFallComplete) {
          const cb = this.onFallComplete;
          this.onFallComplete = null;
          cb();
        }
      }
    } else if (this.isRetracting) {
      this.retractElapsed += dt;
      const progress = Math.min(1.0, this.retractElapsed / this.retractDuration);
      const ease = progress * progress * progress; // ease in cubic

      this.scale = Math.max(0.001, 1.0 - ease * 0.999);
      this.rotation = this.retractDirection * (Math.PI * 0.8 + ease * Math.PI * 8.0);
      this.verticalOffset = ease * 18;
      this.alpha = this.scale > 0.04 ? 1.0 : (this.scale / 0.04);

      if (progress >= 1.0) {
        this.isRetracting = false;
        this.alpha = 0.0;
        if (this.onRetractComplete) {
          const cb = this.onRetractComplete;
          this.onRetractComplete = null;
          cb();
        }
      }
    } else if (this.alpha > 0.001) {
      // Subtle continuous slow-motion vertical bobbing (perpetual gentle fall)
      const bob1 = Math.sin(this.time * 1.3) * 8.5;
      const bob2 = Math.sin(this.time * 2.2 + 1.1) * 4.0;
      this.verticalOffset = bob1 + bob2;

      // Subtle scale oscillation (+-1.2%)
      this.scale = 1.0 + Math.sin(this.time * 1.7) * 0.012;

      // Subtle swaying angle tilt
      this.rotation = Math.sin(this.time * 0.85) * 0.03;
      this.horizontalOffset = 0;
      this.alpha = 1.0;
    }
  }

  setTransitionTransform(scale, rotation, alpha = 1.0, offsetX = 0, offsetY = 0) {
    this.isTransitionControlled = true;
    this.scale = scale;
    this.rotation = rotation;
    this.alpha = alpha;
    this.horizontalOffset = offsetX;
    this.verticalOffset = offsetY;
  }

  releaseTransitionTransform() {
    this.isTransitionControlled = false;
    this.horizontalOffset = 0;
    this.verticalOffset = 0;
    this.scale = 1.0;
    this.rotation = 0;
    this.alpha = 1.0;
  }

  render(ctx, width, height, cx, cy) {
    const img = this.images[this.eraIndex];
    if (!img || !this.isLoaded[this.eraIndex] || this.alpha <= 0.001) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

    // Target height: 42% of viewport height
    const targetHeight = Math.min(height * 0.44, width * 0.48);
    const aspect = img.naturalWidth / img.naturalHeight;
    const drawWidth = targetHeight * aspect;
    const drawHeight = targetHeight;

    const posX = cx + this.horizontalOffset + this.mouseX;
    const posY = cy + this.verticalOffset + this.mouseY;

    ctx.translate(posX, posY);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    // Dynamic depth shadow scaling with depth
    if (this.scale > 0.1) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = Math.min(30, 24 * this.scale);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.min(20, 10 * this.scale);
    }

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
