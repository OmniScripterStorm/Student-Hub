/* =========================================================
   TagSci G11 Study WebApp - Data Store & Local Cache Engine
   ========================================================= */

const CACHE_KEY = 'tagsci_g11_study_cache';
const SYNC_URL_KEY = 'tagsci_g11_sync_url';

export const DEFAULT_OTA_URL = 'https://omniscripterstorm.github.io/Student-Hub/updates.json';

export const SUBJECTS = [
  { name: 'TagSci', type: 'Institutional', color: 'border-l-4 border-tagsci-700', badgeClass: 'bg-tagsci-100 text-tagsci-800 dark:bg-tagsci-950 dark:text-tagsci-300' },
  { name: 'DepEd', type: 'DepEd', color: 'border-l-4 border-blue-600', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { name: 'Effective Communications', type: 'Main', color: 'border-l-4 border-blue-500', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { name: 'Mabisang Komunikasyon', type: 'Main', color: 'border-l-4 border-amber-500', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  { name: 'Life and Career Skills', type: 'Main', color: 'border-l-4 border-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  { name: 'General Math', type: 'Main', color: 'border-l-4 border-g11pink-500', badgeClass: 'bg-g11pink-100 text-g11pink-800 dark:bg-g11pink-950 dark:text-g11pink-300' },
  { name: 'General Science', type: 'Main', color: 'border-l-4 border-teal-500', badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  { name: 'Finite Math', type: 'Elective', color: 'border-l-4 border-purple-500', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  { name: 'Physics', type: 'Elective', color: 'border-l-4 border-tagsci-600', badgeClass: 'bg-tagsci-100 text-tagsci-800 dark:bg-tagsci-950 dark:text-tagsci-300' },
  { name: 'Chemistry', type: 'Elective', color: 'border-l-4 border-indigo-500', badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  { name: 'Biology', type: 'Elective', color: 'border-l-4 border-green-600', badgeClass: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' }
];

export function getSubjectMeta(subjectName) {
  const found = SUBJECTS.find(s => s.name.toLowerCase() === (subjectName || '').toLowerCase());
  return found || { name: subjectName, type: 'Main', color: 'border-l-4 border-tagsci-600', badgeClass: 'bg-tagsci-100 text-tagsci-800 dark:bg-tagsci-950 dark:text-tagsci-300' };
}

// Default embedded baseline data
const DEFAULT_BASELINE = {
  version: '1.4.0',
  calendarEvents: [],
  stemReviewers: [],
  problemSets: [],
  quizSets: [],
  studyMaterials: []
};

// Load cached data if available (survives updates & syncs), or fallback to baseline
let cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') || DEFAULT_BASELINE;

export let CALENDAR_EVENTS = cachedData.calendarEvents || [];
export let STEM_REVIEWERS = cachedData.stemReviewers || [];
export let PROBLEM_SETS = cachedData.problemSets || [];
export let QUIZ_SETS = cachedData.quizSets || [];
export let STUDY_MATERIALS = cachedData.studyMaterials || [];
export let CURRENT_APP_VERSION = cachedData.version || '1.4.0';

export const INITIAL_TASKS = [];

export const EDITORIAL_CREDITS = [
  {
    role: 'Project Lead & G11 Representative',
    name: 'G11 SSLG Representative',
    title: 'Lead Architect & Curator',
    badge: 'Head Council'
  },
  {
    role: 'Editorial Council',
    name: 'Academic Committee',
    title: 'Curators & Subject Content Writers',
    badge: 'Editorial Board'
  },
  {
    role: 'Peer Contributors',
    name: 'TagSci G11 Student Cohort',
    title: 'Reviewers & Problem Set Solvers',
    badge: 'Contributors'
  }
];

export function getSyncUrl() {
  return localStorage.getItem(SYNC_URL_KEY) || DEFAULT_OTA_URL;
}

export function setSyncUrl(url) {
  localStorage.setItem(SYNC_URL_KEY, url);
}

export function resetSyncUrlToDefault() {
  localStorage.setItem(SYNC_URL_KEY, DEFAULT_OTA_URL);
  return DEFAULT_OTA_URL;
}

export function clearAppCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem('tagsci_g11_tasks');
}

export function saveSyncedData(newData) {
  cachedData = {
    version: newData.version || '1.4.0',
    calendarEvents: newData.calendarEvents || [],
    stemReviewers: newData.stemReviewers || [],
    problemSets: newData.problemSets || [],
    quizSets: newData.quizSets || [],
    studyMaterials: newData.studyMaterials || []
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));

  // Update in-memory references
  CALENDAR_EVENTS = cachedData.calendarEvents;
  STEM_REVIEWERS = cachedData.stemReviewers;
  PROBLEM_SETS = cachedData.problemSets;
  QUIZ_SETS = cachedData.quizSets;
  STUDY_MATERIALS = cachedData.studyMaterials;
  CURRENT_APP_VERSION = cachedData.version;
}
