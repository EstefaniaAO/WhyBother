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

// Narrative Book Opening DOM Elements
const narrativeOverlay = document.getElementById('narrative-overlay');
const openingBookContainer = document.getElementById('opening-book-container');
const bookTextBody = document.getElementById('book-text-body');
const narrativeContinueHint = document.getElementById('narrative-continue-hint');

// Cinematic Phrase-by-Phrase Transition Screen
const cinematicOverlay = document.getElementById('cinematic-overlay');
const cinematicPhraseText = document.getElementById('cinematic-phrase-text');

// Create Stage Controls
const createControlsPanel = document.getElementById('create-controls-panel');
const btnContemplate = document.getElementById('btn-contemplate');

// Final Reflection (Over the living artwork)
const finalReflectionOverlay = document.getElementById('final-reflection-overlay');
const finalPhraseElement = document.getElementById('final-phrase-element');
const finalControls = document.getElementById('final-controls');
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

// Primary Audio Player: Assets/Alice in Wonderland.mp3
class ExperienceAudio {
  constructor() {
    this.bgMusic = new Audio('assets/Alice in Wonderland.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.38; // Elegant, atmospheric, non-invasive volume
    this.isStarted = false;
  }

  start() {
    if (this.isStarted) return;
    const playPromise = this.bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isStarted = true;
      }).catch(() => {
        // Autoplay policy: will trigger on next user click or keypress
      });
    }
  }

  triggerTransitionWhoosh() {
    // Subtle volume dip & swell during era shift to reinforce passage through time
    if (!this.isStarted) return;
    try {
      const origVol = this.bgMusic.volume;
      this.bgMusic.volume = Math.max(0.15, origVol * 0.7);
      setTimeout(() => {
        this.bgMusic.volume = origVol;
      }, 1200);
    } catch (e) {
      // Ignore audio volume glitches
    }
  }

  setEra(era) {
    // Music plays continuously across eras and CREATE without resetting
  }

  init() {
    this.start();
  }
}

const audio = new ExperienceAudio();

// ==========================================================================
// CINEMATIC SENTENCE-BY-SENTENCE DEFINITIONS
// ==========================================================================
const CINEMATIC_PHRASES = {
  // Transición hacia Disney: 1951
  1: [
    "Ochenta y seis años habían pasado desde que aquella historia fuera escrita.",
    "El mundo había cambiado, y las historias comenzaban a encontrar nuevas maneras de existir.",
    "Ya no vivían solamente entre las páginas de un libro.",
    "Ahora podían cobrar vida a través de ilustraciones en movimiento, colores que parecían salirse del papel y melodías que acompañaban cada aventura.",
    "En una de aquellas versiones, otra pequeña Alicia cantaba entre flores que hablaban, mientras se despedía de su gata Diana antes de seguir al conejo.",
    "El mundo que antes había sido imaginado con palabras ahora podía verse, escucharse y moverse ante nuestros ojos.",
    "Pero la curiosidad seguía siendo la misma.",
    "Y, sin embargo, un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
  ],

  // Transición hacia el Videojuego: 2011
  2: [
    "Sesenta años más tarde, el mundo de Alicia era muy diferente.",
    "Las historias ya no se limitaban a ser leídas o contempladas.",
    "Ahora podían recorrerse, explorarse e incluso alterarse.",
    "Aquello que antes exigía miles y miles de dibujos podía tomar forma mediante herramientas digitales, y los mundos imaginados podían convertirse en lugares que cualquiera podía habitar.",
    "Pero no todos los Países de las Maravillas conservaban la inocencia de aquel primero.",
    "En una nueva historia, Alicia Liddell regresaba a un mundo deformado por sus propios recuerdos.",
    "Los colores se habían vuelto más sombríos, los caminos más inquietantes y los personajes, mucho menos familiares.",
    "Ya no bastaba con observar cómo se desarrollaba la aventura.",
    "Esta vez, había que atravesarla.",
    "Y aunque el mundo al otro lado fuera irreconocible, algo permanecía intacto.",
    "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
  ],

  // Transición hacia CREATE
  3: [
    "Más de cien años habían pasado.",
    "Cientos de Alicias habían existido desde entonces.",
    "Algunas habían sido dibujadas, otras pintadas, animadas, actuadas, reconstruidas y transformadas.",
    "Cada una había encontrado su propia forma de caer, y cada una había llevado consigo algo de quien la imaginó.",
    "Las herramientas habían cambiado.",
    "Las posibilidades parecían no tener fin.",
    "Ahora, bastaba una instrucción para obtener imágenes de mundos que antes habrían requerido incontables horas de trabajo.",
    "Y entonces...",
    "¿qué quedaba por imaginar?"
  ]
};

// Final Reflection Sentences (Presented one by one over the living artwork)
const FINAL_REFLECTION_SEQUENCE = [
  { text: "WHY BOTHER?", type: "title-phrase" },
  { text: "¿Por qué molestarse?", type: "subtitle-phrase" },
  { text: "Porque crear nunca ha consistido únicamente en producir algo.", type: "normal" },
  { text: "Ha consistido en imaginar lo que todavía no existe, en explorar caminos que no siempre llevan a donde esperábamos y en encontrar algo propio entre todas las posibilidades.", type: "normal" },
  { text: "Porque ninguna herramienta puede decidir por nosotros qué nos conmueve, qué despierta nuestra curiosidad o qué queremos expresar.", type: "normal" },
  { text: "Las herramientas pueden cambiar, multiplicarse e incluso hacer posible lo que antes parecía inalcanzable.", type: "normal" },
  { text: "Pero siempre habrá tantas maneras de imaginar como personas dispuestas a hacerlo.", type: "normal" },
  { text: "Y porque, después de tantos años, de tantas historias y de tantas formas de contarla, Alicia siempre encontrará una madriguera en la que meterse.", type: "closing-phrase" }
];

// ==========================================================================
// BOOK OPENING TYPEWRITER
// ==========================================================================
class BookTypewriter {
  constructor() {
    this.isTyping = false;
    this.isComplete = false;
    this.typeInterval = null;
    this.paragraphs = [
      "Pero cuando el conejo se sacó un reloj de bolsillo del chaleco, lo miró y echó a correr, Alicia se levantó de un salto, porque comprendió de golpe que ella nunca había visto un conejo con chaleco, ni con reloj que sacarse de él, y, ardiendo de curiosidad, se puso a correr tras el conejo por la pradera, y llegó justo a tiempo para ver cómo se precipitaba en una madriguera que se abría al pie del seto.",
      "Un momento más tarde, Alicia se metía también en la madriguera, sin pararse a considerar cómo se las arreglaría después para salir."
    ];
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.isComplete = false;
    this.isTyping = true;
    narrativeContinueHint.classList.remove('visible');
    bookTextBody.innerHTML = '';

    const tokens = [];
    this.paragraphs.forEach((pText, pIdx) => {
      const words = pText.split(/\s+/);
      words.forEach((w) => {
        tokens.push({ text: w + ' ', pIdx });
      });
      if (pIdx < this.paragraphs.length - 1) {
        tokens.push({ text: '\n\n', pIdx });
      }
    });

    let currentTokenIndex = 0;
    let currentParagraphIndex = -1;
    let currentPElement = null;

    this.fullHtml = this.paragraphs.map(p => `<p>${p}</p>`).join('');

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
        bookTextBody.appendChild(currentPElement);
      }

      if (tok.text !== '\n\n') {
        currentPElement.textContent += tok.text;
      }
    }, 40);
  }

  fastForward() {
    if (!this.isTyping) return;
    clearInterval(this.typeInterval);
    bookTextBody.innerHTML = this.fullHtml;
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

const bookTypewriter = new BookTypewriter();

// ==========================================================================
// CINEMATIC PHRASE-BY-PHRASE CONTROLLER (DISNEY, GAME, CREATE)
// ==========================================================================
class CinematicPhrasePresenter {
  constructor() {
    this.isActive = false;
    this.phrases = [];
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.onAllFinished = null;
  }

  start(phrasesList, onAllFinished) {
    this.phrases = phrasesList;
    this.currentIndex = 0;
    this.onAllFinished = onAllFinished;
    this.isActive = true;
    this.isTransitioning = false;

    cinematicOverlay.style.display = 'flex';
    cinematicOverlay.style.opacity = '1';
    this.showCurrentPhrase();
  }

  showCurrentPhrase() {
    if (this.currentIndex >= this.phrases.length) {
      this.finish();
      return;
    }

    const text = this.phrases[this.currentIndex];
    cinematicPhraseText.classList.remove('visible');

    setTimeout(() => {
      cinematicPhraseText.textContent = text;
      cinematicPhraseText.classList.add('visible');
      this.isTransitioning = false;
    }, 280);
  }

  advance() {
    if (!this.isActive || this.isTransitioning) return;
    this.isTransitioning = true;

    cinematicPhraseText.classList.remove('visible');

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.phrases.length) {
        this.finish();
      } else {
        this.showCurrentPhrase();
      }
    }, 320);
  }

  finish() {
    this.isActive = false;
    cinematicOverlay.style.opacity = '0';
    setTimeout(() => {
      cinematicOverlay.style.display = 'none';
      if (this.onAllFinished) {
        this.onAllFinished();
      }
    }, 500);
  }
}

const cinematicPresenter = new CinematicPhrasePresenter();

// ==========================================================================
// FINAL LIVING REFLECTION CONTROLLER (OVER THE ACTIVE ARTWORK)
// ==========================================================================
class FinalReflectionPresenter {
  constructor() {
    this.isActive = false;
    this.currentIndex = 0;
    this.isTransitioning = false;
  }

  start() {
    this.isActive = true;
    this.currentIndex = 0;
    this.isTransitioning = false;

    finalReflectionOverlay.style.display = 'flex';
    finalControls.style.display = 'none';

    const cheshire = document.getElementById('cheshire-cat-container');
    if (cheshire) {
      cheshire.classList.remove('visible');
      cheshire.style.display = 'none';
    }

    this.showCurrentPhrase();
  }

  showCurrentPhrase() {
    if (this.currentIndex >= FINAL_REFLECTION_SEQUENCE.length) {
      this.finish();
      return;
    }

    const item = FINAL_REFLECTION_SEQUENCE[this.currentIndex];
    finalPhraseElement.classList.remove('visible');

    setTimeout(() => {
      finalPhraseElement.className = 'final-phrase-badge ' + (item.type || '');
      finalPhraseElement.textContent = item.text;
      finalPhraseElement.classList.add('visible');
      this.isTransitioning = false;
    }, 280);
  }

  advance() {
    if (!this.isActive || this.isTransitioning) return;

    if (this.currentIndex >= FINAL_REFLECTION_SEQUENCE.length - 1) {
      // Last phrase already shown, finish and show Cheshire cat & controls
      this.finish();
      return;
    }

    this.isTransitioning = true;
    finalPhraseElement.classList.remove('visible');

    setTimeout(() => {
      this.currentIndex++;
      this.showCurrentPhrase();
    }, 320);
  }

  finish() {
    this.isActive = false;
    finalPhraseElement.classList.remove('visible');

    // Reveal Cheshire Cat in the center over the living artwork
    const cheshire = document.getElementById('cheshire-cat-container');
    if (cheshire) {
      cheshire.style.display = 'flex';
      setTimeout(() => {
        cheshire.classList.add('visible');
      }, 80);
    }

    // Display action controls below
    setTimeout(() => {
      finalControls.style.display = 'flex';
    }, 350);
  }

  hide() {
    this.isActive = false;
    finalReflectionOverlay.style.display = 'none';
    finalPhraseElement.classList.remove('visible');

    const cheshire = document.getElementById('cheshire-cat-container');
    if (cheshire) {
      cheshire.classList.remove('visible');
      cheshire.style.display = 'none';
    }

    finalControls.style.display = 'none';
  }
}

const finalReflectionPresenter = new FinalReflectionPresenter();

// ==========================================================================
// NARRATIVE DISPATCHER
// ==========================================================================
function startOpeningBook() {
  narrativeOverlay.classList.remove('hidden');
  narrativeOverlay.style.display = 'flex';
  cinematicOverlay.style.display = 'none';
  mainUi.style.display = 'none';
  createControlsPanel.style.display = 'none';
  finalReflectionOverlay.style.display = 'none';

  bookTypewriter.start(() => {});
}

function startCinematicEraTransition(eraIndex) {
  narrativeOverlay.classList.add('hidden');
  narrativeOverlay.style.display = 'none';
  mainUi.style.display = 'none';
  createControlsPanel.style.display = 'none';
  finalReflectionOverlay.style.display = 'none';

  cinematicPresenter.start(CINEMATIC_PHRASES[eraIndex], () => {
    transitionManager.onNarrativeFinished();
  });
}

// User action handler for Book Opening
function handleBookOpeningAction() {
  audio.init();

  if (bookTypewriter.isTyping) {
    bookTypewriter.fastForward();
    return;
  }

  if (bookTypewriter.isComplete) {
    narrativeOverlay.classList.add('hidden');
    setTimeout(() => {
      narrativeOverlay.style.display = 'none';
      transitionManager.onNarrativeFinished();
    }, 600);
  }
}

// ==========================================================================
// SUBSYSTEM INITIALIZATION & TRANSITION MANAGER
// ==========================================================================
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
        startOpeningBook();
      } else if (state === States.TEXT_1_DISNEY) {
        startCinematicEraTransition(1);
      } else if (state === States.TEXT_2_GAME) {
        startCinematicEraTransition(2);
      } else if (state === States.TEXT_3_CREATE) {
        startCinematicEraTransition(3);
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
      finalReflectionPresenter.start();
    },
    onResumeCreate: () => {
      finalReflectionPresenter.hide();
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

// Restart Experience
btnRestartExperience.addEventListener('click', (e) => {
  e.stopPropagation();
  finalReflectionPresenter.hide();
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

// ==========================================================================
// INPUT HANDLING: KEYBOARD & CLICKS
// ==========================================================================
let lastKeySpaceTime = 0;

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    const now = performance.now();
    // Guard against rapid key repeat
    if (now - lastKeySpaceTime < 280) return;
    lastKeySpaceTime = now;

    if (cinematicPresenter.isActive) {
      cinematicPresenter.advance();
    } else if (finalReflectionPresenter.isActive) {
      finalReflectionPresenter.advance();
    } else if (!narrativeOverlay.classList.contains('hidden') && narrativeOverlay.style.display !== 'none') {
      handleBookOpeningAction();
    }
  }
});

// Click on Book Opening
narrativeOverlay.addEventListener('click', () => {
  handleBookOpeningAction();
});

// Click on Cinematic Phrase Screen
cinematicOverlay.addEventListener('click', () => {
  audio.init();
  if (cinematicPresenter.isActive) {
    cinematicPresenter.advance();
  }
});

// Click on Final Reflection Screen
finalReflectionOverlay.addEventListener('click', (e) => {
  if (e.target.closest('#final-controls')) return;
  if (finalReflectionPresenter.isActive) {
    finalReflectionPresenter.advance();
  }
});

// Mouse & Touch interaction for CREATE Stage & Alice parallax
let isMouseDown = false;

window.addEventListener('mousedown', (e) => {
  audio.init();
  if (e.target.closest('#watch-container') || e.target.closest('#create-controls-panel') || e.target.closest('#final-reflection-overlay')) {
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

// ==========================================================================
// MAIN ANIMATION LOOP
// ==========================================================================
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
