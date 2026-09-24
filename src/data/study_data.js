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

// Default baseline data loaded from initial curriculum
const DEFAULT_BASELINE = {
  version: '1.4.0',
  calendarEvents: [
    {
      id: 1,
      date: "2026-09-24",
      subject: "Chemistry",
      title: "Gen Chemistry 1 - Stoichiometry Laboratory",
      type: "lab",
      badge: "Lab Report",
      desc: "Pre-lab calculation check & reagent safety protocol."
    },
    {
      id: 2,
      date: "2026-09-26",
      subject: "Finite Math",
      title: "Finite Math - Conic Sections Problem Set #3",
      type: "exam",
      badge: "P-Set #3",
      desc: "Standard form graphing and vertex-focus derivations."
    },
    {
      id: 3,
      date: "2026-09-29",
      subject: "Physics",
      title: "Physics - 2D Kinematics & Vectors Quiz",
      type: "quiz",
      badge: "Quiz",
      desc: "Projectile range, max height, and vector components."
    }
  ],
  stemReviewers: [
    {
      id: "physics_kinematics_2d",
      subject: "Physics",
      tag: "Elective",
      color: "border-l-4 border-tagsci-600",
      title: "Kinematics in 1D & 2D (Projectile Motion)",
      summary: "Uniform acceleration equations, trajectory formulas, and vector decomposition.",
      blocks: [
        { type: "heading", level: "h2", text: "Key Kinematics Formulas" },
        { type: "paragraph", text: "For uniform accelerated linear motion along a straight axis:" },
        { type: "formula", title: "Torricelli Equation", formula: "v^2 = v_0^2 + 2a\\Delta x", note: "Relates velocity and displacement without time." },
        { type: "formula", title: "Position-Time Relation", formula: "\\Delta x = v_0 t + \\frac{1}{2}at^2", note: "Calculates displacement under constant acceleration." },
        { type: "heading", level: "h3", text: "2D Projectile Motion" },
        { type: "bullets", items: [
          "Horizontal velocity is strictly uniform: $v_x = v_0\\cos\\theta$",
          "Vertical velocity is accelerated by gravity $g = 9.8\\text{ m/s}^2$: $v_y = v_0\\sin\\theta - gt$"
        ]},
        { type: "formula", title: "Maximum Range", formula: "R = \\frac{v_0^2\\sin(2\\theta)}{g}", note: "Max range occurs at angle theta = 45 degrees." },
        { type: "formula", title: "Maximum Trajectory Height", formula: "H = \\frac{v_0^2\\sin^2\\theta}{2g}", note: "Apex height reached by projectile." }
      ]
    },
    {
      id: "math_conic_sections",
      subject: "Finite Math",
      tag: "Elective",
      color: "border-l-4 border-purple-500",
      title: "Conic Sections & Standard Forms",
      summary: "Equations, vertices, foci, directrix, and eccentricity of circles, parabolas, ellipses, and hyperbolas.",
      blocks: [
        { type: "heading", level: "h2", text: "Standard Conic Section Equations" },
        { type: "heading", level: "h3", text: "1. Circle" },
        { type: "formula", title: "Standard Form", formula: "(x - h)^2 + (y - k)^2 = r^2", note: "Center at (h, k) with radius r." },
        { type: "heading", level: "h3", text: "2. Parabola" },
        { type: "bullets", items: [
          "Vertical axis: $(x - h)^2 = 4p(y - k)$, Focus $(h, k + p)$",
          "Horizontal axis: $(y - k)^2 = 4p(x - h)$, Focus $(h + p, k)$"
        ]},
        { type: "heading", level: "h3", text: "3. Ellipse (Horizontal Major Axis)" },
        { type: "formula", title: "Standard Equation", formula: "\\frac{(x - h)^2}{a^2} + \\frac{(y - k)^2}{b^2} = 1", note: "c^2 = a^2 - b^2, foci at (h +- c, k)." }
      ]
    }
  ],
  studyMaterials: [],
  problemSets: [],
  quizSets: [
    {
      id: "precal_conics_quiz",
      subject: "Finite Math",
      tag: "Elective",
      title: "Conic Sections & Analytical Geometry Drill",
      desc: "Practice circles, parabolas, ellipses, hyperbolas, and foci coordinates.",
      timeLimitMinutes: 10,
      questions: [
        {
          type: "mcq",
          prompt: "What is the radius and center of the circle with standard equation $(x - 3)^2 + (y + 5)^2 = 49$?",
          options: [
            "Center $(3, -5)$, Radius $r = 7$",
            "Center $(-3, 5)$, Radius $r = 7$",
            "Center $(3, -5)$, Radius $r = 49$",
            "Center $(-3, 5)$, Radius $r = 49$"
          ],
          answerIndex: 0,
          explanation: "The standard circle equation is $(x - h)^2 + (y - k)^2 = r^2$. Comparing values: $h = 3$, $k = -5$, and $r = \\sqrt{49} = 7$."
        },
        {
          type: "mcq",
          prompt: "Find the foci of the hyperbola:\n$$ \\frac{(x - 2)^2}{16} - \\frac{(y + 1)^2}{9} = 1 $$",
          options: [
            "$(2 \\pm \\sqrt{7}, -1)$",
            "$(2 \\pm 5, -1)$",
            "$(2, -1 \\pm 5)$",
            "$(2 \\pm 25, -1)$"
          ],
          answerIndex: 1,
          explanation: "For a horizontal hyperbola, $c^2 = a^2 + b^2$. Here $a^2 = 16$ and $b^2 = 9$, so $c^2 = 25 \\implies c = 5$. The foci are $(h \\pm c, k) = (2 \\pm 5, -1)$."
        },
        {
          type: "numerical",
          prompt: "A horizontal parabola has equation $(y - 2)^2 = 16(x + 1)$. What is the focal distance parameter $p$?",
          options: [],
          correctValue: "4",
          tolerance: "0.01",
          explanation: "The standard form is $(y - k)^2 = 4p(x - h)$. Matching $4p = 16 \\implies p = 4$."
        },
        {
          type: "flashcard",
          prompt: "Hyperbola Asymptote Formula (Horizontal Transverse Axis)",
          front: "Hyperbola Asymptote Formula (Horizontal Transverse Axis)",
          back: "$$ y - k = \\pm \\frac{b}{a}(x - h) $$",
          explanation: "For horizontal hyperbolas centered at $(h,k)$, slopes are +- b/a."
        }
      ]
    }
  ]
};

// Load cached data if available (survives updates & syncs), or fallback to baseline
let cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') || DEFAULT_BASELINE;

// If cached data exists but has empty reviewers array, use baseline reviewers
if (!cachedData.stemReviewers || cachedData.stemReviewers.length === 0) {
  cachedData.stemReviewers = DEFAULT_BASELINE.stemReviewers;
}
if (!cachedData.quizSets || cachedData.quizSets.length === 0) {
  cachedData.quizSets = DEFAULT_BASELINE.quizSets;
}
if (!cachedData.calendarEvents || cachedData.calendarEvents.length === 0) {
  cachedData.calendarEvents = DEFAULT_BASELINE.calendarEvents;
}

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
