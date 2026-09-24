/* =========================================================
   TagSci G11 Study WebApp - Curated Reviewers Engine
   ========================================================= */

import { STEM_REVIEWERS, getSubjectMeta } from '../data/study_data.js';
import { renderMathInHtml } from './math_engine.js';

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
      html += `<p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed my-2">${renderMathInHtml(b.text || '')}</p>`;
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

export function renderMaterials(items = STEM_REVIEWERS) {
  const grid = document.getElementById('materialsGrid');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-8 text-center text-slate-400 dark:text-slate-500 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <span class="text-2xl block mb-1">&#x1F4DA;</span>
        <p class="text-xs font-semibold">No study reviewers published yet.</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Reviewer modules will appear here once pushed by G11 Council.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(mat => {
    const meta = getSubjectMeta(mat.subject);
    const tagLabel = (mat.tag && (mat.tag.toLowerCase() === 'main' || mat.tag.toLowerCase() === 'elective')) 
      ? mat.tag 
      : meta.type;
    const borderClass = mat.color || meta.color;
    const isElective = tagLabel.toLowerCase() === 'elective';
    const tagBadgeStyle = isElective 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
      : 'bg-tagsci-100 text-tagsci-800 dark:bg-tagsci-950/80 dark:text-tagsci-300 border border-tagsci-200 dark:border-tagsci-800';

    return `
      <div class="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${borderClass} hover:shadow-md active:scale-[0.98] transition cursor-pointer flex flex-col justify-between" onclick="window.App.openReviewer('${mat.id}')">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tagBadgeStyle}">
              ${tagLabel}
            </span>
            <span class="text-xs text-tagsci-600 dark:text-tagsci-400 hover:underline font-semibold">View &rarr;</span>
          </div>
          <h3 class="text-xs font-bold text-slate-900 dark:text-white mt-1.5">${mat.subject}</h3>
          <p class="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">${renderMathInHtml(mat.title || 'Untitled')}</p>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${renderMathInHtml(mat.summary || '')}</p>
        </div>
      </div>
    `;
  }).join('');
}

export function filterMaterials() {
  const searchInput = document.getElementById('materialSearch');
  if (!searchInput) return;

  const query = searchInput.value.toLowerCase();
  const filtered = STEM_REVIEWERS.filter(m => 
    (m.subject || '').toLowerCase().includes(query) ||
    (m.title || '').toLowerCase().includes(query) ||
    (m.summary || '').toLowerCase().includes(query) ||
    (m.tag || '').toLowerCase().includes(query)
  );
  renderMaterials(filtered);
}

export function openReviewer(id) {
  const item = STEM_REVIEWERS.find(m => m.id === id);
  if (!item) return;

  const modalBadge = document.getElementById('modalSubjectBadge');
  const modalTitle = document.getElementById('modalTopicTitle');
  const modalContent = document.getElementById('modalContent');
  const modal = document.getElementById('reviewerModal');

  if (modalBadge) modalBadge.textContent = item.subject;
  if (modalTitle) modalTitle.innerHTML = renderMathInHtml(item.title || '');
  
  let finalHtml = '';
  if (item.blocks && Array.isArray(item.blocks) && item.blocks.length > 0) {
    finalHtml = renderBlocksToHtml(item.blocks);
  } else if (item.content) {
    finalHtml = renderMathInHtml(item.content);
  } else if (item.rawMarkdown) {
    finalHtml = renderMathInHtml(item.rawMarkdown.replace(/\n/g, '<br>'));
  } else {
    finalHtml = `<p class="text-xs text-slate-400 italic">No content available in this reviewer draft.</p>`;
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
