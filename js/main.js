/**
 * WHY BOTHER? — GENERATIVE RABBIT HOLE
 * Main Entry Point & Orchestrator
 */

import { LightWaveSystem } from './systems/lightWaves.js';
import { BookTunnel } from './systems/bookTunnel.js';
import { MovieTunnel } from './systems/movieTunnel.js';
import { GameTunnel } from './systems/gameTunnel.js';
import { AliceController } from './systems/aliceController.js';
import { PocketWatch } from './systems/pocketWatch.js';
import { TransitionManager, States } from './transitionManager.js';

// DOM Elements
const canvas = document.getElementById('tunnel-canvas');
const ctx = canvas.getContext('2d');
const watchCanvas = document.getElementById('pocket-watch-canvas');

const eraNumberEl = document.getElementById('era-number');
const eraTitleEl = document.getElementById('era-title');
const eraDescEl = document.getElementById('era-desc');
const manifestoTextEl = document.getElementById('manifesto-text');
const watchHintEl = document.getElementById('watch-hint');
const soundBtn = document.getElementById('btn-sound');
const soundIcon = document.getElementById('sound-icon');
const soundLabel = document.getElementById('sound-label');
const fullscreenBtn = document.getElementById('btn-fullscreen');

// Era Metadata definitions
const ERAS = [
  {
    number: "Capítulo I · 1865",
    title: "El Libro Original",
    desc: "Lewis Carroll & John Tenniel — Grabado, tinta, tipografía y papel envejecido.",
    quote: "«Al principio, la madriguera del conejo se extendía en línea recta como un túnel, y después torció bruscamente hacia abajo...»",
    className: "era-0"
  },
  {
    number: "Capítulo II · 1951",
    title: "La Película Animada",
    desc: "Walt Disney Productions — Acuarela suave, pigmentos diluidos en agua y pinceladas orgánicas.",
    quote: "«Curioso y curioso... Si el mundo no tuviera ningún sentido, ¿por qué no inventarle uno?»",
    className: "era-1"
  },
  {
    number: "Capítulo III · 2000",
    title: "El Videojuego Siniestro",
    desc: "American McGee & Rogue Entertainment — Acuarela oscura, borgoña, índigo denso y espirales retorcidas.",
    quote: "«Solo unos pocos encuentran el camino; otros no lo reconocen cuando lo encuentran; otros no quieren encontrarlo.»",
    className: "era-2"
  }
];

// Subsystem instances
const lightWaves = new LightWaveSystem();
const bookTunnel = new BookTunnel();
const movieTunnel = new MovieTunnel();
const gameTunnel = new GameTunnel();
const alice = new AliceController();

// Pocket Watch instance
let pocketWatch;
let transitionManager;

// Web Audio Ambiance Synthesizer
class AmbianceAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.tickOsc = null;
    this.tickInterval = null;
    this.droneOsc = null;
    this.droneGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Main master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Drone oscillator for abyss feeling
    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(65, this.ctx.currentTime);
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    this.droneOsc.start();

    // Clock ticking loop
    this.startTickLoop();
    this.isPlaying = true;
  }

  startTickLoop() {
    let tickCount = 0;
    this.tickInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      tickCount++;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = tickCount % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(tickCount % 2 === 0 ? 980 : 720, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    }, 550);
  }

  triggerTransitionWhoosh(speedMultiplier = 2.0) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    // Resonant filter sweep
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.7);
    filter.frequency.exponentialRampToValueAtTime(120, now + 1.4);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + 1.6);
  }

  setEra(era) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (era === 0) {
      // Antique book: low hollow tone
      this.droneOsc.frequency.exponentialRampToValueAtTime(55, now + 1.0);
    } else if (era === 1) {
      // 1951 Movie: whimsical higher harmonic
      this.droneOsc.frequency.exponentialRampToValueAtTime(110, now + 1.0);
    } else {
      // American McGee: deep sinister low drone
      this.droneOsc.frequency.exponentialRampToValueAtTime(42, now + 1.0);
    }
  }

  toggle() {
    if (!this.ctx) {
      this.init();
      return true;
    }
    if (this.ctx.state === 'running') {
      this.ctx.suspend();
      this.isPlaying = false;
      return false;
    } else {
      this.ctx.resume();
      this.isPlaying = true;
      return true;
    }
  }
}

const audio = new AmbianceAudio();

// Setup era change UI sync
function handleEraChanged(newEraIndex) {
  const meta = ERAS[newEraIndex];

  document.body.className = meta.className;

  // Fade out text briefly, update, and fade in
  eraTitleEl.style.opacity = '0';
  eraDescEl.style.opacity = '0';
  manifestoTextEl.style.opacity = '0';

  setTimeout(() => {
    eraNumberEl.textContent = meta.number;
    eraTitleEl.textContent = meta.title;
    eraDescEl.textContent = meta.desc;
    manifestoTextEl.textContent = meta.quote;

    eraTitleEl.style.opacity = '1';
    eraDescEl.style.opacity = '1';
    manifestoTextEl.style.opacity = '1';
  }, 250);

  audio.setEra(newEraIndex);
}

// Initialize Pocket Watch & Transition Manager
pocketWatch = new PocketWatch(watchCanvas, (direction) => {
  // Fade hint on first interaction
  if (watchHintEl) {
    watchHintEl.style.opacity = '0';
    setTimeout(() => {
      watchHintEl.style.display = 'none';
    }, 600);
  }
  audio.triggerTransitionWhoosh();
  transitionManager.triggerTransition(direction);
});

transitionManager = new TransitionManager(
  alice,
  bookTunnel,
  movieTunnel,
  gameTunnel,
  lightWaves,
  pocketWatch,
  handleEraChanged
);

// Viewport & Resolution Management
let width = window.innerWidth;
let height = window.innerHeight;
let cx = width / 2;
let cy = height / 2;

function handleResize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.resetTransform();
  ctx.scale(dpr, dpr);

  cx = width / 2;
  cy = height / 2;

  bookTunnel.resize(width, height);
  movieTunnel.resize(width, height);
  gameTunnel.resize(width, height);
}

window.addEventListener('resize', handleResize);
handleResize();

// Mouse & Touch Parallax Interaction
let mouseTargetX = 0;
let mouseTargetY = 0;

window.addEventListener('mousemove', (e) => {
  const nx = (e.clientX / width) * 2 - 1;
  const ny = (e.clientY / height) * 2 - 1;
  mouseTargetX = nx;
  mouseTargetY = ny;
  alice.setMouse(nx, ny);
});

// Keyboard navigation (Arrow Left: back, Arrow Right: forward)
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    pocketWatch.accumulatedAngle = 0;
    pocketWatch.angularVelocity = 28.0;
    audio.triggerTransitionWhoosh();
    transitionManager.triggerTransition(1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    pocketWatch.accumulatedAngle = 0;
    pocketWatch.angularVelocity = -28.0;
    audio.triggerTransitionWhoosh();
    transitionManager.triggerTransition(-1);
  }
});

// Sound Toggle Button
soundBtn.addEventListener('click', () => {
  const playing = audio.toggle();
  soundIcon.textContent = playing ? '🔊' : '🔈';
  soundLabel.textContent = playing ? 'Silenciar' : 'Sonido';
});

// Fullscreen Button
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// Main Animation Loop with Delta-Time
let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;

  // Transition and speed coordination
  transitionManager.update(dt);
  const speedMult = transitionManager.tunnelSpeedMultiplier;

  // Dynamic vanishing point with subtle mouse parallax
  const targetCx = width / 2 + mouseTargetX * 20;
  const targetCy = height / 2 + mouseTargetY * 15;
  cx += (targetCx - cx) * Math.min(1.0, dt * 3);
  cy += (targetCy - cy) * Math.min(1.0, dt * 3);

  // Update light waves & tunnels
  lightWaves.update(dt, transitionManager.currentEra, speedMult);
  bookTunnel.update(dt, speedMult);
  movieTunnel.update(dt, speedMult);
  gameTunnel.update(dt, speedMult);

  // Update Alice
  alice.update(dt, speedMult);

  // Update Pocket Watch
  pocketWatch.update(dt);

  // --- RENDER PASS ---
  ctx.clearRect(0, 0, width, height);

  // 1. Render active generative rabbit hole tunnel (with morphing support)
  transitionManager.renderTunnels(ctx, width, height, cx, cy);

  // 2. Render radial energy glow waves
  lightWaves.renderRadialGlow(ctx, width, height, cx, cy);

  // 3. Render Alice character
  alice.render(ctx, width, height, cx, cy);

  // 4. Render Pocket Watch on its dedicated canvas
  pocketWatch.render();
}

requestAnimationFrame(animate);
