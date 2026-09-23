import { STEM_REVIEWERS, STUDY_MATERIALS, PROBLEM_SETS, QUIZ_SETS, EDITORIAL_CREDITS, getSyncUrl, CURRENT_APP_VERSION } from '../data/study_data.js';
import { renderQuizSetsView } from './quiz_engine.js';

let currentSection = 'overview'; // overview, materials, reviewers, problem_sets, quiz_sets, credits, settings

export function navigateSection(sectionId) {
  currentSection = sectionId;

  // Update Sidebar active indicators
  const navItems = ['overview', 'materials', 'reviewers', 'problem_sets', 'quiz_sets', 'credits', 'settings'];
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
  if (sectionId === 'problem_sets') renderProblemSetsView();
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

function renderMaterialsView() {
  const container = document.getElementById('materialsListContainer');
  if (!container) return;

  if (STUDY_MATERIALS.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <span class="text-3xl block mb-2">&#x1F4DA;</span>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">No Study Materials Published Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Lecture slides, syllabus guides, and formula sheets will be uploaded here.</p>
      </div>
    `;
  }
}

function renderReviewersView() {
  const container = document.getElementById('reviewersListContainer');
  if (!container) return;

  if (STEM_REVIEWERS.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <span class="text-3xl block mb-2">&#x1F52C;</span>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">No Curated Reviewers Published Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Curated reviewer modules from the Editorial Council will appear here.</p>
      </div>
    `;
  }
}

function renderProblemSetsView() {
  const container = document.getElementById('problemSetsListContainer');
  if (!container) return;

  if (PROBLEM_SETS.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <span class="text-3xl block mb-2">&#x1F4DD;</span>
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">No Problem Sets Published Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Practice drills and step-by-step problem sets will be provided here.</p>
      </div>
    `;
  }
}

function renderCreditsView() {
  const container = document.getElementById('creditsListContainer');
  if (!container) return;

  container.innerHTML = EDITORIAL_CREDITS.map(c => `
    <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between space-x-3">
      <div>
        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-g11pink-100 text-g11pink-700 dark:bg-g11pink-950 dark:text-g11pink-300">
          ${c.badge}
        </span>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mt-2">${c.name}</h3>
        <p class="text-xs font-semibold text-tagsci-700 dark:text-tagsci-400 mt-0.5">${c.role}</p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${c.title}</p>
      </div>
      <div class="w-10 h-10 rounded-xl bg-tagsci-50 dark:bg-tagsci-950 border border-tagsci-200 dark:border-tagsci-800 flex items-center justify-center text-tagsci-700 dark:text-tagsci-300 font-bold text-base flex-shrink-0">
        &#x1F393;
      </div>
    </div>
  `).join('');
}

function renderSettingsView() {
  const input = document.getElementById('otaUrlInput');
  if (input) {
    input.value = getSyncUrl();
  }
  const verDisplay = document.getElementById('settingsVersionDisplay');
  if (verDisplay) {
    verDisplay.textContent = `Current Active Data: v${CURRENT_APP_VERSION}`;
  }
}
