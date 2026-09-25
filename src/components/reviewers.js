/* =========================================================
   TagSci G11 Study WebApp - Study Vault & Reviewers Engine
   ========================================================= */

import { STEM_REVIEWERS, STUDY_MATERIALS, QUIZ_SETS, getSubjectMeta } from '../data/study_data.js';
import { renderMathInHtml } from './math_engine.js';
import { navigateSection } from './navigation.js';

let currentVaultTab = 'reviewers'; // 'reviewers' | 'materials' | 'quizzes'

export function renderTableBlock(b) {
  if (!b) return '';
  let headers = Array.isArray(b.headers) ? b.headers : [];
  let rows = Array.isArray(b.rows) ? b.rows : [];

  if (!headers.length && !rows.length && (b.markdown || b.text || b.raw)) {
    return renderMarkdownTable(b.markdown || b.text || b.raw, b.title);
  }

  return `
    <div class="my-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      ${b.title ? `<div class="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200">${renderMathInHtml(b.title)}</div>` : ''}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm border-collapse">
          ${headers.length > 0 ? `
            <thead>
              <tr class="bg-tagsci-50 dark:bg-tagsci-950/60 border-b border-slate-200 dark:border-slate-800 text-tagsci-900 dark:text-tagsci-200 font-extrabold uppercase text-[11px] tracking-wider">
                ${headers.map(h => `<th class="px-3.5 py-3 border-r last:border-r-0 border-slate-200 dark:border-slate-800">${renderMathInHtml(h || '')}</th>`).join('')}
              </tr>
            </thead>
          ` : ''}
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            ${rows.map((row, rIdx) => `
              <tr class="${rIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-950/30'} hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition">
                ${(Array.isArray(row) ? row : [row]).map(cell => `<td class="px-3.5 py-2.5 border-r last:border-r-0 border-slate-100 dark:border-slate-800 align-top">${renderMathInHtml(String(cell || ''))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderMarkdownTable(mdText, title = '') {
  if (!mdText) return '';
  const lines = mdText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const tableLines = lines.filter(l => l.startsWith('|') && l.endsWith('|'));
  if (tableLines.length === 0) return `<p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed my-2">${renderMathInHtml(mdText)}</p>`;

  let headers = [];
  let rows = [];

  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i];
    const cells = line.slice(1, -1).split('|').map(c => c.trim());
    if (cells.every(c => /^:?-+:?$/.test(c))) {
      continue;
    }
    if (headers.length === 0) {
      headers = cells;
    } else {
      rows.push(cells);
    }
  }

  return renderTableBlock({ title, headers, rows });
}

export function renderBlocksToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return '';
  
  let html = '';
  blocks.forEach(b => {
    if (b.type === 'heading') {
      const headingClass = b.level === 'h2' 
        ? 'text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-5 mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-800'
        : 'text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4 mb-1.5';
      html += `<h3 class="${headingClass}">${renderMathInHtml(b.text || '')}</h3>`;
    } else if (b.type === 'paragraph') {
      const text = b.text || '';
      if (text.includes('|') && text.split(/\r?\n/).some(l => l.trim().startsWith('|') && l.trim().endsWith('|'))) {
        html += renderMarkdownTable(text);
      } else {
        html += `<p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed my-2">${renderMathInHtml(text)}</p>`;
      }
    } else if (b.type === 'table') {
      html += renderTableBlock(b);
    } else if (b.type === 'formula') {
      html += `
        <div class="my-3 p-3.5 sm:p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
          ${b.title ? `<span class="text-[11px] font-bold text-tagsci-800 dark:text-emerald-400 block mb-1 uppercase tracking-wider">${renderMathInHtml(b.title)}</span>` : ''}
          <div class="text-center font-mono-math text-sm sm:text-base text-tagsci-950 dark:text-emerald-300 py-1 overflow-x-auto">
            ${renderMathInHtml('$$ ' + (b.formula || '') + ' $$')}
          </div>
          ${b.note ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">${renderMathInHtml(b.note)}</p>` : ''}
        </div>
      `;
    } else if (b.type === 'bullets') {
      if (b.items && Array.isArray(b.items) && b.items.length > 0) {
        html += `<ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 my-2">`;
        b.items.forEach(it => {
          html += `<li>${renderMathInHtml(it)}</li>`;
        });
        html += `</ul>`;
      }
    } else if (b.type === 'callout') {
      const isWarn = b.style === 'warning';
      const calloutClass = isWarn 
        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
      html += `
        <div class="my-3 p-3.5 rounded-xl border ${calloutClass}">
          ${b.title ? `<div class="font-bold text-xs mb-1">${renderMathInHtml(b.title)}</div>` : ''}
          <div class="text-xs leading-relaxed">${renderMathInHtml(b.text || '')}</div>
        </div>
      `;
    }
  });
  return html;
}

export function switchVaultTab(tab) {
  currentVaultTab = tab;
  updateVaultTabButtons();
  renderMaterials();
}

function updateVaultTabButtons() {
  const tabs = ['reviewers', 'materials', 'quizzes'];
  const iconEl = document.getElementById('vaultTabIcon');
  const titleEl = document.getElementById('vaultTabTitle');

  // Update badges
  const bRev = document.getElementById('badgeVault-reviewers');
  const bMat = document.getElementById('badgeVault-materials');
  const bQuiz = document.getElementById('badgeVault-quizzes');

  if (bRev) bRev.innerText = (STEM_REVIEWERS || []).length;
  if (bMat) bMat.innerText = (STUDY_MATERIALS || []).length;
  if (bQuiz) bQuiz.innerText = (QUIZ_SETS || []).length;

  tabs.forEach(t => {
    const btn = document.getElementById(`btnVaultTab-${t}`);
    if (!btn) return;
    if (t === currentVaultTab) {
      btn.className = 'flex-1 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 text-tagsci-800 dark:text-tagsci-300 shadow-sm transition flex items-center justify-center gap-1.5 font-bold';
    } else {
      btn.className = 'flex-1 py-1.5 px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center gap-1.5 font-semibold';
    }
  });

  if (currentVaultTab === 'reviewers') {
    if (iconEl) iconEl.innerHTML = '&#x1F52C;';
    if (titleEl) titleEl.innerText = 'Curated Reviewers';
  } else if (currentVaultTab === 'materials') {
    if (iconEl) iconEl.innerHTML = '&#x1F4DA;';
    if (titleEl) titleEl.innerText = 'Study Materials';
  } else if (currentVaultTab === 'quizzes') {
    if (iconEl) iconEl.innerHTML = '&#x2753;';
    if (titleEl) titleEl.innerText = 'Self-Tests & Quizzes';
  }
}

export function navigateToCurrentVaultTab() {
  if (currentVaultTab === 'reviewers') navigateSection('reviewers');
  else if (currentVaultTab === 'materials') navigateSection('materials');
  else if (currentVaultTab === 'quizzes') navigateSection('quiz_sets');
}

export function clearMaterialSearch() {
  const searchInput = document.getElementById('materialSearch');
  if (searchInput) {
    searchInput.value = '';
    filterMaterials();
  }
}

export function renderMaterials() {
  updateVaultTabButtons();
  const grid = document.getElementById('materialsGrid');
  const countLabel = document.getElementById('vaultItemCountLabel');
  const searchIndicator = document.getElementById('vaultSearchIndicator');
  const queryDisplay = document.getElementById('vaultSearchQueryDisplay');
  const searchInput = document.getElementById('materialSearch');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (!grid) return;

  if (query && searchIndicator && queryDisplay) {
    searchIndicator.classList.remove('hidden');
    searchIndicator.classList.add('flex');
    queryDisplay.innerText = `"${query}"`;
  } else if (searchIndicator) {
    searchIndicator.classList.add('hidden');
    searchIndicator.classList.remove('flex');
  }

  let sourceList = [];
  if (currentVaultTab === 'reviewers') sourceList = STEM_REVIEWERS || [];
  else if (currentVaultTab === 'materials') sourceList = STUDY_MATERIALS || [];
  else if (currentVaultTab === 'quizzes') sourceList = QUIZ_SETS || [];

  // Filter by search query
  let filtered = sourceList;
  if (query) {
    filtered = sourceList.filter(item => {
      const subj = (item.subject || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const sum = (item.summary || item.desc || '').toLowerCase();
      const tag = (item.tag || '').toLowerCase();
      return subj.includes(query) || title.includes(query) || sum.includes(query) || tag.includes(query);
    });
  }

  // Cap display at a maximum of 3 items
  const displayItems = filtered.slice(0, 3);

  if (countLabel) {
    if (filtered.length === 0) {
      countLabel.innerText = 'No matching items';
    } else {
      countLabel.innerText = `Showing ${displayItems.length} of ${filtered.length} ${currentVaultTab}`;
    }
  }

  if (displayItems.length === 0) {
    const emptyIcon = currentVaultTab === 'reviewers' ? '&#x1F52C;' : (currentVaultTab === 'materials' ? '&#x1F4DA;' : '&#x2753;');
    const emptyName = currentVaultTab === 'reviewers' ? 'reviewers' : (currentVaultTab === 'materials' ? 'study materials' : 'quiz banks');
    grid.innerHTML = `
      <div class="py-8 text-center text-slate-400 dark:text-slate-500 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4">
        <span class="text-2xl block mb-1">${emptyIcon}</span>
        <p class="text-xs font-semibold">No ${emptyName} found${query ? ' matching "' + query + '"' : ' yet'}.</p>
        <p class="text-[10.5px] text-slate-400 mt-0.5">${query ? 'Try a different subject keyword or clear the search.' : 'Items will appear here once published by the Editorial Council.'}</p>
      </div>
    `;
    return;
  }

  // Render cards according to active tab type
  if (currentVaultTab === 'reviewers' || currentVaultTab === 'materials') {
    grid.innerHTML = displayItems.map(mat => {
      const meta = getSubjectMeta(mat.subject);
      const isMat = currentVaultTab === 'materials';
      const tagLabel = mat.tag || (isMat ? 'Study Material' : meta.type);
      const borderClass = mat.color || meta.color || (isMat ? 'border-l-4 border-blue-500' : 'border-l-4 border-tagsci-600');
      const isElective = (meta.type || '').toLowerCase() === 'elective';
      const tagBadgeStyle = isElective 
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
        : (isMat 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            : 'bg-tagsci-100 text-tagsci-800 dark:bg-tagsci-950/80 dark:text-tagsci-300 border border-tagsci-200 dark:border-tagsci-800');

      const summaryText = mat.summary || mat.desc || '';

      return `
        <div class="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${borderClass} hover:shadow-md active:scale-[0.98] transition cursor-pointer flex flex-col justify-between" onclick="window.App.openReviewer('${mat.id}')">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tagBadgeStyle}">
                ${tagLabel}
              </span>
              <span class="text-xs ${isMat ? 'text-blue-600 dark:text-blue-400' : 'text-tagsci-600 dark:text-tagsci-400'} hover:underline font-semibold flex items-center gap-1">Read &rarr;</span>
            </div>
            <h3 class="text-xs font-bold text-slate-900 dark:text-white mt-1.5">${mat.subject || 'General'}</h3>
            <p class="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">${renderMathInHtml(mat.title || 'Untitled')}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${renderMathInHtml(summaryText)}</p>
          </div>
        </div>
      `;
    }).join('');
  } else if (currentVaultTab === 'quizzes') {
    grid.innerHTML = displayItems.map(q => {
      const meta = getSubjectMeta(q.subject);
      const tagLabel = q.tag || meta.type || 'Self-Test';
      const borderClass = q.color || meta.color || 'border-l-4 border-g11pink-500';
      const qCount = q.questions ? q.questions.length : 0;

      return `
        <div class="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${borderClass} hover:shadow-md active:scale-[0.98] transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-g11pink-100 text-g11pink-800 dark:bg-g11pink-950/80 dark:text-g11pink-300 border border-g11pink-200 dark:border-g11pink-900">
                ${tagLabel}
              </span>
              <span class="text-xs text-slate-400 font-mono-math">${qCount} Qs</span>
            </div>
            <h3 class="text-xs font-bold text-slate-900 dark:text-white mt-1.5">${q.subject || 'General'}</h3>
            <p class="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">${renderMathInHtml(q.title || 'Untitled Quiz')}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${renderMathInHtml(q.desc || '')}</p>
          </div>
          <div class="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-1.5">
            <button onclick="window.App.navigateSection('quiz_sets'); window.App.startQuiz('${q.id}', true);" class="flex-1 py-1 rounded-lg bg-tagsci-100 dark:bg-tagsci-950 hover:bg-tagsci-200 text-tagsci-800 dark:text-tagsci-300 font-bold text-[10.5px] transition text-center border border-tagsci-300 dark:border-tagsci-800">
              ⚡ Practice
            </button>
            <button onclick="window.App.navigateSection('quiz_sets'); window.App.startQuiz('${q.id}', false);" class="flex-1 py-1 rounded-lg bg-tagsci-800 hover:bg-tagsci-700 active:scale-95 text-white font-bold text-[10.5px] transition shadow-sm text-center">
              ⏱️ Timed
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

export function filterMaterials() {
  renderMaterials();
}

export function openReviewer(id) {
  const item = (STEM_REVIEWERS || []).find(m => m.id === id) || (STUDY_MATERIALS || []).find(m => m.id === id);
  if (!item) return;

  const modalBadge = document.getElementById('modalSubjectBadge');
  const modalTitle = document.getElementById('modalTopicTitle');
  const modalContent = document.getElementById('modalContent');
  const modal = document.getElementById('reviewerModal');

  if (modalBadge) modalBadge.textContent = item.subject || 'STEM';
  if (modalTitle) modalTitle.innerHTML = renderMathInHtml(item.title || '');
  
  let finalHtml = '';
  if (item.blocks && Array.isArray(item.blocks) && item.blocks.length > 0) {
    finalHtml = renderBlocksToHtml(item.blocks);
  } else if (item.content) {
    finalHtml = renderMathInHtml(item.content);
  } else if (item.rawMarkdown) {
    finalHtml = renderMathInHtml(item.rawMarkdown.replace(/\n/g, '<br>'));
  } else if (item.desc) {
    finalHtml = `<p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${renderMathInHtml(item.desc)}</p>${item.link ? `<div class="mt-4"><a href="${item.link}" target="_blank" class="px-4 py-2 bg-tagsci-800 text-white rounded-xl text-xs font-bold inline-block hover:bg-tagsci-700">Open External Resource &rarr;</a></div>` : ''}`;
  } else {
    finalHtml = `<p class="text-xs text-slate-400 italic">No content available in this material draft.</p>`;
  }

  if (modalContent) modalContent.innerHTML = finalHtml;
  if (modal) modal.classList.remove('hidden');
}

export function closeModal() {
  const modal = document.getElementById('reviewerModal');
  if (modal) modal.classList.add('hidden');
}

if (typeof window !== 'undefined') {
  window.openReviewer = openReviewer;
  window.closeModal = closeModal;
}
