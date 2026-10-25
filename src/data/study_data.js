/* =========================================================
   TagSci G11 Study WebApp - Data Store & Local Cache Engine
   ========================================================= */

const CACHE_KEY = 'tagsci_g11_study_cache';
const SYNC_URL_KEY = 'tagsci_g11_sync_url';

export const DEFAULT_OTA_URL = 'https://omniscripterstorm.github.io/Student-Hub/updates.json';

export const SUBJECTS = [
  { name: 'Kasaysayan', type: 'Main', color: 'border-l-4 border-amber-600', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
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

// Default baseline data
const DEFAULT_BASELINE = {
  "version": "1.9.0",
  "updatedAt": "2026-10-25T19:30:00.000Z",
  "announcement": "Active Recall Flashcards & Spaced Repetition engine is now active.",
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
  "stemReviewers": [],
  "studyMaterials": [],
  "problemSets": [],
  "flashcardDecks": [
    {
      "id": "deck_kasaysayan_aralin_1",
      "subject": "Kasaysayan",
      "tag": "Main",
      "color": "border-l-4 border-amber-600",
      "title": "Summative 1: Zeus Salazar & Konsepto ng Kasaysayan",
      "desc": "Active recall on Pantayong Pananaw, Tatlong Yugto ng Kasaysayan, and historical methodologies.",
      "cards": [
        {
          "id": "kas_01",
          "topic": "Batayang Kahulugan",
          "front": "Ano ang depinisyon ng **Kasaysayan** ayon sa Pantayong Pananaw ni Dr. Zeus Salazar?",
          "back": "Ang kasaysayan ay **salaysay na may saysay para sa sinasalaysayang grupo ng tao** (kailangang may saysay para sa sariling kabuuan).",
          "hint": "Tandaan ang dalawang salitang-ugat: Salaysay (kuwento) at Saysay (katuturan o kabuluhan)."
        },
        {
          "id": "kas_02",
          "topic": "Pananaw sa Kasaysayan",
          "front": "Ano ang pagkakaiba ng **Pangkaming Pananaw** sa **Pantayong Pananaw**?",
          "back": "• **Pangkami**: Mula sa Pilipino tungo sa banyagang tagapakinig/mambabasa gamit ang banyagang wika (pagpapaliwanag sa iba).\n• **Pantayo**: Mula sa Pilipino para sa sariling kapwa Pilipino gamit ang wikang nauunawaan ng lahat sa loob ng sariling kultura.",
          "hint": "Sino ang kausap? Taga-labas o sariling kapwa Pilipino?"
        },
        {
          "id": "kas_03",
          "topic": "Tatlong Yugto",
          "front": "Ano ang **Tatlong Yugto ng Kasaysayan ng Kapilipinuhan** ayon sa Bagong Balangkas?",
          "back": "1. **Unang Yugto**: Pamayanan (bago ang 1588 / kolonyalismo)\n2. **Ikalawang Yugto**: Bayan (pagbuo ng kamalayang Pilipino noong ika-19 na dantaon hanggang Himagsikan)\n3. **Ikatlong Yugto**: Bansa (Republika at pangkalahatang kaisahan ng Kapilipinuhan).",
          "hint": "Pamayanan -> Bayan -> Bansa."
        },
        {
          "id": "kas_04",
          "topic": "Metodolohiya",
          "front": "Ano ang kaibahan ng **Primaryang Batis** sa **Sekondaryang Batis**?",
          "back": "• **Primaryang Batis**: Direktang ebidensya o saksi mula sa mismong panahong pinag-aaralan (e.g. talaarawan, liham, batas, artifacts, ulat ng saksi).\n• **Sekondaryang Batis**: Pagsusuri, interpretasyon, o pagtalakay batay sa mga primaryang batis (e.g. aklat-aralin, artikulong pangkasaysayan).",
          "hint": "Mismong saksi ba o komentaryo/pagsusuri lang pagkatapos ng pangyayari?"
        }
      ]
    },
    {
      "id": "deck_imfa_chem_flashcards",
      "subject": "General Chemistry",
      "tag": "Flashcard Deck",
      "color": "border-l-4 border-emerald-500",
      "title": "Intermolecular Forces & Physical Properties (Active Recall)",
      "desc": "Master London dispersion, dipole-dipole, hydrogen bonding, and their effects on boiling points and vapor pressure.",
      "cards": [
        {
          "id": "chem_01",
          "topic": "Intermolecular Forces",
          "front": "What is the primary condition required for **Hydrogen Bonding** to form between molecules?",
          "back": "A hydrogen atom covalently bonded to a strongly electronegative atom with small atomic radius ($\\text{N}$, $\\text{O}$, or $\\text{F}$) interacts with a lone pair on a nearby $\\text{N}$, $\\text{O}$, or $\\text{F}$ atom.",
          "hint": "Think of the acronym: FON (Fluorine, Oxygen, Nitrogen)."
        },
        {
          "id": "chem_02",
          "topic": "Dispersion Forces",
          "front": "How does molecular size / molar mass affect the strength of **London Dispersion Forces (LDF)**?",
          "back": "Larger molecules with higher molar mass have larger electron clouds, increasing **polarizability**, which produces stronger temporary dipoles and higher boiling points.",
          "hint": "More electrons = easier to distort the electron cloud."
        },
        {
          "id": "chem_03",
          "topic": "Ion-Dipole Forces",
          "front": "How do water ($\\text{H}_2\\text{O}$) molecules orient around a $\\text{Na}^+$ cation vs a $\\text{Cl}^-$ anion during hydration?",
          "back": "Around $\\text{Na}^+$, water orients its partially negative Oxygen atom ($\\delta^- \\text{O}$). Around $\\text{Cl}^-$, water orients its partially positive Hydrogen atoms ($\\delta^+ \\text{H}$).",
          "hint": "Opposite charges attract: $\\delta^-$ toward (+) and $\\delta^+$ toward (-)."
        },
        {
          "id": "chem_04",
          "topic": "Physical Properties",
          "front": "What is the relationship between Intermolecular Force (IMF) strength and **Vapor Pressure** at a given temperature?",
          "back": "**Inversely proportional**: Stronger IMFs $\\implies$ Fewer surface molecules can escape into gas phase $\\implies$ **Lower Vapor Pressure** (and Higher Boiling Point).",
          "hint": "If molecules stick tightly together, can they easily evaporate into vapor?"
        }
      ]
    }
  ]
};

// Load cached data if available (survives updates & syncs), or fallback to baseline
let cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') || DEFAULT_BASELINE;

// Normalize flashcardDecks if old cache had quizSets
if (!cachedData.flashcardDecks && cachedData.quizSets) {
  cachedData.flashcardDecks = cachedData.quizSets.map(q => ({
    id: q.id,
    subject: q.subject,
    tag: q.tag,
    color: q.color,
    title: q.title,
    desc: q.desc,
    cards: (q.questions || []).map((card, idx) => ({
      id: card.id || `card_${idx}`,
      topic: card.topic || 'General',
      front: card.front || card.prompt || '',
      back: card.back || card.explanation || '',
      hint: card.hint || ''
    }))
  }));
}

export let CALENDAR_EVENTS = cachedData.calendarEvents || DEFAULT_BASELINE.calendarEvents;
export let STEM_REVIEWERS = cachedData.stemReviewers || DEFAULT_BASELINE.stemReviewers;
export let PROBLEM_SETS = cachedData.problemSets || DEFAULT_BASELINE.problemSets;
export let FLASHCARD_DECKS = cachedData.flashcardDecks || DEFAULT_BASELINE.flashcardDecks;
export let STUDY_MATERIALS = cachedData.studyMaterials || DEFAULT_BASELINE.studyMaterials;
export let CURRENT_APP_VERSION = cachedData.version || DEFAULT_BASELINE.version;

export function getLocalStudyData() {
  return cachedData || JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') || DEFAULT_BASELINE;
}

export const INITIAL_TASKS = [];

const CREDITS_CACHE_KEY = 'tagsci_g11_credits_cache';
export const DEFAULT_CREDITS_URL = 'https://omniscripterstorm.github.io/Student-Hub/credits.md';

export const DEFAULT_CREDITS_MARKDOWN = `# Grade 11 Representative
- **JV Rejuso** — Platform Architect & Lead Developer

# Academic Committee
- **Eugene Martin Sinampaga** — Physics & Finite Mathematics
- **Joshua Ramos** — General Mathematics
- **James Stephen Golis** — General Chemistry
- **Zyra Cel Dulgime** — Mabisang Komunikasyon
- **Marielle Ydine Ramil** — Mabisang Komunikasyon
- **Fernando Gabriel Padilla** — Effective Communication

> *Special thanks to all student contributors and subject teachers for supporting TagSci Grade 11.*`;

export function getCachedCreditsMarkdown() {
  return localStorage.getItem(CREDITS_CACHE_KEY) || DEFAULT_CREDITS_MARKDOWN;
}

export function saveCachedCreditsMarkdown(md) {
  if (md && typeof md === 'string') {
    localStorage.setItem(CREDITS_CACHE_KEY, md);
  }
}

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
    version: newData.version || '1.9.0',
    updatedAt: newData.updatedAt || new Date().toISOString(),
    announcement: newData.announcement || '',
    calendarEvents: newData.calendarEvents || [],
    stemReviewers: newData.stemReviewers || [],
    problemSets: newData.problemSets || [],
    flashcardDecks: newData.flashcardDecks || [],
    studyMaterials: newData.studyMaterials || []
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));

  // Update in-memory references
  CALENDAR_EVENTS = cachedData.calendarEvents;
  STEM_REVIEWERS = cachedData.stemReviewers;
  PROBLEM_SETS = cachedData.problemSets;
  FLASHCARD_DECKS = cachedData.flashcardDecks;
  STUDY_MATERIALS = cachedData.studyMaterials;
  CURRENT_APP_VERSION = cachedData.version;
}
