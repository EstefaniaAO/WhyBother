/**
 * Alice Character Controller
 * Manages rendering of the provided Alice assets:
 * - AliceBook-Photoroom.png
 * - AliceMovie-Photoroom.png
 * - AliceGame-Photoroom.png
 *
 * Implements true 3D depth animations:
 * 1. Initial fall from camera foreground (scale ~4.2, rotating as she plunges toward vanishing point).
 * 2. Settled slow-motion vertical suspension floating.
 * 3. Perspective descent into depth (scale 1.0 -> 0.01 into central hole) during transitions.
 * 4. Perspective ascent from depth (scale 0.01 -> 1.0 from central hole) for new Alice.
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
    this.scale = 4.2;
    this.rotation = -Math.PI * 5.0; // ~2.5 turns coupled to fall
    this.verticalOffset = -300; // starts above / near camera
    this.horizontalOffset = 40;
    this.alpha = 1.0;

    // Time tracking
    this.time = 0;
    this.isIntro = true;
    this.introDuration = 3.6; // seconds for dramatic perspective fall
    this.introElapsed = 0;

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

  update(dt, speedMult = 1.0) {
    this.time += dt * speedMult;

    // Smooth mouse parallax lerp
    this.mouseX += (this.mouseTargetX - this.mouseX) * Math.min(1.0, dt * 4);
    this.mouseY += (this.mouseTargetY - this.mouseY) * Math.min(1.0, dt * 4);

    if (this.isTransitionControlled) {
      // In transition, transform is controlled directly by transitionManager
      return;
    }

    if (this.isIntro) {
      this.introElapsed += dt;
      const progress = Math.min(1.0, this.introElapsed / this.introDuration);

      // Ease out cubic for falling deceleration into depth
      const t = progress;
      const easeOut = 1 - Math.pow(1 - t, 3);

      // Scale drops from 4.2 (camera closeup) down to 1.0 (settled position)
      this.scale = 1.0 + 3.2 * (1 - easeOut);

      // Rotation coupled directly to downward descent
      this.rotation = (1 - easeOut) * (-Math.PI * 5.0);

      // Position travels from high foreground into center vanishing point
      this.verticalOffset = (1 - easeOut) * -260;
      this.horizontalOffset = (1 - easeOut) * 35;
      this.alpha = Math.min(1.0, progress * 2.0); // Clean fast appearance

      if (progress >= 1.0) {
        this.isIntro = false;
        this.scale = 1.0;
        this.rotation = 0;
        this.verticalOffset = 0;
        this.horizontalOffset = 0;
      }
    } else {
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

  /**
   * Set custom 3D depth transform during transitions
   */
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

    // Target height: 38% of viewport height
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
