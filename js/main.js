/**
 * WHY BOTHER? — GENERATIVE RABBIT HOLE & CREATE STAGE
 * Main Entry Point & Orchestrator
 */

import { LightWaveSystem } from './systems/lightWaves.js';
import { BookTunnel } from './systems/bookTunnel.js';
import { MovieTunnel } from './systems/movieTunnel.js';
import { GameTunnel } from './systems/gameTunnel.js';
import { AliceController } from './systems/aliceController.js';
import { PocketWatch } from './systems/pocketWatch.js';
import { TransitionManager, States } from './transitionManager.js';
import { CreateStage } from './systems/createStage.js';

// DOM Elements
const canvas = document.getElementById('tunnel-canvas');
const ctx = canvas.getContext('2d');
const watchCanvas = document.getElementById('pocket-watch-canvas');
const watchContainer = document.getElementById('watch-container');

const mainTitleEl = document.getElementById('main-title');
const mainSubtitleEl = document.getElementById('main-subtitle');
const eraBadgeContainer = document.getElementById('era-badge-container');
const eraNumberEl = document.getElementById('era-number');
const eraTitleEl = document.getElementById('era-title');
const eraDescEl = document.getElementById('era-desc');
const manifestoContainer = document.getElementById('manifesto-quote-container');
const manifestoTextEl = document.getElementById('manifesto-text');
const watchHintEl = document.getElementById('watch-hint');

// Tool buttons
const soundBtn = document.getElementById('btn-sound');
const soundIcon = document.getElementById('sound-icon');
const soundLabel = document.getElementById('sound-label');
const fullscreenBtn = document.getElementById('btn-fullscreen');
const choosePathBtn = document.getElementById('btn-choose-path');

// Decision & Reflection Modals
const decisionModal = document.getElementById('decision-modal');
const btnContinueExploring = document.getElementById('btn-continue-exploring');
const btnStartCreating = document.getElementById('btn-start-creating');

const reflectionModal = document.getElementById('reflection-modal');
const createHintPanel = document.getElementById('create-hint-panel');
const btnContemplate = document.getElementById('btn-contemplate');
const btnDownloadArt = document.getElementById('btn-download-art');
const btnResumeCreating = document.getElementById('btn-resume-creating');
const btnReturnRabbitHole = document.getElementById('btn-return-rabbit-hole');

// Reflection Modal elements
const reflectionModal = document.getElementById('reflection-modal');
const createHintPanel = document.getElementById('create-hint-panel');
const btnContemplate = document.getElementById('btn-contemplate');
const btnDownloadArt = document.getElementById('btn-download-art');
const btnResumeCreating = document.getElementById('btn-resume-creating');
const btnReturnRabbitHole = document.getElementById('btn-return-rabbit-hole');

// 4 Stages definitions: Libro -> Película -> Videojuego -> CREATE
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
  },
  {
    number: "Capítulo IV · Creación",
    title: "Tu Propia Composición",
    desc: "Materia generativa liberada — Alicia como inspiración fantástica y surrealista.",
    quote: "«El observador se convierte en creador... Tu mano guía el curso de la materia generativa.»",
    className: "era-create"
  }
];

// Subsystem instances
const lightWaves = new LightWaveSystem();
const bookTunnel = new BookTunnel();
const movieTunnel = new MovieTunnel();
const gameTunnel = new GameTunnel();
const alice = new AliceController();
const createStage = new CreateStage();

let pocketWatch;
let transitionManager;
let isCreateMode = false;
let isMouseDown = false;

// Web Audio Ambiance Synthesizer
class AmbianceAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.tickInterval = null;
    this.droneOsc = null;
    this.droneGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(65, this.ctx.currentTime);
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    this.droneOsc.start();

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

  triggerTransitionWhoosh() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

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
      this.droneOsc.frequency.exponentialRampToValueAtTime(55, now + 1.0);
    } else if (era === 1) {
      this.droneOsc.frequency.exponentialRampToValueAtTime(110, now + 1.0);
    } else if (era === 2) {
      this.droneOsc.frequency.exponentialRampToValueAtTime(42, now + 1.0);
    } else {
<<<<<<< HEAD
      this.droneOsc.frequency.exponentialRampToValueAtTime(84, now + 1.0);
=======
      // Create stage harmonic drone
      this.droneOsc.frequency.exponentialRampToValueAtTime(88, now + 1.0);
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
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
  if (isCreateMode) return;
  const meta = ERAS[newEraIndex];
  document.body.className = meta.className;

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

  if (newEraIndex === 3) {
    // ENTERING CREATE STAGE
    isCreateMode = true;
    // Inherit the game tunnel canvas without erasing previous marks!
    createStage.init(width, height, gameTunnel.offscreenCanvas);

    mainTitleEl.textContent = 'Why Bother?';
    mainSubtitleEl.textContent = 'Etapa de Creación · Tu Mano Interviene el Sistema';

    if (createHintPanel) createHintPanel.style.display = 'flex';
    if (watchHintEl) watchHintEl.textContent = 'Gira en sentido contrario para volver';
    audio.setEra(3);
  } else {
    // RETURNING TO RABBIT HOLE STAGE
    isCreateMode = false;
    createStage.isActive = false;

    mainTitleEl.textContent = 'Why Bother?';
    mainSubtitleEl.textContent = 'The Generative Rabbit Hole';

    if (createHintPanel) createHintPanel.style.display = 'none';
    if (watchHintEl) watchHintEl.textContent = 'Gira o mantén el reloj para caer';
    audio.setEra(newEraIndex);
  }
}

// Automatic milestone: show decision prompt after user explores eras
function handleTransitionsMilestone(count) {
  if (count >= 2 && !isCreateMode) {
    // Subtly highlight choice button
    if (choosePathBtn) {
      choosePathBtn.classList.add('highlight');
    }
  }
}

// Initialize Pocket Watch & Transition Manager
pocketWatch = new PocketWatch(watchCanvas, (direction) => {
<<<<<<< HEAD
=======
  if (isCreateMode) return;
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
  if (watchHintEl) {
    watchHintEl.style.opacity = '0.5';
  }
  audio.triggerTransitionWhoosh();
  transitionManager.triggerTransition(direction);
});

transitionManager = new TransitionManager(
  alice,
  bookTunnel,
  movieTunnel,
  gameTunnel,
  createStage,
  lightWaves,
  pocketWatch,
  handleEraChanged,
  handleTransitionsMilestone
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
  createStage.resize(width, height);
}

window.addEventListener('resize', handleResize);
handleResize();

// Mouse & Touch Parallax / Cursor Interaction
let mouseTargetX = 0;
let mouseTargetY = 0;

function updatePointer(e) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  if (isCreateMode) {
    createStage.setCursor(clientX, clientY, isMouseDown);
  } else {
    const nx = (clientX / width) * 2 - 1;
    const ny = (clientY / height) * 2 - 1;
    mouseTargetX = nx;
    mouseTargetY = ny;
    alice.setMouse(nx, ny);
  }
}

<<<<<<< HEAD
window.addEventListener('mousemove', updatePointer);
=======
window.addEventListener('mousemove', (e) => {
  updatePointer(e);
});
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1

window.addEventListener('mousedown', (e) => {
  if (e.target.closest('.modal-card') || e.target.closest('.extra-tools') || e.target.closest('.tool-btn')) {
    return;
  }
  isMouseDown = true;
  updatePointer(e);
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
  if (isCreateMode) {
    createStage.cursor.isDown = false;
  }
});

window.addEventListener('touchstart', (e) => {
  if (e.target.closest('.modal-card') || e.target.closest('.extra-tools') || e.target.closest('.tool-btn')) {
    return;
  }
  isMouseDown = true;
  updatePointer(e);
}, { passive: true });

<<<<<<< HEAD
window.addEventListener('touchmove', updatePointer, { passive: true });
=======
window.addEventListener('touchmove', (e) => {
  updatePointer(e);
}, { passive: true });
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1

window.addEventListener('touchend', () => {
  isMouseDown = false;
  if (isCreateMode) {
    createStage.cursor.isDown = false;
  }
});

// Keyboard navigation (Arrow Left: back, Arrow Right: forward)
window.addEventListener('keydown', (e) => {
  if (isCreateMode) return;
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

<<<<<<< HEAD
=======
// --- DECISION & CREATE STAGE WIRING ---

choosePathBtn.addEventListener('click', () => {
  decisionModal.style.display = 'flex';
});

btnContinueExploring.addEventListener('click', () => {
  decisionModal.style.display = 'none';
});

btnStartCreating.addEventListener('click', () => {
  decisionModal.style.display = 'none';
  enterCreateStage();
});

function enterCreateStage() {
  isCreateMode = true;

  // Active tunnel offscreen canvas is inherited so NOTHING is erased!
  const currentTunnel = transitionManager.tunnels[transitionManager.currentEra];
  const inheritedCanvas = currentTunnel ? currentTunnel.offscreenCanvas : null;
  createStage.init(width, height, inheritedCanvas);

  document.body.className = 'era-create';

  // Update HUD
  mainTitleEl.textContent = 'Why Bother?';
  mainSubtitleEl.textContent = 'Etapa de Creación · Tu Mano Interviene el Sistema';

  if (eraBadgeContainer) eraBadgeContainer.style.display = 'none';
  if (manifestoContainer) manifestoContainer.style.display = 'none';
  if (watchContainer) watchContainer.style.display = 'none';
  if (createHintPanel) createHintPanel.style.display = 'flex';

  audio.setEra(3);
}

function exitCreateStage() {
  isCreateMode = false;
  createStage.isActive = false;

  const meta = ERAS[transitionManager.currentEra];
  document.body.className = meta.className;

  mainTitleEl.textContent = 'Why Bother?';
  mainSubtitleEl.textContent = 'The Generative Rabbit Hole';

  if (eraBadgeContainer) eraBadgeContainer.style.display = 'flex';
  if (manifestoContainer) manifestoContainer.style.display = 'block';
  if (watchContainer) watchContainer.style.display = 'flex';
  if (createHintPanel) createHintPanel.style.display = 'none';

  audio.setEra(transitionManager.currentEra);
}

>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
// Reflection Modal triggers
btnContemplate.addEventListener('click', () => {
  reflectionModal.style.display = 'flex';
});

btnResumeCreating.addEventListener('click', () => {
  reflectionModal.style.display = 'none';
});

btnReturnRabbitHole.addEventListener('click', () => {
  reflectionModal.style.display = 'none';
<<<<<<< HEAD
  // Turning watch backward back to Game version
  transitionManager.triggerTransition(-1);
=======
  exitCreateStage();
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
});

// Export Canvas Snapshot as PNG
btnDownloadArt.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `WhyBother-GenerativeArt-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Main Animation Loop with Delta-Time
let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;

  ctx.clearRect(0, 0, width, height);
<<<<<<< HEAD

  // Update Transition Manager
  transitionManager.update(dt);
  const speedMult = transitionManager.tunnelSpeedMultiplier;

  if (isCreateMode && transitionManager.state === States.IDLE) {
    // --- CREATE STAGE UPDATE & RENDER ---
    createStage.update(dt, 1.0);
    createStage.render(ctx);
  } else {
    // --- RABBIT HOLE STAGE UPDATE & RENDER ---
    const targetCx = width / 2 + mouseTargetX * 22;
    const targetCy = height / 2 + mouseTargetY * 16;
    cx += (targetCx - cx) * Math.min(1.0, dt * 3);
    cy += (targetCy - cy) * Math.min(1.0, dt * 3);

    lightWaves.update(dt, transitionManager.currentEra, speedMult);
    bookTunnel.update(dt, speedMult);
    movieTunnel.update(dt, speedMult);
    gameTunnel.update(dt, speedMult);

    if (isCreateMode) {
      createStage.update(dt, speedMult);
    }

    alice.update(dt, speedMult);

    // 1. Render active generative rabbit hole tunnel (with morphing support)
    transitionManager.renderTunnels(ctx, width, height, cx, cy);

    // 2. Render radial energy glow waves
    if (transitionManager.currentEra < 3) {
      lightWaves.renderRadialGlow(ctx, width, height, cx, cy);
    }

    // 3. Render Alice character with 3D depth perspective
    if (transitionManager.currentEra < 3 || transitionManager.state !== States.IDLE) {
      alice.render(ctx, width, height, cx, cy);
    }
  }

  // 4. Render Pocket Watch on its dedicated canvas
  pocketWatch.update(dt);
  pocketWatch.render();
=======

  if (isCreateMode) {
    // --- CREATE STAGE RENDER LOOP ---
    createStage.update(dt, 1.0);
    createStage.render(ctx);
  } else {
    // --- RABBIT HOLE STAGE RENDER LOOP ---
    transitionManager.update(dt);
    const speedMult = transitionManager.tunnelSpeedMultiplier;

    // Dynamic vanishing point with subtle mouse parallax
    const targetCx = width / 2 + mouseTargetX * 22;
    const targetCy = height / 2 + mouseTargetY * 16;
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

    // 1. Render active generative rabbit hole tunnel (with morphing support)
    transitionManager.renderTunnels(ctx, width, height, cx, cy);

    // 2. Render radial energy glow waves
    lightWaves.renderRadialGlow(ctx, width, height, cx, cy);

    // 3. Render Alice character with 3D depth perspective
    alice.render(ctx, width, height, cx, cy);

    // 4. Render Pocket Watch on its dedicated canvas
    pocketWatch.render();
  }
>>>>>>> 8b20465b44451b5bc77d384c507305daa436c5f1
}

requestAnimationFrame(animate);
