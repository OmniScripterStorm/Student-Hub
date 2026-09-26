import { STEM_REVIEWERS, STUDY_MATERIALS, QUIZ_SETS, getCachedCreditsMarkdown, saveCachedCreditsMarkdown, DEFAULT_CREDITS_URL, getSyncUrl, CURRENT_APP_VERSION, getSubjectMeta } from '../data/study_data.js';
import { renderMathInHtml } from './math_engine.js';
import { renderQuizSetsView } from './quiz_engine.js';
import { updateSettingsPwaStatus } from './pwa_installer.js';

let currentSection = 'overview'; // overview, materials, reviewers, quiz_sets, credits, settings

export function getCurrentSection() {
  return currentSection;
}

export function navigateSection(sectionId) {
  currentSection = sectionId;

  // Update Sidebar active indicators
  const navItems = ['overview', 'materials', 'reviewers', 'quiz_sets', 'credits', 'settings'];
  navItems.forEach(item => {
    const el = document.getElementById(`navItem-${item}`);
    if (el) {
      if (item === sectionId) {
        el.className = 'w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-tagsci-800 text-white font-bold shadow-sm transition';
      } else {
        el.className = 'w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium';
      }
    }
  });

  // Hide all sections, show active section
  navItems.forEach(item => {
    const sec = document.getElementById(`viewSection-${item}`);
    if (sec) {
      if (item === sectionId) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    }
  });

  // Render content for dynamic views
  if (sectionId === 'materials') renderMaterialsView();
  if (sectionId === 'reviewers') renderReviewersView();
  if (sectionId === 'quiz_sets') renderQuizSetsView();
  if (sectionId === 'credits') renderCreditsView();
  if (sectionId === 'settings') renderSettingsView();

  // On mobile, auto close sidebar after selection
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
}

export function toggleSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;

  const isClosed = sidebar.classList.contains('-translate-x-full');
  if (isClosed) {
    sidebar.classList.remove('-translate-x-full');
    if (overlay) overlay.classList.remove('hidden');
  } else {
    closeSidebar();
  }
}

export function closeSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.add('-translate-x-full');
  if (overlay) overlay.classList.add('hidden');
}

export function switchMobileTab(tab) {
  navigateSection(tab);
}

export function checkResponsiveLayout() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (window.innerWidth >= 1024) {
    if (sidebar) sidebar.classList.remove('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
  } else {
    if (sidebar) sidebar.classList.add('-translate-x-full');
  }
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('tagsci_theme', isDark ? 'dark' : 'light');
}

export function initTheme() {
  const saved = localStorage.getItem('tagsci_theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

/* =========================================================
   DYNAMIC VIEW RENDERERS
   ========================================================= */

export function renderMaterialsView() {
  const container = document.getElementById('materialsListContainer');
  if (!container) return;

  if (!STUDY_MATERIALS || STUDY_MATERIALS.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <span class="text-3xl block mb-2">&#x1F4DA;</span>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">No Study Materials Published Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Lecture slides, syllabus guides, formula sheets, and study modules will appear here once synced.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      ${STUDY_MATERIALS.map(m => {
        const meta = getSubjectMeta(m.subject);
        const tagLabel = m.tag || 'Study Material';
        const borderClass = m.color || meta.color || 'border-l-4 border-blue-500';
        const isElective = (meta.type || '').toLowerCase() === 'elective';
        const tagBadgeStyle = isElective 
          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800';

        const summaryText = m.summary || m.desc || '';

        return `
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${borderClass} hover:shadow-md active:scale-[0.98] transition cursor-pointer flex flex-col justify-between" onclick="window.App.openReviewer('${m.id}')">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tagBadgeStyle}">
                  ${tagLabel}
                </span>
                <span class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1">Read &rarr;</span>
              </div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">${m.subject || 'General'}</span>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">${renderMathInHtml(m.title || 'Untitled Material')}</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">${renderMathInHtml(summaryText)}</p>
            </div>
            <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Study Resource</span>
              <span class="font-bold text-blue-600 dark:text-blue-400">Open Material &rarr;</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderReviewersView() {
  const container = document.getElementById('reviewersListContainer');
  if (!container) return;

  if (!STEM_REVIEWERS || STEM_REVIEWERS.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <span class="text-3xl block mb-2">&#x1F52C;</span>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">No Curated Reviewers Published Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Curated reviewer modules from the Editorial Council will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      ${STEM_REVIEWERS.map(mat => {
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
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${borderClass} hover:shadow-md active:scale-[0.98] transition cursor-pointer flex flex-col justify-between" onclick="window.App.openReviewer('${mat.id}')">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tagBadgeStyle}">
                  ${tagLabel}
                </span>
                <span class="text-xs text-tagsci-600 dark:text-tagsci-400 hover:underline font-semibold flex items-center gap-1">Read &rarr;</span>
              </div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">${mat.subject}</span>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">${renderMathInHtml(mat.title || 'Untitled')}</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">${renderMathInHtml(mat.summary || '')}</p>
            </div>
            <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Reviewer Module</span>
              <span class="font-bold text-tagsci-700 dark:text-tagsci-400">Open Module &rarr;</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function parseAndRenderCreditsMarkdown(mdText) {
  if (!mdText) return '';
  const lines = mdText.split(/\r?\n/);
  let html = '';
  let inList = false;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    if (line.startsWith('#')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#+\s*/, '').trim();
      html += `<h${level}>${text}</h${level}>`;
    } else if (line.startsWith('-') || line.startsWith('*')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      const rawItem = line.replace(/^[-*]\s*/, '').trim();
      let name = '';
      let role = '';

      const boldMatch = rawItem.match(/^\*\*(.*?)\*\*\s*(?:—|–|-|\||:)\s*(.*)$/);
      if (boldMatch) {
        name = boldMatch[1].trim();
        role = boldMatch[2].trim();
      } else {
        const parts = rawItem.split(/—|–|-|\||:/);
        name = parts[0].replace(/\*\*/g, '').trim();
        role = parts.slice(1).join(' — ').replace(/\*\*/g, '').trim();
      }

      html += `
        <li>
          <span class="member-name">${name}</span>
          ${role ? `<span class="member-role">${role}</span>` : ''}
        </li>
      `;
    } else if (line.startsWith('>')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const quote = line.replace(/^>+\s*/, '').trim();
      html += `<blockquote>${quote}</blockquote>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p class="text-sm my-2 text-slate-600 dark:text-slate-300">${line}</p>`;
    }
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}

export async function renderCreditsView() {
  const container = document.getElementById('creditsMarkdownContainer');
  if (!container) return;

  const cachedMd = getCachedCreditsMarkdown();
  container.innerHTML = parseAndRenderCreditsMarkdown(cachedMd);

  if (navigator.onLine) {
    try {
      const endpoints = ['./credits.md', DEFAULT_CREDITS_URL];
      for (const url of endpoints) {
        try {
          const res = await fetch(url + '?_t=' + Date.now(), { cache: 'no-cache' });
          if (res.ok) {
            const text = await res.text();
            if (text && text.trim().length > 0 && text !== cachedMd) {
              saveCachedCreditsMarkdown(text);
              container.innerHTML = parseAndRenderCreditsMarkdown(text);
              break;
            }
          }
        } catch (e) {
          // ignore individual fetch errors
        }
      }
    } catch (err) {
      console.log('Background credits sync skipped:', err);
    }
  }
}

export function renderSettingsView() {
  const input = document.getElementById('otaUrlInput');
  if (input) {
    input.value = getSyncUrl();
  }
  const verDisplay = document.getElementById('settingsVersionDisplay');
  if (verDisplay) {
    verDisplay.textContent = `Current Active Data: v${CURRENT_APP_VERSION}`;
  }
  if (typeof updateSettingsPwaStatus === 'function') {
    updateSettingsPwaStatus();
  }
}
