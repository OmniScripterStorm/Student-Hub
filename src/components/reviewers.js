import { STEM_REVIEWERS, getSubjectMeta } from '../data/study_data.js';
import { renderMathInHtml } from './math_engine.js';

export function renderMaterials(items = STEM_REVIEWERS) {
  const grid = document.getElementById('materialsGrid');
  if (!grid) return;

  if (items.length === 0) {
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
          <p class="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">${renderMathInHtml(mat.title)}</p>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${renderMathInHtml(mat.summary)}</p>
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
    m.subject.toLowerCase().includes(query) ||
    m.title.toLowerCase().includes(query) ||
    m.summary.toLowerCase().includes(query) ||
    m.tag.toLowerCase().includes(query)
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
  if (modalTitle) modalTitle.innerHTML = renderMathInHtml(item.title);
  if (modalContent) modalContent.innerHTML = renderMathInHtml(item.content);
  if (modal) modal.classList.remove('hidden');
}

export function closeModal() {
  const modal = document.getElementById('reviewerModal');
  if (modal) modal.classList.add('hidden');
}
