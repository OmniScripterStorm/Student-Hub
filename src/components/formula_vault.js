/* =========================================================
   TagSci G11 Study WebApp - Formula Vault Component
   Aggregates mathematical equations & scientific laws across:
   - STEM Reviewers (stemReviewers)
   - Study Materials (studyMaterials)
   Supports:
   - Instant Search & Multi-Subject Filter Pills
   - Pin / Star Favorite Equations (localStorage)
   - Direct Jump to Topic in Reviewer
   - One-Tap LaTeX Copy to Clipboard
   - Print-Ready Formula Sheet Mode
   ========================================================= */

import { STEM_REVIEWERS, STUDY_MATERIALS, getSubjectMeta } from '../data/study_data.js';
import { renderMathInHtml } from './math_engine.js';
import { openReviewer } from './reviewers.js';
import { navigateSection } from './navigation.js';

const STORAGE_PINNED_FORMULAS = 'tagsci_pinned_formulas';

let activeSubjectFilter = 'all';
let formulaSearchQuery = '';
let showOnlyPinned = false;

function getPinnedFormulaIds() {
  try {
    const raw = localStorage.getItem(STORAGE_PINNED_FORMULAS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function togglePinFormula(formulaId) {
  let pinned = getPinnedFormulaIds();
  if (pinned.includes(formulaId)) {
    pinned = pinned.filter(id => id !== formulaId);
  } else {
    pinned.push(formulaId);
  }
  try {
    localStorage.setItem(STORAGE_PINNED_FORMULAS, JSON.stringify(pinned));
  } catch (e) {
    console.warn('Could not save pinned formula:', e);
  }
  renderFormulaVaultView();
}

export function copyFormulaTeX(formulaIdOrTex, btnElement) {
  let tex = formulaIdOrTex;
  try {
    const list = aggregateAllFormulas();
    const item = list.find(f => f.id === formulaIdOrTex);
    if (item && item.formula) tex = item.formula;
  } catch (e) {}

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(tex).then(() => {
      if (btnElement) {
        const orig = btnElement.innerHTML;
        btnElement.innerHTML = '<span>&#x2714;</span> <span>Copied!</span>';
        setTimeout(() => { btnElement.innerHTML = orig; }, 1500);
      }
    }).catch(() => {
      prompt('Copy LaTeX Formula:', tex);
    });
  } else {
    prompt('Copy LaTeX Formula:', tex);
  }
}

export function aggregateAllFormulas() {
  const formulas = [];
  const seenKeys = new Set();

  function processBlocks(blocks, parentItem, sourceKind) {
    if (!blocks || !Array.isArray(blocks)) return;
    blocks.forEach((b, idx) => {
      if (b.type === 'formula' && b.formula) {
        const key = `${parentItem.subject}::${b.title || ''}::${b.formula}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          formulas.push({
            id: `f_${parentItem.id}_${idx}`,
            parentId: parentItem.id,
            sourceKind: sourceKind,
            parentTitle: parentItem.title || 'Untitled',
            subject: parentItem.subject || 'STEM',
            title: b.title || 'Mathematical Formula',
            formula: b.formula,
            note: b.note || ''
          });
        }
      }
    });
  }

  (STEM_REVIEWERS || []).forEach(r => processBlocks(r.blocks, r, 'Reviewer'));
  (STUDY_MATERIALS || []).forEach(m => processBlocks(m.blocks, m, 'Study Material'));

  return formulas;
}

export function setFormulaSubjectFilter(subj) {
  activeSubjectFilter = subj;
  renderFormulaVaultView();
}

export function setFormulaSearchQuery(query) {
  formulaSearchQuery = (query || '').toLowerCase().trim();
  renderFormulaVaultView();
}

export function togglePinnedOnlyFilter() {
  showOnlyPinned = !showOnlyPinned;
  renderFormulaVaultView();
}

export function jumpToFormulaContext(parentId) {
  openReviewer(parentId);
}

export function printFormulaSheet() {
  window.print();
}

export function renderFormulaVaultView() {
  const container = document.getElementById('formulaVaultContainer') || document.getElementById('viewSection-formulas');
  if (!container) return;

  const allFormulas = aggregateAllFormulas();
  const pinnedIds = getPinnedFormulaIds();

  // Extract unique subjects with formula counts
  const subjectCounts = {};
  allFormulas.forEach(f => {
    subjectCounts[f.subject] = (subjectCounts[f.subject] || 0) + 1;
  });
  const subjects = Object.keys(subjectCounts).sort();

  // Apply filters
  let filtered = allFormulas.filter(f => {
    if (activeSubjectFilter !== 'all' && f.subject !== activeSubjectFilter) return false;
    if (showOnlyPinned && !pinnedIds.includes(f.id)) return false;
    if (formulaSearchQuery) {
      const matchTitle = (f.title || '').toLowerCase().includes(formulaSearchQuery);
      const matchFormula = (f.formula || '').toLowerCase().includes(formulaSearchQuery);
      const matchNote = (f.note || '').toLowerCase().includes(formulaSearchQuery);
      const matchSource = (f.parentTitle || '').toLowerCase().includes(formulaSearchQuery);
      const matchSubject = (f.subject || '').toLowerCase().includes(formulaSearchQuery);
      return matchTitle || matchFormula || matchNote || matchSource || matchSubject;
    }
    return true;
  });

  const pinnedCount = allFormulas.filter(f => pinnedIds.includes(f.id)).length;

  container.innerHTML = `
    <!-- Header Controls & Search Bar -->
    <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>&#x1F4D0;</span>
            <span>STEM Formula Vault</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quick-reference index of equations, laws, and definitions across Grade 11 modules
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button onclick="window.App.printFormulaSheet()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5" title="Print a physical formula cheat-sheet">
            <span>&#x1F5A8;&#xFE0F;</span>
            <span class="hidden sm:inline">Print Sheet</span>
          </button>
          <button onclick="window.App.togglePinnedOnlyFilter()" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${showOnlyPinned ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}">
            <span>&#x2B50;</span>
            <span>Starred (${pinnedCount})</span>
          </button>
        </div>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">&#x1F50D;</span>
        <input 
          type="text" 
          value="${formulaSearchQuery}"
          oninput="window.App.setFormulaSearchQuery(this.value)"
          placeholder="Search equations, variables (e.g. torque, tau, nCr, momentum, dipole)..."
          class="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-tagsci-500 text-slate-900 dark:text-white"
        />
        ${formulaSearchQuery ? `
          <button onclick="window.App.setFormulaSearchQuery('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            &#x2715;
          </button>
        ` : ''}
      </div>

      <!-- Subject Filter Pills -->
      <div class="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <button 
          onclick="window.App.setFormulaSubjectFilter('all')" 
          class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${activeSubjectFilter === 'all' ? 'bg-tagsci-800 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}"
        >
          All Subjects (${allFormulas.length})
        </button>
        ${subjects.map(s => `
          <button 
            onclick="window.App.setFormulaSubjectFilter('${s}')" 
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${activeSubjectFilter === s ? 'bg-tagsci-800 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}"
          >
            ${s} (${subjectCounts[s]})
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Formula Cards Grid -->
    ${filtered.length === 0 ? `
      <div class="py-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <span class="text-3xl block mb-2">&#x1F4D0;</span>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">No Formulas Match Your Filter</h4>
        <p class="text-xs text-slate-400 mt-1">Try clearing your search query or switching subject categories.</p>
      </div>
    ` : `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${filtered.map(f => {
          const isPinned = pinnedIds.includes(f.id);
          const meta = getSubjectMeta(f.subject);
          return `
            <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${meta.color || 'border-l-4 border-tagsci-600'} shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-3">
              <div>
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.badgeClass || 'bg-slate-100 text-slate-700'}">
                      ${f.subject}
                    </span>
                    <span class="text-[10px] text-slate-400 truncate max-w-[180px]">
                      ${f.parentTitle}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-1">
                    <button 
                      onclick="window.App.togglePinFormula('${f.id}')" 
                      class="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition ${isPinned ? 'text-amber-500' : ''}" 
                      title="${isPinned ? 'Unstar formula' : 'Star formula'}"
                    >
                      <span>${isPinned ? '&#x2B50;' : '&#x2606;'}</span>
                    </button>
                    <button 
                      onclick="window.App.copyFormulaTeX('${f.id}', this)" 
                      class="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition flex items-center gap-1" 
                      title="Copy raw LaTeX code"
                    >
                      <span>&#x1F4CB;</span>
                      <span>TeX</span>
                    </button>
                  </div>
                </div>

                <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-2">
                  ${renderMathInHtml(f.title)}
                </h3>

                <!-- Big Formula Display Box -->
                <div class="mt-2.5 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-center overflow-x-auto text-base sm:text-lg font-bold font-mono-math text-slate-900 dark:text-emerald-400">
                  ${renderMathInHtml(`$$${f.formula}$$`)}
                </div>

                <!-- Formula Variable Breakdown & Notes -->
                ${f.note ? `
                  <div class="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-amber-50/50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-amber-100/60 dark:border-slate-800">
                    <span class="font-bold text-[10px] uppercase text-amber-700 dark:text-amber-400 block mb-0.5">Note / Breakdown:</span>
                    ${renderMathInHtml(f.note)}
                  </div>
                ` : ''}
              </div>

              <!-- Jump to source topic -->
              <div class="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                <button 
                  onclick="window.App.jumpToFormulaContext('${f.parentId}')" 
                  class="font-semibold text-tagsci-700 dark:text-tagsci-400 hover:underline flex items-center gap-1"
                >
                  <span>&#x1F4D6;</span>
                  <span>View in ${f.sourceKind}</span>
                </button>
                <span class="text-slate-400 text-[10px]">TagSci STEM</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}
