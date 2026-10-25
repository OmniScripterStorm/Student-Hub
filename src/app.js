import { 
  renderFormulaVaultView,
  setFormulaSubjectFilter,
  setFormulaSearchQuery,
  togglePinFormula,
  togglePinnedOnlyFilter,
  copyFormulaTeX,
  jumpToFormulaContext,
  printFormulaSheet
} from './components/formula_vault.js';
/* =========================================================
   TagSci G11 Study WebApp - Main Bootstrap
   ========================================================= */

import { renderCalendar, changeMonth, selectCalendarDate } from './components/calendar.js';
import { renderMaterials, filterMaterials, switchVaultTab, navigateToCurrentVaultTab, clearMaterialSearch, openReviewer, closeModal } from './components/reviewers.js';
import { renderTasks, addTask, toggleTask, deleteTask } from './components/tasks.js';
import { navigateSection, toggleSidebar, closeSidebar, switchMobileTab, checkResponsiveLayout, toggleTheme, initTheme } from './components/navigation.js';
import { checkOtaUpdates, initAutoSyncEngine, saveOtaSettings, resetOtaUrl, handleClearCache, submitEditorialApplication } from './components/ota_sync.js';
import { renderMathInHtml, renderMathInElement, parseMathSyntax } from './components/math_engine.js';
import { 
  renderFlashcardsView,
  startFlashcardSession,
  flipFlashcard,
  toggleFlashcardHint,
  rateFlashcard,
  prevFlashcard,
  nextFlashcard,
  shuffleCurrentDeck,
  exitFlashcardSession
} from './components/quiz_engine.js';
import { initPwaInstallPrompt, triggerPwaInstall, dismissPwaPrompt, manualTriggerPwaPrompt, updateSettingsPwaStatus } from './components/pwa_installer.js';
import { 
  initBackgroundEngine, 
  requestNotificationPermission, 
  triggerTestNotification, 
  updateBackgroundSettingsUI, 
  checkUpcomingDeadlinesAndNotify, 
  registerPeriodicBackgroundSync 
} from './components/background_engine.js';

// Expose public functions to window.App for inline HTML event handlers
import { saveSyncedData } from './data/study_data.js';

// Expose public functions to window.App for inline HTML event handlers
window.App = {
  renderFormulaVaultView,
  setFormulaSubjectFilter,
  setFormulaSearchQuery,
  togglePinFormula,
  togglePinnedOnlyFilter,
  copyFormulaTeX,
  jumpToFormulaContext,
  printFormulaSheet,
  saveSyncedData,
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
  initAutoSyncEngine,
  saveOtaSettings,
  resetOtaUrl,
  handleClearCache,
  submitEditorialApplication,
  renderMathInHtml,
  renderMathInElement,
  parseMathSyntax,
  renderFlashcardsView,
  startFlashcardSession,
  flipFlashcard,
  toggleFlashcardHint,
  rateFlashcard,
  prevFlashcard,
  nextFlashcard,
  shuffleCurrentDeck,
  exitFlashcardSession,
  // Backwards compatibility aliases
  renderQuizSetsView: renderFlashcardsView,
  startQuiz: (id) => startFlashcardSession(id, 'all'),
  exitQuiz: exitFlashcardSession,
  triggerPwaInstall,
  dismissPwaPrompt,
  manualTriggerPwaPrompt,
  updateSettingsPwaStatus,
  requestNotificationPermission,
  triggerTestNotification,
  updateBackgroundSettingsUI,
  checkUpcomingDeadlinesAndNotify,
  registerPeriodicBackgroundSync
};

window.addEventListener('resize', checkResponsiveLayout);

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCalendar();
  renderMaterials();
  renderTasks();
  checkResponsiveLayout();

  // 1. Initialize PWA First-Launch Install Prompt
  initPwaInstallPrompt();

  // 2. Initialize Automatic Real-Time OTA Sync Engine (Instant on network + periodic poller)
  initAutoSyncEngine(15);

  // 3. Initialize Background Systems & Deadline Reminder Engine
  initBackgroundEngine();
});
