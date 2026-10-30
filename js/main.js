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
import { PostFX, SoundFX } from './systems/fx.js';
import { InterludeScene } from './systems/interludeScene.js';

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
const cinematicKicker = document.getElementById('cinematic-kicker');
const cinematicProgress = document.getElementById('cinematic-progress');

// Era HUD & sound toggle
const eraHud = document.getElementById('era-hud');
const soundToggle = document.getElementById('sound-toggle');

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
const fx = new PostFX();
const sfx = new SoundFX();
const interlude = new InterludeScene();

// Chapter metadata shown in the HUD and above the interlude phrases
const ERA_INFO = [
  { num: 'I', year: '1865', label: 'El libro' },
  { num: 'II', year: '1951', label: 'La animación' },
  { num: 'III', year: '2011', label: 'El videojuego' },
  { num: 'IV', year: 'Hoy', label: 'Tu madriguera' }
];
const SUITS = ['♠', '♥', '♦', '♣'];

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

  setMuted(m) {
    this.bgMusic.muted = m;
  }

  start() {
    sfx.ensure();
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
    this.isTransitioning = true;

    // Progress pips: one playing-card suit per phrase
    cinematicProgress.innerHTML = this.phrases
      .map((_, i) => `<span class="pip" data-i="${i}">${SUITS[i % 4]}</span>`)
      .join('');

    cinematicOverlay.style.display = 'flex';
    cinematicOverlay.classList.remove('leaving');
    requestAnimationFrame(() => cinematicOverlay.classList.add('shown'));
    setTimeout(() => this.showCurrentPhrase(), 650);
  }

  renderPhrase(text) {
    const words = text.split(/\s+/);
    const isLeitmotif = /madriguera/.test(text) && /momento más tarde/.test(text);
    const isQuestion = /^¿/.test(text);
    const isShort = text.length < 40;
    cinematicPhraseText.className = 'cinematic-phrase-text' +
      (isLeitmotif ? ' leitmotif' : '') + (isQuestion ? ' question' : '') + (isShort && !isQuestion ? ' short' : '');
    const stagger = Math.max(0.018, Math.min(0.07, 1.6 / words.length));
    cinematicPhraseText.innerHTML = words
      .map((w, i) => `<span class="w" style="--d:${(i * stagger).toFixed(3)}s">${w}</span>`)
      .join(' ');
  }

  updatePips() {
    cinematicProgress.querySelectorAll('.pip').forEach((el, i) => {
      el.classList.toggle('done', i < this.currentIndex);
      el.classList.toggle('current', i === this.currentIndex);
    });
  }

  showCurrentPhrase() {
    if (this.currentIndex >= this.phrases.length) {
      this.finish();
      return;
    }

    const text = this.phrases[this.currentIndex];
    cinematicPhraseText.classList.remove('visible');

    setTimeout(() => {
      this.renderPhrase(text);
      this.updatePips();
      interlude.bump();
      // force reflow so the word animation restarts
      void cinematicPhraseText.offsetWidth;
      cinematicPhraseText.classList.add('visible');
      this.isTransitioning = false;
    }, 260);
  }

  advance() {
    if (!this.isActive || this.isTransitioning) return;
    this.isTransitioning = true;

    cinematicPhraseText.classList.add('leaving');
    cinematicPhraseText.classList.remove('visible');

    setTimeout(() => {
      cinematicPhraseText.classList.remove('leaving');
      this.currentIndex++;
      if (this.currentIndex >= this.phrases.length) {
        this.finish();
      } else {
        this.showCurrentPhrase();
      }
    }, 340);
  }

  finish() {
    this.isActive = false;
    cinematicOverlay.classList.add('leaving');
    cinematicOverlay.classList.remove('shown');
    sfx.whoosh(0.9, true);
    // The keyhole closes on the interlude, then the next world opens through it
    fx.irisTo(0, 0.75, { shape: 'keyhole', rim: [235, 196, 120] });
    setTimeout(() => {
      cinematicOverlay.style.display = 'none';
      cinematicOverlay.classList.remove('leaving');
      if (this.onAllFinished) {
        this.onAllFinished();
      }
    }, 800);
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
      const suit = SUITS[this.currentIndex % 4];
      finalPhraseElement.dataset.suit = suit;
      finalPhraseElement.classList.toggle('red-suit', suit === '♥' || suit === '♦');
      const tilt = item.type === 'title-phrase' ? -2 : ((Math.random() - 0.5) * 3.2);
      finalPhraseElement.style.setProperty('--tilt', tilt.toFixed(2) + 'deg');
      if (item.type === 'title-phrase') {
        finalPhraseElement.innerHTML = item.text.split('').map((ch, i) =>
          `<span class="l" style="--d:${(i * 0.055).toFixed(3)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
        ).join('');
      } else {
        finalPhraseElement.textContent = item.text;
      }
      void finalPhraseElement.offsetWidth;
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
        sfx.chime(880);
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
function showEraHud(era) {
  const info = ERA_INFO[era];
  if (!info || !eraHud) return;
  eraHud.innerHTML = `<span class="era-num">${info.num}</span><span class="era-sep"></span>` +
    `<span class="era-year">${info.year}</span><span class="era-label">${info.label}</span>`;
  eraHud.dataset.era = era;
  eraHud.classList.add('visible');
}

function hideEraHud() {
  if (eraHud) eraHud.classList.remove('visible');
}

function startOpeningBook() {
  interlude.show('opening');
  fx.setLook('opening');
  fx.setIris(1);
  hideEraHud();
  openingBookContainer.classList.remove('book-falling');
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
  hideEraHud();

  // Living interlude behind the phrases, fading up from the closed keyhole
  interlude.show(eraIndex);
  fx.setLook('interlude');
  fx.setIris(1);
  const info = ERA_INFO[eraIndex];
  cinematicKicker.innerHTML = `<span class="k-num">${info.num}</span><span class="k-dot">✦</span>` +
    `<span class="k-year">${info.year}</span><span class="k-dot">✦</span><span class="k-label">${info.label}</span>`;
  cinematicOverlay.dataset.era = eraIndex;

  cinematicPresenter.start(CINEMATIC_PHRASES[eraIndex], () => {
    transitionManager.onNarrativeFinished();
  });
}

// User action handler for Book Opening
let bookExiting = false;
function handleBookOpeningAction() {
  audio.init();

  if (bookTypewriter.isTyping) {
    bookTypewriter.fastForward();
    return;
  }

  if (bookTypewriter.isComplete && !bookExiting) {
    // The book itself tumbles into the rabbit hole and the keyhole closes behind it
    bookExiting = true;
    narrativeContinueHint.classList.remove('visible');
    openingBookContainer.classList.add('book-falling');
    sfx.whoosh(1.3, true);
    fx.irisTo(0, 0.8, { delay: 0.45, shape: 'keyhole', rim: [235, 196, 120] });
    setTimeout(() => {
      narrativeOverlay.classList.add('hidden');
      narrativeOverlay.style.display = 'none';
      bookExiting = false;
      transitionManager.onNarrativeFinished();
    }, 1300);
  }
}

// ==========================================================================
// SUBSYSTEM INITIALIZATION & TRANSITION MANAGER
// ==========================================================================
pocketWatch = new PocketWatch(watchCanvas, (direction) => {
  audio.triggerTransitionWhoosh();
  transitionManager.triggerWatchTransition(direction);
});
pocketWatch.onTick = () => sfx.tick();

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
      showEraHud(era);
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
      hideEraHud();
    },
    onLeaveCreate: () => {
      createControlsPanel.style.display = 'none';
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
      hideEraHud();
      finalReflectionPresenter.start();
    },
    onResumeCreate: () => {
      finalReflectionPresenter.hide();
      createControlsPanel.style.display = 'flex';
      watchContainer.classList.add('visible');
      showEraHud(3);
    }
  },
  fx,
  sfx
);

// Sound toggle (music + effects)
let isMuted = false;
try { isMuted = localStorage.getItem('wb-muted') === '1'; } catch (e) { /* storage unavailable */ }
function applyMute() {
  audio.setMuted(isMuted);
  sfx.setEnabled(!isMuted);
  if (soundToggle) {
    soundToggle.classList.toggle('muted', isMuted);
    soundToggle.setAttribute('aria-label', isMuted ? 'Activar sonido' : 'Silenciar');
  }
}
applyMute();
if (soundToggle) {
  soundToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    try { localStorage.setItem('wb-muted', isMuted ? '1' : '0'); } catch (err) { /* ignore */ }
    applyMute();
  });
  soundToggle.addEventListener('mousedown', (e) => e.stopPropagation());
}

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
  transitionManager.activeEra = 0;
  createStage.isActive = false;
  fx.irisTo(0, 0.6, { shape: 'circle', rim: [255, 215, 90], onDone: () => {
    transitionManager.setState(States.OPENING_BOOK);
  } });
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
  fx.resize(width, height);
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
  if (e.target.closest('#watch-container') || e.target.closest('#create-controls-panel') || e.target.closest('#final-reflection-overlay') || e.target.closest('#sound-toggle')) {
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

  // Update Transition Manager & post FX
  transitionManager.update(dt);
  fx.update(dt);
  const speedMult = transitionManager.tunnelSpeedMultiplier;
  const state = transitionManager.state;
  const inCreate = state === States.CREATE_ACTIVE || state === States.CONTEMPLATING;

  // Smooth vanishing point parallax
  const targetCx = width / 2 + mouseTargetX * 22;
  const targetCy = height / 2 + mouseTargetY * 16;
  cx += (targetCx - cx) * Math.min(1.0, dt * 3);
  cy += (targetCy - cy) * Math.min(1.0, dt * 3);

  // Update only what is on screen
  lightWaves.update(dt, transitionManager.activeEra, speedMult);
  transitionManager.updateScene(dt);
  if (inCreate) createStage.update(dt, speedMult);
  interlude.update(dt, width, height);
  alice.update(dt, speedMult);

  // 0. Interlude world (opening & between eras)
  if (transitionManager.isInterludeState()) {
    interlude.render(ctx, width, height, width / 2 + (cx - width / 2) * 0.5, height / 2 + (cy - height / 2) * 0.5);
  }

  // 1. Active generative rabbit hole tunnel (+ depth rings & objects) or CREATE stage
  transitionManager.renderTunnels(ctx, width, height, cx, cy);

  // 2. Alice with depth, trail and era aura
  if (transitionManager.activeEra < 3 && !transitionManager.isInterludeState()) {
    alice.render(ctx, width, height, cx, cy);
  }

  // 3. Post FX: speed lines, vignette, grain, flashes, keyhole iris
  fx.render(ctx, cx, cy);

  // 4. Pocket Watch
  pocketWatch.update(dt);
  pocketWatch.render();
}

// Debug hook (only with ?debug in the URL) to jump between scenes
if (location.search.indexOf('debug') !== -1) {
  window.__WB = { transitionManager, States, fx, cinematicPresenter, finalReflectionPresenter, createStage };
}

// Start the experience
transitionManager.start();
requestAnimationFrame(animate);
