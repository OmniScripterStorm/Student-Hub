import { QUIZ_SETS } from '../data/study_data.js';
import { renderMathInHtml } from './math_engine.js';

let currentQuiz = null;
let currentQuestionIdx = 0;
let userAnswers = []; // array of user responses (index, string, or boolean)
let isPracticeMode = true;
let timerInterval = null;
let secondsRemaining = 0;

export function renderQuizSetsView() {
  const container = document.getElementById('quizSetsListContainer');
  if (!container) return;

  if (!QUIZ_SETS || QUIZ_SETS.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <span class="text-3xl block mb-2">&#x2753;</span>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">No Practice Quizzes Published Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Interactive self-test quiz banks will be available here once synced.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <!-- Quiz Selection Grid -->
    <div id="quizDeckGrid" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      ${QUIZ_SETS.map(q => `
        <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${q.color || 'border-l-4 border-tagsci-600'} shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-tagsci-100 dark:bg-tagsci-950 text-tagsci-800 dark:text-tagsci-300">
                ${q.tag || q.subject || 'STEM'}
              </span>
              <span class="text-xs text-slate-400 font-mono-math">${q.questions ? q.questions.length : 0} Items</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white mt-2">${renderMathInHtml(q.title)}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${renderMathInHtml(q.desc || '')}</p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button onclick="window.App.startQuiz('${q.id}', true)" class="flex-1 py-2 rounded-xl bg-tagsci-50 dark:bg-tagsci-950 hover:bg-tagsci-100 dark:hover:bg-tagsci-900 text-tagsci-700 dark:text-tagsci-300 font-bold text-xs transition border border-tagsci-200 dark:border-tagsci-800">
              ⚡ Practice Mode
            </button>
            <button onclick="window.App.startQuiz('${q.id}', false)" class="flex-1 py-2 rounded-xl bg-tagsci-800 hover:bg-tagsci-700 active:scale-95 text-white font-bold text-xs transition shadow-sm">
              ⏱️ Timed Test
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Active Player Container (injected dynamically when playing) -->
    <div id="quizPlayerContainer" class="hidden space-y-4"></div>

    <!-- Quiz Results Container -->
    <div id="quizResultsContainer" class="hidden space-y-6"></div>
  `;
}

export function startQuiz(quizId, practiceMode) {
  currentQuiz = QUIZ_SETS.find(q => q.id === quizId);
  if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) return;

  currentQuestionIdx = 0;
  userAnswers = new Array(currentQuiz.questions.length).fill(null);
  isPracticeMode = practiceMode;

  const deckGrid = document.getElementById('quizDeckGrid');
  const player = document.getElementById('quizPlayerContainer');
  const results = document.getElementById('quizResultsContainer');

  if (deckGrid) deckGrid.classList.add('hidden');
  if (results) results.classList.add('hidden');
  if (player) player.classList.remove('hidden');

  if (!isPracticeMode && currentQuiz.timeLimitMinutes) {
    startTimer(currentQuiz.timeLimitMinutes * 60);
  } else {
    clearInterval(timerInterval);
  }

  renderCurrentQuestion();
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  secondsRemaining = seconds;

  timerInterval = setInterval(() => {
    secondsRemaining--;
    const display = document.getElementById('timerDisplay');
    if (display) {
      const min = Math.floor(secondsRemaining / 60);
      const sec = secondsRemaining % 60;
      display.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      alert('⏰ Time is up! Submitting your test now.');
      showResults();
    }
  }, 1000);
}

function renderCurrentQuestion() {
  const player = document.getElementById('quizPlayerContainer');
  if (!player || !currentQuiz) return;

  const q = currentQuiz.questions[currentQuestionIdx];
  const total = currentQuiz.questions.length;
  const pct = Math.round(((currentQuestionIdx + 1) / total) * 100);
  const qType = q.type || 'mcq'; // 'mcq', 'numerical', 'flashcard', 'multi_select'
  const userAns = userAnswers[currentQuestionIdx];

  const min = Math.floor(secondsRemaining / 60);
  const sec = secondsRemaining % 60;
  const timerText = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  let answerInputMarkup = '';

  // 1. STANDARD MCQ
  if (qType === 'mcq') {
    answerInputMarkup = `
      <div class="space-y-2.5">
        ${q.options.map((opt, idx) => {
          const isSelected = userAns === idx;
          let optClass = 'w-full p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm font-mono-math flex items-center justify-between transition cursor-pointer ';

          if (isPracticeMode && userAns !== null) {
            if (idx === q.answerIndex) {
              optClass += 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
            } else if (isSelected) {
              optClass += 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-200';
            } else {
              optClass += 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60';
            }
          } else {
            if (isSelected) {
              optClass += 'bg-tagsci-800 text-white border-tagsci-600 shadow-sm font-bold';
            } else {
              optClass += 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100';
            }
          }

          return `
            <button onclick="window.App.selectQuizOption(${idx})" class="${optClass}">
              <span>${renderMathInHtml(opt)}</span>
              ${isSelected ? '<span class="text-sm font-bold ml-2">&#x2714;</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  // 2. NUMERICAL CALCULATION INPUT (with tolerance)
  else if (qType === 'numerical') {
    const isAnswered = userAns !== null;
    let numCorrect = false;
    if (isAnswered) {
      const userNum = parseFloat(userAns);
      const targetNum = parseFloat(q.correctValue);
      const tol = parseFloat(q.tolerance || '0.05');
      numCorrect = !isNaN(userNum) && Math.abs(userNum - targetNum) <= (Math.abs(targetNum) * tol + 0.01);
    }

    answerInputMarkup = `
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <input 
            type="number" 
            step="any"
            id="numericalInput" 
            placeholder="Enter calculated numerical value..." 
            value="${userAns !== null ? userAns : ''}"
            ${isPracticeMode && isAnswered ? 'disabled' : ''}
            class="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono-math text-slate-900 dark:text-white focus:ring-2 focus:ring-g11pink-400 focus:outline-none"
          />
          <button 
            onclick="window.App.submitNumericalAnswer()" 
            class="px-4 py-2.5 rounded-xl bg-tagsci-800 hover:bg-tagsci-700 active:scale-95 text-white font-bold text-xs shadow-md transition"
          >
            Check Value
          </button>
        </div>
        ${q.unit ? `<p class="text-[11px] text-slate-400 font-mono-math">Expected Unit: ${q.unit}</p>` : ''}
      </div>
    `;
  }

  // 3. FLASHCARD / FORMULA RAPID RECALL
  else if (qType === 'flashcard') {
    const flipped = userAns !== null;
    answerInputMarkup = `
      <div class="space-y-4">
        <div 
          onclick="window.App.flipFlashcard()" 
          class="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-950 dark:to-slate-900 border-2 border-dashed border-tagsci-500/50 text-center cursor-pointer hover:shadow-lg transition flex flex-col items-center justify-center min-h-[160px]"
        >
          <span class="text-[10px] font-bold uppercase tracking-wider text-g11pink-600 dark:text-g11pink-400 mb-2">
            ${flipped ? '&#x1F4A1; Formula & Answer (Back)' : '&#x1F504; Tap to Reveal Solution (Front)'}
          </span>
          <div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono-math">
            ${flipped ? renderMathInHtml(q.back) : renderMathInHtml(q.front || q.prompt)}
          </div>
        </div>

        ${flipped ? `
          <div class="flex items-center justify-center space-x-3 pt-2">
            <button onclick="window.App.rateFlashcard(false)" class="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-700 dark:text-rose-300 font-bold text-xs transition">
              🔁 Review Again
            </button>
            <button onclick="window.App.rateFlashcard(true)" class="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition">
              👍 Mastered
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Explanation Box
  let explanationMarkup = '';
  if (isPracticeMode && userAns !== null) {
    let isCorrect = false;
    if (qType === 'mcq') isCorrect = userAns === q.answerIndex;
    else if (qType === 'numerical') {
      const userNum = parseFloat(userAns);
      const targetNum = parseFloat(q.correctValue);
      const tol = parseFloat(q.tolerance || '0.05');
      isCorrect = !isNaN(userNum) && Math.abs(userNum - targetNum) <= (Math.abs(targetNum) * tol + 0.01);
    } else if (qType === 'flashcard') {
      isCorrect = userAns === true;
    }

    explanationMarkup = `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 mt-4">
        <div class="flex items-center space-x-2">
          <span class="text-base">${isCorrect ? '&#x2705;' : '&#x274C;'}</span>
          <h4 class="text-xs font-bold uppercase tracking-wider ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}">
            ${isCorrect ? 'Correct!' : 'Incorrect / Needs Review'}
          </h4>
        </div>
        <div class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono-math leading-relaxed pl-6">
          ${renderMathInHtml(q.explanation || 'No derivation provided for this item.')}
        </div>
      </div>
    `;
  }

  player.innerHTML = `
    <!-- Player Top Bar -->
    <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
      <div>
        <button onclick="window.App.exitQuiz()" class="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center space-x-1">
          <span>&larr; Exit Drill</span>
        </button>
        <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">${renderMathInHtml(currentQuiz.title)}</h2>
      </div>

      <div class="flex items-center space-x-2">
        <div class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-g11pink-100 text-g11pink-700 dark:bg-g11pink-950 dark:text-g11pink-300 border border-g11pink-300">
          ${isPracticeMode ? 'Practice Mode' : 'Timed Exam'}
        </div>
        ${!isPracticeMode && currentQuiz.timeLimitMinutes ? `
          <div class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono-math text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
            <span>&#x23F1;</span>
            <span id="timerDisplay">${timerText}</span>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="space-y-1.5">
      <div class="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Question ${currentQuestionIdx + 1} of ${total}</span>
        <span>${pct}%</span>
      </div>
      <div class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-tagsci-500 to-g11pink-500 transition-all duration-300" style="width: ${pct}%"></div>
      </div>
    </div>

    <!-- Question Card -->
    <div class="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div>
        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-tagsci-100 dark:bg-tagsci-950 text-tagsci-800 dark:text-tagsci-300">
          ${q.topic || 'General Problem'}
        </span>
        <div class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-2 leading-relaxed">
          ${renderMathInHtml(q.prompt)}
        </div>
      </div>

      <!-- Options / Answer Area -->
      ${answerInputMarkup}

      <!-- Explanation -->
      ${explanationMarkup}

      <!-- Controls -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button 
          onclick="window.App.prevQuizQuestion()" 
          ${currentQuestionIdx === 0 ? 'disabled' : ''}
          class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:pointer-events-none"
        >
          &larr; Previous
        </button>

        <button 
          onclick="window.App.nextQuizQuestion()" 
          class="px-5 py-2 rounded-xl bg-tagsci-800 hover:bg-tagsci-700 active:scale-95 text-xs font-bold text-white shadow-md transition"
        >
          ${currentQuestionIdx === total - 1 ? 'Finish Drill & Review' : 'Next Question &rarr;'}
        </button>
      </div>
    </div>
  `;
}

export function selectQuizOption(idx) {
  if (isPracticeMode && userAnswers[currentQuestionIdx] !== null) return;
  userAnswers[currentQuestionIdx] = idx;
  renderCurrentQuestion();
}

export function submitNumericalAnswer() {
  const input = document.getElementById('numericalInput');
  if (!input || !input.value.trim()) return;
  userAnswers[currentQuestionIdx] = input.value.trim();
  renderCurrentQuestion();
}

export function flipFlashcard() {
  if (userAnswers[currentQuestionIdx] === null) {
    userAnswers[currentQuestionIdx] = false;
    renderCurrentQuestion();
  }
}

export function rateFlashcard(mastered) {
  userAnswers[currentQuestionIdx] = mastered;
  renderCurrentQuestion();
}

export function prevQuizQuestion() {
  if (currentQuestionIdx > 0) {
    currentQuestionIdx--;
    renderCurrentQuestion();
  }
}

export function nextQuizQuestion() {
  if (currentQuestionIdx < currentQuiz.questions.length - 1) {
    currentQuestionIdx++;
    renderCurrentQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  clearInterval(timerInterval);
  const player = document.getElementById('quizPlayerContainer');
  const results = document.getElementById('quizResultsContainer');

  if (player) player.classList.add('hidden');
  if (results) results.classList.remove('hidden');

  let correctCount = 0;
  const total = currentQuiz.questions.length;

  const itemReviewMarkup = currentQuiz.questions.map((q, idx) => {
    const userAns = userAnswers[idx];
    const qType = q.type || 'mcq';
    let isCorrect = false;

    if (qType === 'mcq') isCorrect = userAns === q.answerIndex;
    else if (qType === 'numerical') {
      const userNum = parseFloat(userAns);
      const targetNum = parseFloat(q.correctValue);
      const tol = parseFloat(q.tolerance || '0.05');
      isCorrect = !isNaN(userNum) && Math.abs(userNum - targetNum) <= (Math.abs(targetNum) * tol + 0.01);
    } else if (qType === 'flashcard') {
      isCorrect = userAns === true;
    }

    if (isCorrect) correctCount++;

    return `
      <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border ${isCorrect ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-rose-200 dark:border-rose-900/60'} shadow-sm space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-slate-700 dark:text-slate-300">Item ${idx + 1} (${q.topic || 'General'})</span>
          <span class="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}">
            ${isCorrect ? 'Correct &#x2714;' : 'Needs Review &#x2716;'}
          </span>
        </div>
        <div class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">${renderMathInHtml(q.prompt)}</div>
        <div class="text-xs font-mono-math p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
          <p><span class="text-slate-400">Your Response:</span> ${userAns !== null ? (qType === 'mcq' ? renderMathInHtml(q.options[userAns]) : userAns) : '<span class="text-slate-400 italic">Unanswered</span>'}</p>
          ${!isCorrect && qType === 'mcq' ? `<p class="text-emerald-600 dark:text-emerald-400"><span class="text-slate-400">Correct Option:</span> ${renderMathInHtml(q.options[q.answerIndex])}</p>` : ''}
          ${!isCorrect && qType === 'numerical' ? `<p class="text-emerald-600 dark:text-emerald-400"><span class="text-slate-400">Target Value:</span> ${q.correctValue} ${q.unit || ''}</p>` : ''}
          <div class="pt-1.5 text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px]">
            <strong>Step-by-step Solution:</strong> ${renderMathInHtml(q.explanation || 'Refer to subject reviewer.')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const pct = Math.round((correctCount / total) * 100);

  results.innerHTML = `
    <div class="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center space-y-4">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-g11pink-100 dark:bg-g11pink-950 text-3xl">
        &#x1F3C6;
      </div>
      <div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Diagnostic Summary</h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">${renderMathInHtml(currentQuiz.title)}</p>
      </div>

      <div class="py-4 border-y border-slate-100 dark:border-slate-800 flex justify-center items-baseline space-x-2">
        <span class="text-4xl sm:text-5xl font-extrabold text-tagsci-700 dark:text-tagsci-400 font-mono-math">${correctCount}</span>
        <span class="text-lg text-slate-400 font-mono-math">/ ${total}</span>
        <span class="ml-3 px-3 py-1 rounded-full text-xs font-bold bg-g11pink-100 text-g11pink-700 dark:bg-g11pink-950 dark:text-g11pink-300">
          ${pct}% Score
        </span>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
        <button onclick="window.App.startQuiz('${currentQuiz.id}', ${isPracticeMode})" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-tagsci-800 hover:bg-tagsci-700 active:scale-95 text-xs font-bold text-white transition">
          &#x1F504; Retake Quiz
        </button>
        <button onclick="window.App.exitQuiz()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition">
          Back to Quiz Bank
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
        <span>&#x1F50D;</span>
        <span>Item Breakdown & Derivations</span>
      </h3>
      <div class="space-y-3">
        ${itemReviewMarkup}
      </div>
    </div>
  `;
}

export function exitQuiz() {
  clearInterval(timerInterval);
  const deckGrid = document.getElementById('quizDeckGrid');
  const player = document.getElementById('quizPlayerContainer');
  const results = document.getElementById('quizResultsContainer');

  if (player) player.classList.add('hidden');
  if (results) results.classList.add('hidden');
  if (deckGrid) deckGrid.classList.remove('hidden');
}
