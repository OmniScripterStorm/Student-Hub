/* =========================================================
   TagSci G11 Study WebApp - Main Bootstrap
   ========================================================= */

import { renderCalendar, changeMonth, selectCalendarDate } from './components/calendar.js';
import { renderMaterials, filterMaterials, switchVaultTab, navigateToCurrentVaultTab, clearMaterialSearch, openReviewer, closeModal } from './components/reviewers.js';
import { renderTasks, addTask, toggleTask, deleteTask } from './components/tasks.js';
import { navigateSection, toggleSidebar, closeSidebar, switchMobileTab, checkResponsiveLayout, toggleTheme, initTheme } from './components/navigation.js';
import { checkOtaUpdates, saveOtaSettings, resetOtaUrl, handleClearCache, submitEditorialApplication } from './components/ota_sync.js';
import { renderMathInHtml, renderMathInElement, parseMathSyntax } from './components/math_engine.js';
import { 
  startQuiz, 
  selectQuizOption, 
  selectTrueFalse, 
  submitIdentificationAnswer, 
  toggleMultiSelectOption, 
  submitMultiSelectAnswer, 
  submitNumericalAnswer, 
  flipFlashcard, 
  rateFlashcard, 
  prevQuizQuestion, 
  nextQuizQuestion, 
  exitQuiz 
} from './components/quiz_engine.js';
import { initPwaInstallPrompt, triggerPwaInstall, dismissPwaPrompt } from './components/pwa_installer.js';

// Expose public functions to window.App for inline HTML event handlers
window.App = {
  navigateSection,
  toggleSidebar,
  closeSidebar,
  changeMonth,
  selectCalendarDate,
  filterMaterials,
  switchVaultTab,
  navigateToCurrentVaultTab,
  clearMaterialSearch,
  openReviewer,
  closeModal,
  addTask,
  toggleTask,
  deleteTask,
  switchMobileTab,
  toggleTheme,
  checkOtaUpdates,
  saveOtaSettings,
  resetOtaUrl,
  handleClearCache,
  submitEditorialApplication,
  renderMathInHtml,
  renderMathInElement,
  parseMathSyntax,
  startQuiz,
  selectQuizOption,
  selectTrueFalse,
  submitIdentificationAnswer,
  toggleMultiSelectOption,
  submitMultiSelectAnswer,
  submitNumericalAnswer,
  flipFlashcard,
  rateFlashcard,
  prevQuizQuestion,
  nextQuizQuestion,
  exitQuiz,
  triggerPwaInstall,
  dismissPwaPrompt
};

window.addEventListener('resize', checkResponsiveLayout);

// Auto-sync when coming online
window.addEventListener('online', () => {
  console.log('Network connected: Running background curriculum sync...');
  checkOtaUpdates(true);
});

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCalendar();
  renderMaterials();
  renderTasks();
  checkResponsiveLayout();

  // 1. Initialize PWA First-Launch Install Prompt
  initPwaInstallPrompt();

  // 2. Auto-Update on Launch (Silent background sync if online)
  if (navigator.onLine) {
    setTimeout(() => {
      checkOtaUpdates(true);
    }, 1200);
  }
});
