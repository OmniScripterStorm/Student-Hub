import { getSyncUrl, setSyncUrl, resetSyncUrlToDefault, clearAppCache, saveSyncedData, CURRENT_APP_VERSION, DEFAULT_OTA_URL } from '../data/study_data.js';
import { renderMaterials } from './reviewers.js';
import { renderCalendar } from './calendar.js';
import { renderMaterialsView, renderReviewersView, getCurrentSection } from './navigation.js';
import { renderQuizSetsView } from './quiz_engine.js';

let otaPollerInterval = null;
let isSyncInProgress = false;

export function refreshAllViews() {
  try {
    if (typeof renderMaterials === 'function') renderMaterials();
    if (typeof renderCalendar === 'function') renderCalendar();
    if (typeof getCurrentSection === 'function') {
      const sec = getCurrentSection();
      if (sec === 'materials' && typeof renderMaterialsView === 'function') renderMaterialsView();
      if (sec === 'reviewers' && typeof renderReviewersView === 'function') renderReviewersView();
      if (sec === 'quiz_sets' && typeof renderQuizSetsView === 'function') renderQuizSetsView();
    }
  } catch (err) {
    console.warn('Auto-sync live refresh notice:', err);
  }
}

export async function checkOtaUpdates(isSilent = false) {
  if (isSyncInProgress) return;

  const statusBadge = document.getElementById('otaStatusBadge');
  const syncBtn = document.getElementById('syncBtn');
  const settingsSyncBtn = document.getElementById('settingsSyncBtn');

  if (!navigator.onLine && isSilent) {
    return; // Don't attempt silent sync if completely offline
  }

  isSyncInProgress = true;

  if (syncBtn && !isSilent) {
    syncBtn.disabled = true;
    syncBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0"></span><span class="font-mono-math text-[11px] sm:text-xs whitespace-nowrap">Syncing...</span>`;
  }
  if (settingsSyncBtn && !isSilent) {
    settingsSyncBtn.disabled = true;
    settingsSyncBtn.textContent = 'Syncing from GitHub...';
  }

  const endpoint = getSyncUrl();
  const cacheBustUrl = endpoint.includes('?') 
    ? `${endpoint}&_t=${Date.now()}` 
    : `${endpoint}?_t=${Date.now()}`;

  try {
    const res = await fetch(cacheBustUrl, { 
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && data.version) {
      const rawCurrent = localStorage.getItem('tagsci_g11_study_cache');
      const currentCache = rawCurrent ? JSON.parse(rawCurrent) : null;
      
      const isNewUpdate = !currentCache || 
        currentCache.updatedAt !== data.updatedAt || 
        currentCache.version !== data.version ||
        JSON.stringify(currentCache.stemReviewers || []) !== JSON.stringify(data.stemReviewers || []) ||
        JSON.stringify(currentCache.studyMaterials || []) !== JSON.stringify(data.studyMaterials || []) ||
        JSON.stringify(currentCache.calendarEvents || []) !== JSON.stringify(data.calendarEvents || []) ||
        JSON.stringify(currentCache.quizSets || []) !== JSON.stringify(data.quizSets || []);

      if (isNewUpdate) {
        saveSyncedData(data);
        refreshAllViews();

        if (statusBadge) {
          statusBadge.innerHTML = `<span class="hidden sm:inline">v${data.version} </span>Synced`;
        }

        showAutoUpdateNotification(data, !isSilent);
      } else {
        if (statusBadge) {
          statusBadge.innerHTML = `<span class="hidden sm:inline">v${data.version} </span>Synced`;
        }
        if (!isSilent) {
          showUpToDateNotification(data);
        }
      }
    } else if (data && data.status === 'error') {
      throw new Error(data.message || 'OTA endpoint returned an error.');
    } else {
      throw new Error('Invalid update payload format.');
    }
  } catch (err) {
    if (!isSilent) {
      console.warn('OTA Check notice:', err);
      showSyncErrorNotification(err.message, endpoint);
    } else {
      console.log('Background silent sync check notice:', err.message);
    }
  } finally {
    isSyncInProgress = false;
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span><span id="otaStatusBadge" class="font-mono-math text-[11px] sm:text-xs whitespace-nowrap"><span class="hidden sm:inline">Auto-</span>Synced</span>`;
    }
    if (settingsSyncBtn) {
      settingsSyncBtn.disabled = false;
      settingsSyncBtn.textContent = 'Sync from GitHub Now';
    }
  }
}

function showAutoUpdateNotification(data, isManual = false) {
  const existingToast = document.getElementById('auto-update-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'auto-update-toast';
  toast.className = 'fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start space-x-3 transform translate-y-24 transition-all duration-300';
  
  const revCount = data.stemReviewers ? data.stemReviewers.length : 0;
  const matCount = data.studyMaterials ? data.studyMaterials.length : 0;
  const quizCount = data.quizSets ? data.quizSets.length : 0;
  const eventCount = data.calendarEvents ? data.calendarEvents.length : 0;

  toast.innerHTML = `
    <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-lg shrink-0">
      ⚡
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          ${isManual ? 'Sync Completed' : 'Live Updated'}
        </h4>
        <span class="text-[10px] font-mono-math font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">v${data.version || '1.4'}</span>
      </div>
      <p class="text-[11.5px] text-slate-200 mt-1 font-medium leading-tight">${data.announcement || 'Curriculum & materials updated automatically.'}</p>
      <div class="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-mono-math">
        <span>📖 ${revCount} Revs</span>
        <span>•</span>
        <span>📚 ${matCount} Mats</span>
        <span>•</span>
        <span>🎯 ${quizCount} Quizzes</span>
        <span>•</span>
        <span>📅 ${eventCount} Events</span>
      </div>
    </div>
    <button onclick="document.getElementById('auto-update-toast')?.remove()" class="text-slate-400 hover:text-white text-xs p-1">
      ✕
    </button>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('translate-y-24'));

  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.classList.add('translate-y-24', 'opacity-0');
      setTimeout(() => toast.remove(), 350);
    }
  }, 5000);
}

function showUpToDateNotification(data) {
  const existingToast = document.getElementById('auto-update-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'auto-update-toast';
  toast.className = 'fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur text-white p-3.5 rounded-2xl shadow-2xl border border-tagsci-700/60 flex items-start space-x-3 transform translate-y-24 transition-all duration-300';
  toast.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-tagsci-800/40 border border-tagsci-600/40 text-tagsci-300 flex items-center justify-center text-sm shrink-0">
      ✅
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider">Already Up to Date</h4>
        <span class="text-[10px] font-mono-math text-emerald-400">v${data.version || '1.4'}</span>
      </div>
      <p class="text-[11px] text-slate-300 mt-0.5 leading-snug">All curriculum notes, reviewers, quizzes, and deadlines are currently synced.</p>
    </div>
    <button onclick="document.getElementById('auto-update-toast')?.remove()" class="text-slate-400 hover:text-white text-xs p-1">✕</button>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('translate-y-24'));

  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.classList.add('translate-y-24', 'opacity-0');
      setTimeout(() => toast.remove(), 3500);
    }
  }, 3500);
}

function showSyncErrorNotification(message, endpoint) {
  const existingToast = document.getElementById('auto-update-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'auto-update-toast';
  toast.className = 'fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur text-white p-3.5 rounded-2xl shadow-2xl border border-rose-500/40 flex items-start space-x-3 transform translate-y-24 transition-all duration-300';
  toast.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center text-sm shrink-0">
      ⚠️
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="text-xs font-bold text-rose-300 uppercase tracking-wider">Sync Notice</h4>
      <p class="text-[11px] text-slate-300 mt-0.5 leading-snug">Could not connect to update endpoint (${message}). Offline cache is active.</p>
    </div>
    <button onclick="document.getElementById('auto-update-toast')?.remove()" class="text-slate-400 hover:text-white text-xs p-1">✕</button>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('translate-y-24'));

  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.classList.add('translate-y-24', 'opacity-0');
      setTimeout(() => toast.remove(), 4000);
    }
  }, 4000);
}

export function initAutoSyncEngine(pollIntervalSeconds = 15) {
  // 1. Initial check immediately on start
  if (navigator.onLine) {
    checkOtaUpdates(true);
  }

  // 2. Instant check on network connection restoration
  window.addEventListener('online', () => {
    console.log('⚡ Network restored: Triggering instant background sync...');
    checkOtaUpdates(true);
  });

  // 3. Instant check when returning or focusing tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      checkOtaUpdates(true);
    }
  });

  window.addEventListener('focus', () => {
    if (navigator.onLine) {
      checkOtaUpdates(true);
    }
  });

  // 4. Recurring periodic background sync poller
  if (otaPollerInterval) clearInterval(otaPollerInterval);
  otaPollerInterval = setInterval(() => {
    if (navigator.onLine && document.visibilityState === 'visible') {
      checkOtaUpdates(true);
    }
  }, pollIntervalSeconds * 1000);
}

export function saveOtaSettings() {
  const input = document.getElementById('otaUrlInput');
  if (!input) return;
  const newUrl = input.value.trim();
  if (newUrl) {
    setSyncUrl(newUrl);
    alert('✅ OTA Update endpoint saved successfully!');
  }
}

export function resetOtaUrl() {
  const defaultUrl = resetSyncUrlToDefault();
  const input = document.getElementById('otaUrlInput');
  if (input) input.value = defaultUrl;
  alert('✅ Reset OTA Endpoint to default GitHub Pages updates.json URL!');
}

export function handleClearCache() {
  if (confirm('⚠️ Are you sure you want to clear your local cache and tasks? This will reset all downloaded reviewers to default.')) {
    clearAppCache();
    alert('Local cache cleared.');
    window.location.reload();
  }
}

export async function submitEditorialApplication() {
  const webhookUrl = 'https://discord.com/api/webhooks/1551762366784479272/4dF1H1kUJk7OMnbdWv9h7cwln2FzE5DdTfvwORO5ypum-6RpcgvxyIwHxJWvWhNcgjX9';

  const nameInput = document.getElementById('applicantName');
  const sectionInput = document.getElementById('applicantSection');
  const subjectInput = document.getElementById('applicantSubject');
  const msgInput = document.getElementById('applicantMessage');
  const submitBtn = document.getElementById('submitAppBtn');

  if (!nameInput || !sectionInput || !subjectInput || !msgInput) return;

  const name = nameInput.value.trim();
  const section = sectionInput.value.trim();
  const subject = subjectInput.value.trim();
  const message = msgInput.value.trim();

  if (!name || !section || !subject) {
    alert('Please fill out all required fields.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Application...';
  }

  const payload = {
    embeds: [
      {
        title: '🎓 G11 Student Hub - Academic Committee Application',
        color: 0x16a34a,
        fields: [
          { name: 'Applicant Name', value: name, inline: true },
          { name: 'Grade & Section', value: section, inline: true },
          { name: 'Subject Specialty', value: subject, inline: true },
          { name: 'Message / Intent', value: message || 'No message provided.' }
        ],
        footer: { text: `Submitted via TagSci Student Hub • ${new Date().toLocaleString()}` }
      }
    ]
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('🎉 Application submitted successfully to the Academic Committee! Thank you for contributing.');
      nameInput.value = '';
      sectionInput.value = '';
      subjectInput.value = '';
      msgInput.value = '';
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    alert(`Could not submit application online (${err.message}). Please reach out to your G11 Representative directly!`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application to Committee';
    }
  }
}
