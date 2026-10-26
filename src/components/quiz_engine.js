/* =========================================================
   TagSci G11 Study WebApp - Active Recall Flashcard Engine
   Supports:
   - 3D Card Flip (Touch, Click, Spacebar)
   - 3-Tier Leitner Spaced Repetition (Box 1: Again, Box 2: Good, Box 3: Mastered)
   - Shuffling & Unmastered Filter Mode
   - LaTeX & Markdown rendering on Front & Back
   - Keyboard Shortcuts (Space: Flip, 1: Again, 2: Good, 3: Mastered, H: Hint)
   ========================================================= */

import { FLASHCARD_DECKS } from '../data/study_data.js';
import { renderMathInHtml } from './math_engine.js';
import { navigateSection } from './navigation.js';

let currentDeck = null;
let currentDeckCards = [];
let currentCardIndex = 0;
let isCardFlipped = false;
let isHintVisible = false;
let practiceFilter = 'all'; // 'all' | 'unmastered'

const STORAGE_LEITNER_PREFIX = 'tagsci_leitner_deck_';

function getLeitnerStore(deckId) {
  try {
    const raw = localStorage.getItem(STORAGE_LEITNER_PREFIX + deckId);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLeitnerCard(deckId, cardId, box) {
  try {
    const store = getLeitnerStore(deckId);
    store[cardId] = {
      box: Math.max(1, Math.min(3, box)),
      lastReviewed: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_LEITNER_PREFIX + deckId, JSON.stringify(store));
  } catch (e) {
    console.warn('Could not save Leitner card status:', e);
  }
}

export function renderFlashcardsView() {
  const container = document.getElementById('flashcardsListContainer') || document.getElementById('quizSetsListContainer');
  if (!container) return;

  const decks = FLASHCARD_DECKS || [];

  if (decks.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <span class="text-3xl block mb-2">&#x1F0CF;</span>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">No Flashcard Decks Published Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Active recall flashcard decks will appear here once authored or synced.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <!-- Flashcard Decks Grid -->
    <div id="flashcardDeckGrid" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      ${decks.map(deck => {
        const store = getLeitnerStore(deck.id);
        const cards = deck.cards || [];
        let b1 = 0, b2 = 0, b3 = 0;
        cards.forEach(c => {
          const b = store[c.id] ? store[c.id].box : 1;
          if (b === 3) b3++;
          else if (b === 2) b2++;
          else b1++;
        });

        const percentMastered = cards.length ? Math.round((b3 / cards.length) * 100) : 0;

        return `
          <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${deck.color || 'border-l-4 border-amber-500'} shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  ${deck.tag || deck.subject || 'Core Deck'}
                </span>
                <span class="text-xs text-slate-400 font-mono-math">${cards.length} Cards</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-2.5">
                ${renderMathInHtml(deck.title || 'Untitled Deck')}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                ${renderMathInHtml(deck.desc || '')}
              </p>

              <!-- Mastery Progress Bar -->
              <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div class="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>${percentMastered}% Mastered</span>
                  </span>
                  <span class="font-mono-math text-[10px] text-slate-400">
                    Box 3: ${b3} | Box 2: ${b2} | Box 1: ${b1}
                  </span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                  <div class="bg-emerald-500 h-1.5 transition-all duration-300" style="width: ${cards.length ? (b3 / cards.length) * 100 : 0}%"></div>
                  <div class="bg-amber-400 h-1.5 transition-all duration-300" style="width: ${cards.length ? (b2 / cards.length) * 100 : 0}%"></div>
                  <div class="bg-rose-400 h-1.5 transition-all duration-300" style="width: ${cards.length ? (b1 / cards.length) * 100 : 0}%"></div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button onclick="window.App.startFlashcardSession('${deck.id}', 'all')" class="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5">
                <span>&#x25B6;</span>
                <span>Practice All</span>
              </button>
              ${b1 + b2 > 0 ? `
                <button onclick="window.App.startFlashcardSession('${deck.id}', 'unmastered')" class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition" title="Practice only cards that need review">
                  Review (${b1 + b2})
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Active Flashcard Player Workspace -->
    <div id="flashcardPlayerContainer" class="hidden space-y-4"></div>
  `;
}

export function startFlashcardSession(deckId, mode = 'all') {
  currentDeck = (FLASHCARD_DECKS || []).find(d => d.id === deckId);
  if (!currentDeck || !currentDeck.cards || currentDeck.cards.length === 0) return;

  const store = getLeitnerStore(currentDeck.id);
  practiceFilter = mode;

  if (mode === 'unmastered') {
    currentDeckCards = currentDeck.cards.filter(c => {
      const b = store[c.id] ? store[c.id].box : 1;
      return b < 3;
    });
    if (currentDeckCards.length === 0) {
      currentDeckCards = [...currentDeck.cards];
    }
  } else {
    currentDeckCards = [...currentDeck.cards];
  }

  currentCardIndex = 0;
  isCardFlipped = false;
  isHintVisible = false;

  const deckGrid = document.getElementById('flashcardDeckGrid') || document.getElementById('quizDeckGrid');
  const player = document.getElementById('flashcardPlayerContainer') || document.getElementById('quizPlayerContainer');

  if (deckGrid) deckGrid.classList.add('hidden');
  if (player) {
    player.classList.remove('hidden');
    renderCurrentFlashcard();
  }

  // Hook keyboard listener
  window.removeEventListener('keydown', handleFlashcardKeydown);
  window.addEventListener('keydown', handleFlashcardKeydown);
}

function handleFlashcardKeydown(e) {
  const player = document.getElementById('flashcardPlayerContainer') || document.getElementById('quizPlayerContainer');
  if (!player || player.classList.contains('hidden')) return;

  // Don't trigger if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
    flipFlashcard();
  } else if (e.key === '1') {
    e.preventDefault();
    rateFlashcard(1);
  } else if (e.key === '2') {
    e.preventDefault();
    rateFlashcard(2);
  } else if (e.key === '3') {
    e.preventDefault();
    rateFlashcard(3);
  } else if (e.key.toLowerCase() === 'h') {
    e.preventDefault();
    toggleFlashcardHint();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevFlashcard();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    nextFlashcard();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    exitFlashcardSession();
  }
}

export function flipFlashcard() {
  isCardFlipped = !isCardFlipped;
  const cardInner = document.getElementById('flashcard-flipper');
  if (cardInner) {
    cardInner.classList.toggle('flipped', isCardFlipped);
  }

  const controls = document.getElementById('flashcard-rating-controls');
  if (controls) {
    controls.classList.toggle('hidden', !isCardFlipped);
  }
}

export function toggleFlashcardHint() {
  isHintVisible = !isHintVisible;
  const hintEl = document.getElementById('flashcard-hint-box');
  if (hintEl) {
    hintEl.classList.toggle('hidden', !isHintVisible);
  }
}

export function rateFlashcard(boxNumber) {
  if (!currentDeck || !currentDeckCards[currentCardIndex]) return;

  const card = currentDeckCards[currentCardIndex];
  saveLeitnerCard(currentDeck.id, card.id, boxNumber);
  renderDashboardStudyDrill();

  // Advance to next card or finish session
  if (currentCardIndex < currentDeckCards.length - 1) {
    currentCardIndex++;
    isCardFlipped = false;
    isHintVisible = false;
    renderCurrentFlashcard();
  } else {
    renderFlashcardSessionSummary();
  }
}

export function prevFlashcard() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    isCardFlipped = false;
    isHintVisible = false;
    renderCurrentFlashcard();
  }
}

export function nextFlashcard() {
  if (currentCardIndex < currentDeckCards.length - 1) {
    currentCardIndex++;
    isCardFlipped = false;
    isHintVisible = false;
    renderCurrentFlashcard();
  } else {
    renderFlashcardSessionSummary();
  }
}

export function shuffleCurrentDeck() {
  for (let i = currentDeckCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeckCards[i], currentDeckCards[j]] = [currentDeckCards[j], currentDeckCards[i]];
  }
  currentCardIndex = 0;
  isCardFlipped = false;
  isHintVisible = false;
  renderCurrentFlashcard();
}

function renderCurrentFlashcard() {
  const player = document.getElementById('flashcardPlayerContainer') || document.getElementById('quizPlayerContainer');
  if (!player || !currentDeckCards[currentCardIndex]) return;

  const card = currentDeckCards[currentCardIndex];
  const total = currentDeckCards.length;
  const store = getLeitnerStore(currentDeck.id);
  const currentBox = store[card.id] ? store[card.id].box : 1;

  const boxBadge = currentBox === 3
    ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Box 3: Mastered</span>'
    : (currentBox === 2
      ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Box 2: Reviewing</span>'
      : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Box 1: Learning</span>');

  const progressPercent = Math.round(((currentCardIndex + 1) / total) * 100);

  player.innerHTML = `
    <!-- Flashcard Top Meta Bar -->
    <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <button onclick="window.App.exitFlashcardSession()" class="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 transition">
          <span>&larr;</span>
          <span>Exit Session</span>
        </button>
        <div class="flex items-center gap-2">
          <button onclick="window.App.shuffleCurrentDeck()" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition flex items-center gap-1" title="Shuffle deck order">
            <span>&#x1F500;</span>
            <span class="hidden sm:inline">Shuffle</span>
          </button>
          <span class="text-xs font-mono-math text-slate-500 dark:text-slate-400">
            Card <strong>${currentCardIndex + 1}</strong> of ${total}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            ${card.topic || currentDeck.subject || 'Core'}
          </span>
          ${boxBadge}
        </div>
        <span class="text-[11px] font-bold text-amber-500 font-mono-math">${progressPercent}%</span>
      </div>

      <!-- Linear Progress Bar -->
      <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div class="bg-amber-500 h-1.5 transition-all duration-300 rounded-full" style="width: ${progressPercent}%"></div>
      </div>
    </div>

    <!-- 3D Flip Card Container -->
    <div class="flashcard-scene" onclick="window.App.flipFlashcard()">
      <div id="flashcard-flipper" class="flashcard-card ${isCardFlipped ? 'flipped' : ''}">
        
        <!-- CARD FRONT -->
        <div class="flashcard-face flashcard-front">
          <div class="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            <span class="flex items-center gap-1">
              <span>&#x1F50D;</span> Question / Prompt
            </span>
            <span class="text-amber-500/80">Tap to Flip &bull; [Space]</span>
          </div>

          <div class="flex-1 flex items-center justify-center text-center p-4">
            <div class="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              ${renderMathInHtml(card.front || '')}
            </div>
          </div>

          <div class="w-full text-center pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
            Tap anywhere to reveal back
          </div>
        </div>

        <!-- CARD BACK -->
        <div class="flashcard-face flashcard-back">
          <div class="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4">
            <span class="flex items-center gap-1">
              <span>&#x1F4A1;</span> Solution & Concept
            </span>
            <span class="text-slate-400">Tap to Flip &bull; [Space]</span>
          </div>

          <div class="flex-1 flex items-center justify-center text-center p-4">
            <div class="text-sm sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed max-w-xl">
              ${renderMathInHtml(card.back || '')}
            </div>
          </div>

          <div class="w-full text-center pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
            How well did you know this? Rate below
          </div>
        </div>

      </div>
    </div>

    <!-- Optional Hint Bar -->
    ${card.hint ? `
      <div class="text-center">
        <button onclick="event.stopPropagation(); window.App.toggleFlashcardHint();" class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1">
          <span>&#x1F4A1;</span>
          <span>${isHintVisible ? 'Hide Hint [H]' : 'Need a Hint? [H]'}</span>
        </button>
        <div id="flashcard-hint-box" class="${isHintVisible ? '' : 'hidden'} mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 max-w-lg mx-auto leading-relaxed">
          ${renderMathInHtml(card.hint)}
        </div>
      </div>
    ` : ''}

    <!-- Bottom Actions: Rating Controls (shown after flip) vs Navigation Controls -->
    <div id="flashcard-rating-controls" class="${isCardFlipped ? '' : 'hidden'} space-y-2 pt-1">
      <div class="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Rate Your Active Recall (Leitner Spaced Repetition)
      </div>
      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        <button onclick="event.stopPropagation(); window.App.rateFlashcard(1);" class="p-3 sm:p-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm transition flex flex-col items-center justify-center shadow-sm active:scale-95">
          <span class="text-base sm:text-lg mb-0.5">&#x1F534;</span>
          <span>Again (Box 1)</span>
          <span class="text-[9.5px] opacity-75 font-normal hidden sm:inline">Press [1]</span>
        </button>

        <button onclick="event.stopPropagation(); window.App.rateFlashcard(2);" class="p-3 sm:p-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm transition flex flex-col items-center justify-center shadow-sm active:scale-95">
          <span class="text-base sm:text-lg mb-0.5">&#x1F7E1;</span>
          <span>Good (Box 2)</span>
          <span class="text-[9.5px] opacity-75 font-normal hidden sm:inline">Press [2]</span>
        </button>

        <button onclick="event.stopPropagation(); window.App.rateFlashcard(3);" class="p-3 sm:p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm transition flex flex-col items-center justify-center shadow-sm active:scale-95">
          <span class="text-base sm:text-lg mb-0.5">&#x1F7E2;</span>
          <span>Mastered (Box 3)</span>
          <span class="text-[9.5px] opacity-75 font-normal hidden sm:inline">Press [3]</span>
        </button>
      </div>
    </div>

    <!-- Stepper Navigation Controls -->
    <div class="flex items-center justify-between pt-2">
      <button onclick="window.App.prevFlashcard()" ${currentCardIndex === 0 ? 'disabled' : ''} class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1">
        <span>&larr;</span>
        <span>Previous</span>
      </button>

      <button onclick="window.App.nextFlashcard()" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1">
        <span>${currentCardIndex === total - 1 ? 'Finish' : 'Next'}</span>
        <span>&rarr;</span>
      </button>
    </div>
  `;
}

function renderFlashcardSessionSummary() {
  const player = document.getElementById('flashcardPlayerContainer') || document.getElementById('quizPlayerContainer');
  if (!player || !currentDeck) return;

  const store = getLeitnerStore(currentDeck.id);
  const cards = currentDeck.cards || [];
  let b1 = 0, b2 = 0, b3 = 0;
  cards.forEach(c => {
    const b = store[c.id] ? store[c.id].box : 1;
    if (b === 3) b3++;
    else if (b === 2) b2++;
    else b1++;
  });

  const percentMastered = cards.length ? Math.round((b3 / cards.length) * 100) : 0;

  player.innerHTML = `
    <div class="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center space-y-5">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl">
        &#x1F3C6;
      </div>
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Session Completed!
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          ${renderMathInHtml(currentDeck.title)}
        </p>
      </div>

      <!-- Leitner Breakdown Box -->
      <div class="grid grid-cols-3 gap-2.5 max-w-md mx-auto pt-2">
        <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
          <div class="text-xl font-bold font-mono-math text-emerald-600 dark:text-emerald-400">${b3}</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Box 3: Mastered</div>
        </div>

        <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
          <div class="text-xl font-bold font-mono-math text-amber-600 dark:text-amber-400">${b2}</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Box 2: Reviewing</div>
        </div>

        <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center">
          <div class="text-xl font-bold font-mono-math text-rose-600 dark:text-rose-400">${b1}</div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Box 1: Again</div>
        </div>
      </div>

      <div class="max-w-xs mx-auto">
        <div class="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
          <span>Overall Mastery</span>
          <span class="text-amber-500">${percentMastered}%</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500" style="width: ${percentMastered}%"></div>
        </div>
      </div>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <button onclick="window.App.startFlashcardSession('${currentDeck.id}', 'all')" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-95 shadow-sm">
          Restart Deck
        </button>
        ${b1 + b2 > 0 ? `
          <button onclick="window.App.startFlashcardSession('${currentDeck.id}', 'unmastered')" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 font-bold text-xs transition">
            Review Unmastered (${b1 + b2})
          </button>
        ` : ''}
        <button onclick="window.App.exitFlashcardSession()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition">
          Back to Decks
        </button>
      </div>
    </div>
  `;
}

export function exitFlashcardSession() {
  window.removeEventListener('keydown', handleFlashcardKeydown);
  const deckGrid = document.getElementById('flashcardDeckGrid') || document.getElementById('quizDeckGrid');
  const player = document.getElementById('flashcardPlayerContainer') || document.getElementById('quizPlayerContainer');

  if (player) player.classList.add('hidden');
  if (deckGrid) deckGrid.classList.remove('hidden');

  renderFlashcardsView();
}

export const renderQuizSetsView = renderFlashcardsView;
export const startQuiz = (id) => startFlashcardSession(id, 'all');
export const exitQuiz = exitFlashcardSession;

export function renderDashboardStudyDrill() {
  const cardsDueBadge = document.getElementById('dashboardCardsDueBadge');
  const streakDueLabel = document.getElementById('dashboardStreakDueLabel');
  const retentionGoalText = document.getElementById('dashboardRetentionGoalText');
  const retentionBar = document.getElementById('dashboardRetentionBar');
  const estTimeLabel = document.getElementById('dashboardEstTimeLabel');

  const decks = FLASHCARD_DECKS || [];
  let totalCards = 0;
  let unmastered = 0;
  let reviewedToday = 0;
  const todayStr = new Date().toISOString().slice(0, 10);

  decks.forEach(deck => {
    const store = getLeitnerStore(deck.id);
    const cards = deck.cards || [];
    totalCards += cards.length;
    cards.forEach(c => {
      const item = store[c.id];
      if (item) {
        if (item.lastReviewed && item.lastReviewed.startsWith(todayStr)) {
          reviewedToday++;
        }
        if (item.box < 3) {
          unmastered++;
        }
      } else {
        unmastered++;
      }
    });
  });

  const due = Math.max(unmastered, 0);
  const doneCount = reviewedToday;
  const totalPool = doneCount + due || 1;
  const pct = Math.min(100, Math.round((doneCount / totalPool) * 100));

  if (cardsDueBadge) cardsDueBadge.textContent = `${due} Cards Due`;
  if (streakDueLabel) streakDueLabel.textContent = `${due} Cards Due`;
  if (retentionGoalText) retentionGoalText.textContent = `${doneCount} / ${doneCount + due} Done (${pct}%)`;
  if (retentionBar) retentionBar.style.width = `${Math.max(pct, doneCount > 0 ? 10 : 0)}%`;
  if (estTimeLabel) estTimeLabel.textContent = `Est. Time: ~${Math.ceil((due * 0.25) || 2)} mins`;
}

export function startDailyDrill() {
  const decks = FLASHCARD_DECKS || [];
  if (decks.length > 0) {
    navigateSection('quiz_sets');
    startFlashcardSession(decks[0].id, 'all');
  } else {
    navigateSection('quiz_sets');
  }
}

