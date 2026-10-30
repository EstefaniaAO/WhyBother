/**
 * WHY BOTHER? — GENERATIVE RABBIT HOLE & CREATE
 * Main Orchestrator & Entry Point
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
const watchHintEl = document.getElementById('watch-hint');
const mainUi = document.getElementById('main-ui');

// Narrative DOM Elements
const narrativeOverlay = document.getElementById('narrative-overlay');
const openingBookContainer = document.getElementById('opening-book-container');
const bookTextBody = document.getElementById('book-text-body');
const transitionTextContainer = document.getElementById('transition-text-container');
const transitionEraTag = document.getElementById('transition-era-tag');
const transitionTextBody = document.getElementById('transition-text-body');
const narrativeContinueHint = document.getElementById('narrative-continue-hint');

// Create Stage Controls
const createControlsPanel = document.getElementById('create-controls-panel');
const btnContemplate = document.getElementById('btn-contemplate');

// Final Contemplation & Reflection Overlay
const finalOverlay = document.getElementById('final-contemplation-overlay');
const finalClosingPhrase = document.getElementById('final-closing-phrase');
const btnDownloadArt = document.getElementById('btn-download-art');
const btnResumeCreating = document.getElementById('btn-resume-creating');
const btnRestartExperience = document.getElementById('btn-restart-experience');

// Canvas dimensions and vanishing point
let width = window.innerWidth;
let height = window.innerHeight;
let cx = width / 2;
let cy = height / 2;
let mouseTargetX = 0;
let mouseTargetY = 0;

// Subsystem instances
const lightWaves = new LightWaveSystem();
const bookTunnel = new BookTunnel();
const movieTunnel = new MovieTunnel();
const gameTunnel = new GameTunnel();
const alice = new AliceController();
const createStage = new CreateStage();

let pocketWatch;
let transitionManager;

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
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
      this.droneOsc.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);
      this.droneOsc.start();

      this.startTickLoop();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio not allowed or failed:', e);
    }
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
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    }, 550);
  }

  triggerTransitionWhoosh() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
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
    } catch (e) {
      // Audio sweep fallback
    }
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
      this.droneOsc.frequency.exponentialRampToValueAtTime(88, now + 1.0);
    }
  }
}

const audio = new AmbianceAudio();

// ==========================================================================
// NARRATIVE TEXT DEFINITIONS
// ==========================================================================
const NARRATIVES = {
  // Opening: El Libro Original
  0: {
    isBook: true,
    paragraphs: [
      "Pero cuando el conejo se sacó un reloj de bolsillo del chaleco, lo miró y echó a correr, Alicia se levantó de un salto, porque comprendió de golpe que ella nunca había visto un conejo con chaleco, ni con reloj que sacarse de él, y, ardiendo de curiosidad, se puso a correr tras el conejo por la pradera, y llegó justo a tiempo para ver cómo se precipitaba en una madriguera que se abría al pie del seto.",
      "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
    ]
  },
  // Transición hacia Disney: 1951
  1: {
    isBook: false,
    tag: "1951 · La Película Animada",
    paragraphs: [
      "Ochenta y seis años habían pasado desde que aquella historia fuera escrita. El mundo había cambiado, y las historias comenzaban a encontrar nuevas maneras de existir. Ya no vivían solamente entre las páginas de un libro. Ahora podían cobrar vida a través de ilustraciones en movimiento, colores que parecían salirse del papel y melodías que acompañaban cada aventura.",
      "En una de aquellas versiones, otra pequeña Alicia cantaba entre flores que hablaban, mientras se despedía de su gata Diana antes de seguir al conejo. El mundo que antes había sido imaginado con palabras ahora podía verse, escucharse y moverse ante nuestros ojos.",
      "Pero la curiosidad seguía siendo la misma. Y, sin embargo, un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
    ]
  },
  // Transición hacia el Videojuego: 2011
  2: {
    isBook: false,
    tag: "2011 · El Videojuego",
    paragraphs: [
      "Sesenta años más tarde, el mundo de Alicia era muy diferente. Las historias ya no se limitaban a ser leídas o contempladas. Ahora podían recorrerse, explorarse e incluso alterarse. Aquello que antes exigía miles y miles de dibujos podía tomar forma mediante herramientas digitales, y los mundos imaginados podían convertirse en lugares que cualquiera podía habitar.",
      "Pero no todos los Países de las Maravillas conservaban la inocencia de aquel primero. En una nueva historia, Alicia Liddell regresaba a un mundo deformado por sus propios recuerdos. Los colores se habían vuelto más sombríos, los caminos más inquietantes y los personajes, mucho menos familiares. Ya no bastaba con observar cómo se desarrollaba la aventura. Esta vez, había que atravesarla.",
      "Y aunque el mundo al otro lado fuera irreconocible, algo permanecía intacto. Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
    ]
  },
  // Transición hacia CREATE
  3: {
    isBook: false,
    tag: "El Tiempo Presente · Creación",
    paragraphs: [
      "Más de cien años habían pasado.",
      "Cientos de Alicias habían existido desde entonces. Algunas habían sido dibujadas, otras pintadas, animadas, actuadas, reconstruidas y transformadas. Cada una había encontrado su propia forma de caer, y cada una había llevado consigo algo de quien la imaginó.",
      "Las herramientas habían cambiado. Las posibilidades parecían no tener fin. Ahora, bastaba una instrucción para obtener imágenes de mundos que antes habrían requerido incontables horas de trabajo.",
      "Y entonces...",
      "¿qué quedaba por imaginar?"
    ]
  }
};

// Progressive Typing Engine
class NarrativeTypewriter {
  constructor() {
    this.isTyping = false;
    this.isComplete = false;
    this.typeInterval = null;
    this.currentNarrative = null;
    this.targetElement = null;
    this.fullHtml = '';
  }

  start(narrativeConfig, onComplete) {
    this.currentNarrative = narrativeConfig;
    this.onComplete = onComplete;
    this.isComplete = false;
    this.isTyping = true;
    narrativeContinueHint.classList.remove('visible');

    if (narrativeConfig.isBook) {
      openingBookContainer.style.display = 'block';
      transitionTextContainer.style.display = 'none';
      this.targetElement = bookTextBody;
    } else {
      openingBookContainer.style.display = 'none';
      transitionTextContainer.style.display = 'block';
      transitionEraTag.textContent = narrativeConfig.tag || '';
      this.targetElement = transitionTextBody;
    }

    this.targetElement.innerHTML = '';

    // Build array of tokens (words and paragraph breaks)
    const tokens = [];
    narrativeConfig.paragraphs.forEach((pText, pIdx) => {
      const words = pText.split(/\s+/);
      words.forEach((w, wIdx) => {
        tokens.push({ text: w + ' ', pIdx });
      });
      if (pIdx < narrativeConfig.paragraphs.length - 1) {
        tokens.push({ text: '\n\n', pIdx });
      }
    });

    let currentTokenIndex = 0;
    let currentParagraphIndex = -1;
    let currentPElement = null;

    // Build full text for fast-skip
    this.fullHtml = narrativeConfig.paragraphs.map(p => `<p>${p}</p>`).join('');

    this.typeInterval = setInterval(() => {
      if (currentTokenIndex >= tokens.length) {
        this.finish();
        return;
      }

      const tok = tokens[currentTokenIndex];
      currentTokenIndex++;

      if (tok.pIdx !== currentParagraphIndex) {
        currentParagraphIndex = tok.pIdx;
        currentPElement = document.createElement('p');
        this.targetElement.appendChild(currentPElement);
      }

      if (tok.text === '\n\n') {
        // Next paragraph
      } else {
        currentPElement.textContent += tok.text;
      }
    }, 42); // Comfortable, fluid literary typing cadence
  }

  fastForward() {
    if (!this.isTyping) return;
    clearInterval(this.typeInterval);
    this.targetElement.innerHTML = this.fullHtml;
    this.finish();
  }

  finish() {
    clearInterval(this.typeInterval);
    this.isTyping = false;
    this.isComplete = true;
    narrativeContinueHint.classList.add('visible');
    if (this.onComplete) {
      this.onComplete();
    }
  }
}

const narrativeTypewriter = new NarrativeTypewriter();

// Show narrative stage
function displayNarrative(narrativeIndex) {
  narrativeOverlay.classList.remove('hidden');
  narrativeOverlay.style.display = 'flex';
  mainUi.style.display = 'none';
  createControlsPanel.style.display = 'none';
  finalOverlay.style.display = 'none';

  narrativeTypewriter.start(NARRATIVES[narrativeIndex], () => {
    // Narrative fully rendered
  });
}

function hideNarrativeOverlay() {
  narrativeOverlay.classList.add('hidden');
  setTimeout(() => {
    narrativeOverlay.style.display = 'none';
  }, 800);
}

// User action to advance narrative (SPACE key or mouse click)
function handleNarrativeUserAction() {
  audio.init();

  if (narrativeTypewriter.isTyping) {
    // If still typing: instantly reveal complete text
    narrativeTypewriter.fastForward();
    return;
  }

  if (narrativeTypewriter.isComplete) {
    // If text finished: advance to next phase!
    hideNarrativeOverlay();
    transitionManager.onNarrativeFinished();
  }
}

// Initialize Pocket Watch & Transition Manager
pocketWatch = new PocketWatch(watchCanvas, (direction) => {
  audio.triggerTransitionWhoosh();
  transitionManager.triggerWatchTransition(direction);
});

transitionManager = new TransitionManager(
  alice,
  bookTunnel,
  movieTunnel,
  gameTunnel,
  createStage,
  lightWaves,
  pocketWatch,
  {
    onStateChanged: (state, activeEra) => {
      audio.setEra(activeEra);

      if (state === States.OPENING_BOOK) {
        displayNarrative(0);
      } else if (state === States.TEXT_1_DISNEY) {
        displayNarrative(1);
      } else if (state === States.TEXT_2_GAME) {
        displayNarrative(2);
      } else if (state === States.TEXT_3_CREATE) {
        displayNarrative(3);
      }
    },
    onShowWatch: (era) => {
      mainUi.style.display = 'flex';
      watchContainer.classList.add('visible');
      if (era === 0) {
        watchHintEl.textContent = 'Gira el reloj para avanzar';
      } else if (era === 1) {
        watchHintEl.textContent = 'Gira el reloj para viajar';
      } else if (era === 2) {
        watchHintEl.textContent = 'Gira el reloj para avanzar';
      } else if (era === 3) {
        watchHintEl.textContent = 'Gira en sentido contrario para volver';
      }
    },
    onHideWatch: () => {
      watchContainer.classList.remove('visible');
    },
    onEnterCreate: () => {
      mainUi.style.display = 'flex';
      createControlsPanel.style.display = 'flex';
      watchContainer.classList.add('visible');
      watchHintEl.textContent = 'Gira en sentido contrario para volver';
    },
    onContemplate: () => {
      createControlsPanel.style.display = 'none';
      watchContainer.classList.remove('visible');
      finalOverlay.style.display = 'flex';
      finalClosingPhrase.classList.remove('revealed');

      // Dramatic pause before revealing the final Alice sentence
      setTimeout(() => {
        finalClosingPhrase.classList.add('revealed');
      }, 1400);
    },
    onResumeCreate: () => {
      finalOverlay.style.display = 'none';
      createControlsPanel.style.display = 'flex';
      watchContainer.classList.add('visible');
    }
  }
);

// Contemplate Button Click
btnContemplate.addEventListener('click', (e) => {
  e.stopPropagation();
  transitionManager.triggerContemplate();
});

// Resume Creating Button Click
btnResumeCreating.addEventListener('click', (e) => {
  e.stopPropagation();
  transitionManager.resumeCreating();
});

// Download Art as PNG
btnDownloadArt.addEventListener('click', (e) => {
  e.stopPropagation();
  const link = document.createElement('a');
  link.download = `WhyBother-ObraGenerativa-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Restart Experience
btnRestartExperience.addEventListener('click', (e) => {
  e.stopPropagation();
  finalOverlay.style.display = 'none';
  createControlsPanel.style.display = 'none';
  watchContainer.classList.remove('visible');
  transitionManager.setState(States.OPENING_BOOK);
});

// Window resize handling
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  cx = width / 2;
  cy = height / 2;

  bookTunnel.resize(width, height);
  movieTunnel.resize(width, height);
  gameTunnel.resize(width, height);
  createStage.resize(width, height);
}

window.addEventListener('resize', handleResize);
handleResize();

// Keyboard interaction (SPACE key for narrative)
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!narrativeOverlay.classList.contains('hidden') && narrativeOverlay.style.display !== 'none') {
      handleNarrativeUserAction();
    }
  }
});

// Click interaction for narrative overlay
narrativeOverlay.addEventListener('click', () => {
  handleNarrativeUserAction();
});

// Mouse & Touch interaction for CREATE Stage & Alice parallax
let isMouseDown = false;

window.addEventListener('mousedown', (e) => {
  audio.init();
  if (e.target.closest('#watch-container') || e.target.closest('#create-controls-panel') || e.target.closest('#final-contemplation-overlay')) {
    return;
  }
  isMouseDown = true;
  if (transitionManager.state === States.CREATE_ACTIVE) {
    createStage.setCursor(e.clientX, e.clientY, true);
  }
});

window.addEventListener('mousemove', (e) => {
  const nx = (e.clientX - width / 2) / (width / 2);
  const ny = (e.clientY - height / 2) / (height / 2);
  mouseTargetX = nx;
  mouseTargetY = ny;
  alice.setMouse(nx, ny);

  if (transitionManager.state === States.CREATE_ACTIVE) {
    createStage.setCursor(e.clientX, e.clientY, isMouseDown);
  }
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
  if (transitionManager.state === States.CREATE_ACTIVE) {
    createStage.cursor.isDown = false;
  }
});

// Touch events for mobile
window.addEventListener('touchstart', (e) => {
  audio.init();
  if (e.touches && e.touches.length > 0) {
    const t = e.touches[0];
    if (transitionManager.state === States.CREATE_ACTIVE) {
      createStage.setCursor(t.clientX, t.clientY, true);
    }
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length > 0) {
    const t = e.touches[0];
    if (transitionManager.state === States.CREATE_ACTIVE) {
      createStage.setCursor(t.clientX, t.clientY, true);
    }
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  if (transitionManager.state === States.CREATE_ACTIVE) {
    createStage.cursor.isDown = false;
  }
});

// Main Animation Loop with Delta Time
let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const dt = Math.min(0.08, (currentTime - lastTime) / 1000);
  lastTime = currentTime;

  ctx.clearRect(0, 0, width, height);

  // Update Transition Manager
  transitionManager.update(dt);
  const speedMult = transitionManager.tunnelSpeedMultiplier;

  // Smooth vanishing point parallax
  const targetCx = width / 2 + mouseTargetX * 22;
  const targetCy = height / 2 + mouseTargetY * 16;
  cx += (targetCx - cx) * Math.min(1.0, dt * 3);
  cy += (targetCy - cy) * Math.min(1.0, dt * 3);

  // Update light waves & tunnels
  lightWaves.update(dt, transitionManager.activeEra, speedMult);
  bookTunnel.update(dt, speedMult);
  movieTunnel.update(dt, speedMult);
  gameTunnel.update(dt, speedMult);
  createStage.update(dt, speedMult);

  // Update Alice
  alice.update(dt, speedMult);

  // 1. Render active generative rabbit hole tunnel or create stage
  transitionManager.renderTunnels(ctx, width, height, cx, cy);

  // 2. Render radial energy glow waves (during tunnel eras)
  if (transitionManager.activeEra < 3 && transitionManager.state !== States.OPENING_BOOK) {
    lightWaves.renderRadialGlow(ctx, width, height, cx, cy);
  }

  // 3. Render Alice character with 3D depth perspective
  if (transitionManager.activeEra < 3 && transitionManager.state !== States.OPENING_BOOK) {
    alice.render(ctx, width, height, cx, cy);
  }

  // 4. Update and render Pocket Watch
  pocketWatch.update(dt);
  pocketWatch.render();
}

// Start the experience
transitionManager.start();
requestAnimationFrame(animate);
