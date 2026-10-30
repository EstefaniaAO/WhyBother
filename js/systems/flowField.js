/**
 * Multi-layer FlowField
 * Combines 3D Simplex noise, rotational vortex swirl, dynamic focal points,
 * and outward expansion forces to guide watercolor brush agents along organic curves.
 */
import { noise, FastMath } from '../math/noise.js';

export class FlowField {
  constructor(config = {}) {
    this.vortexStrength = config.vortexStrength || 0.65;
    this.radialExpansion = config.radialExpansion || 0.45;
    this.noiseScale = config.noiseScale || 0.0022;
    this.noiseStrength = config.noiseStrength || 0.85;
    this.turbulence = config.turbulence || 0.35;
    this.spiralDirection = config.spiralDirection || 1; // 1 or -1
  }

  setConfig(cfg) {
    if (cfg.vortexStrength !== undefined) this.vortexStrength = cfg.vortexStrength;
    if (cfg.radialExpansion !== undefined) this.radialExpansion = cfg.radialExpansion;
    if (cfg.noiseScale !== undefined) this.noiseScale = cfg.noiseScale;
    if (cfg.noiseStrength !== undefined) this.noiseStrength = cfg.noiseStrength;
    if (cfg.turbulence !== undefined) this.turbulence = cfg.turbulence;
    if (cfg.spiralDirection !== undefined) this.spiralDirection = cfg.spiralDirection;
  }

  /**
   * Computes desired heading angle or steering force vector at (x, y)
   */
  getForce(x, y, cx, cy, time = 0) {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy) + 0.001;

    // 1. Normalized radial vector (outward)
    const rx = dx / dist;
    const ry = dy / dist;

    // 2. Normalized tangential vector (vortex swirl around center)
    const tx = -ry * this.spiralDirection;
    const ty = rx * this.spiralDirection;

    // 3. 3D Simplex Noise angle modulation
    const nVal = noise.fbm3D(
      x * this.noiseScale,
      y * this.noiseScale,
      time * 0.05,
      3, 0.5
    );
    const nAngle = nVal * Math.PI * 2 * this.noiseStrength;
    const nx = Math.cos(nAngle);
    const ny = Math.sin(nAngle);

    // 4. Combine forces
    let fx = tx * this.vortexStrength + rx * this.radialExpansion + nx * this.turbulence;
    let fy = ty * this.vortexStrength + ry * this.radialExpansion + ny * this.turbulence;

    const fMag = Math.hypot(fx, fy) + 0.0001;
    return {
      x: fx / fMag,
      y: fy / fMag,
      angle: Math.atan2(fy, fx)
    };
  }
}
