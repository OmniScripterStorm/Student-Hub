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

// Default baseline data inlined from updates.json
const DEFAULT_BASELINE = {
  "version": "1.4.1",
  "updatedAt": "2026-09-24T02:43:37.166Z",
  "announcement": "Refreshed General Math & Physics Reviewers, First Summative Exam schedule, and Quiz Banks.",
  "calendarEvents": [
    {
      "id": 1790208692100,
      "date": "2026-10-04",
      "subject": "DepEd",
      "title": "First Summative Exam",
      "type": "exam",
      "badge": "Exam / 60pts",
      "desc": "First Quarter Summative Examination coverage across all academic subjects."
    }
  ],
  "stemReviewers": [
    {
      "id": "gen_math_functions",
      "subject": "General Math",
      "tag": "Main",
      "color": "border-l-4 border-g11pink-500",
      "title": "Functions, Rational Equations & Inverses",
      "summary": "Domain, range, rational functions, asymptotes, and inverse function properties.",
      "blocks": [
        {
          "type": "heading",
          "level": "h3",
          "text": "1. Rational Functions & Asymptotes"
        },
        {
          "type": "paragraph",
          "text": "A rational function is defined as a fraction of polynomials $f(x) = \\frac{P(x)}{Q(x)}$ where $Q(x) \\neq 0$."
        },
        {
          "type": "formula",
          "title": "Standard Rational Form",
          "formula": "f(x) = \\frac{a_n x^n + \\dots}{b_m x^m + \\dots}",
          "note": "Compare degree n and degree m to find horizontal asymptotes."
        },
        {
          "type": "bullets",
          "items": [
            "Vertical Asymptote: Values of x where denominator Q(x) = 0.",
            "Horizontal Asymptote: If n < m, y = 0. If n = m, y = \\frac{a_n}{b_m}."
          ]
        }
      ]
    }
  ],
  "studyMaterials": [],
  "problemSets": [],
  "quizSets": [
    {
      "id": "quiz_1790208718271",
      "subject": "Effective Communications",
      "tag": "Main",
      "title": "Effective Communications Quiz Drill",
      "desc": "Key concepts and practice questions for Effective Communications.",
      "timeLimitMinutes": 15,
      "questions": [
        {
          "type": "true_false",
          "topic": "Communication Fundamentals",
          "prompt": "Communication is a linear process with no feedback loop.",
          "answerBoolean": false,
          "explanation": "Communication is an interactive/transactional process that requires active feedback between sender and receiver."
        },
        {
          "type": "mcq",
          "topic": "Communication Models",
          "prompt": "Which element in the communication process refers to the medium through which a message is transmitted?",
          "options": [
            "Channel",
            "Receiver",
            "Encoding",
            "Feedback"
          ],
          "answerIndex": 0,
          "explanation": "The Channel is the medium or vehicle through which the encoded message is conveyed."
        },
        {
          "type": "identification",
          "topic": "Barriers",
          "prompt": "What term describes anything that distorts, interrupts, or impedes the message between sender and receiver?",
          "correctText": "Noise",
          "aliases": "interference, barrier",
          "explanation": "Noise is any physical, psychological, or semantic interference in the communication channel."
        }
      ]
    }
  ]
};

// Load cached data if available (survives updates & syncs), or fallback to baseline
let cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') || DEFAULT_BASELINE;

export let CALENDAR_EVENTS = cachedData.calendarEvents || DEFAULT_BASELINE.calendarEvents;
export let STEM_REVIEWERS = cachedData.stemReviewers || DEFAULT_BASELINE.stemReviewers;
export let PROBLEM_SETS = cachedData.problemSets || DEFAULT_BASELINE.problemSets;
export let QUIZ_SETS = cachedData.quizSets || DEFAULT_BASELINE.quizSets;
export let STUDY_MATERIALS = cachedData.studyMaterials || DEFAULT_BASELINE.studyMaterials;
export let CURRENT_APP_VERSION = cachedData.version || DEFAULT_BASELINE.version;

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
    version: newData.version || '1.4.1',
    updatedAt: newData.updatedAt || new Date().toISOString(),
    announcement: newData.announcement || '',
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
