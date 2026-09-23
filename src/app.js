import { renderCalendar, changeMonth, selectCalendarDate } from './components/calendar.js';
import { renderMaterials, filterMaterials, openReviewer, closeModal } from './components/reviewers.js';
import { renderTasks, addTask, toggleTask, deleteTask } from './components/tasks.js';
import { navigateSection, toggleSidebar, closeSidebar, switchMobileTab, checkResponsiveLayout, toggleTheme, initTheme } from './components/navigation.js';
import { checkOtaUpdates, saveOtaSettings, resetOtaUrl, handleClearCache, submitEditorialApplication } from './components/ota_sync.js';
import { renderMathInHtml, renderMathInElement, parseMathSyntax } from './components/math_engine.js';
import { startQuiz, selectQuizOption, submitNumericalAnswer, flipFlashcard, rateFlashcard, prevQuizQuestion, nextQuizQuestion, exitQuiz } from './components/quiz_engine.js';

// Expose public functions to window.App for inline HTML event handlers
window.App = {
  navigateSection,
  toggleSidebar,
  closeSidebar,
  changeMonth,
  selectCalendarDate,
  filterMaterials,
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
  submitNumericalAnswer,
  flipFlashcard,
  rateFlashcard,
  prevQuizQuestion,
  nextQuizQuestion,
  exitQuiz
};

window.addEventListener('resize', checkResponsiveLayout);

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCalendar();
  renderMaterials();
  renderTasks();
  checkResponsiveLayout();
});
