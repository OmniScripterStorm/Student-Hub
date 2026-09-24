import { getSyncUrl, setSyncUrl, resetSyncUrlToDefault, clearAppCache, saveSyncedData, CURRENT_APP_VERSION, DEFAULT_OTA_URL } from '../data/study_data.js';

export async function checkOtaUpdates(isSilent = false) {
  const statusBadge = document.getElementById('otaStatusBadge');
  const syncBtn = document.getElementById('syncBtn');
  const settingsSyncBtn = document.getElementById('settingsSyncBtn');

  if (!navigator.onLine && isSilent) {
    return; // Don't attempt silent sync if completely offline
  }

  if (syncBtn && !isSilent) {
    syncBtn.disabled = true;
    syncBtn.innerHTML = `<span>&#x23F3; Checking...</span>`;
  }
  if (settingsSyncBtn && !isSilent) {
    settingsSyncBtn.disabled = true;
    settingsSyncBtn.textContent = 'Syncing...';
  }

  const endpoint = getSyncUrl();
  const cacheBustUrl = endpoint.includes('?') 
    ? `${endpoint}&_t=${Date.now()}` 
    : `${endpoint}?_t=${Date.now()}`;

  try {
    const res = await fetch(cacheBustUrl, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && data.version) {
      const currentCache = JSON.parse(localStorage.getItem('tagsci_g11_study_cache') || '{}');
      const isNewUpdate = currentCache.updatedAt !== data.updatedAt || currentCache.version !== data.version;

      saveSyncedData(data);

      if (statusBadge) {
        statusBadge.innerHTML = `<span class="hidden sm:inline">v${data.version} </span>Synced`;
      }

      if (!isSilent) {
        const counts = `• Reviewers: ${data.stemReviewers ? data.stemReviewers.length : 0}\n• Quizzes: ${data.quizSets ? data.quizSets.length : 0}\n• Deadlines: ${data.calendarEvents ? data.calendarEvents.length : 0}`;
        alert(`✅ GitHub Pages OTA Sync Successful!\n\nVersion: v${data.version}\n\n${counts}\n\n${data.announcement || 'Student materials refreshed.'}`);
        window.location.reload();
      } else if (isNewUpdate) {
        // Subtle toast for background auto-updates
        showAutoUpdateNotification(data);
      }
    } else if (data && data.status === 'error') {
      throw new Error(data.message || 'OTA endpoint returned an error.');
    } else {
      throw new Error('Invalid update payload format.');
    }
  } catch (err) {
    if (!isSilent) {
      console.warn('OTA Check notice:', err);
      alert(`ℹ️ GitHub OTA Sync Notice:\nCould not connect to:\n${endpoint}\n\nDetails: ${err.message}\n\n(If you are offline, all existing downloaded reviewers and personal tasks remain 100% accessible!)`);
    } else {
      console.log('Background silent sync check skipped:', err.message);
    }
  } finally {
    if (syncBtn && !isSilent) {
      syncBtn.disabled = false;
      syncBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span><span id="otaStatusBadge" class="font-mono-math text-[11px] sm:text-xs whitespace-nowrap"><span class="hidden sm:inline">Check </span>Updates</span>`;
    }
    if (settingsSyncBtn && !isSilent) {
      settingsSyncBtn.disabled = false;
      settingsSyncBtn.textContent = 'Sync from GitHub Now';
    }
  }
}

function showAutoUpdateNotification(data) {
  const toast = document.createElement('div');
  toast.id = 'auto-update-toast';
  toast.className = 'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-tagsci-700/60 flex items-start space-x-3 transform translate-y-24 transition-transform duration-300';
  toast.innerHTML = `
    <div class="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-lg shrink-0">
      ⚡
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider">Curriculum Refreshed</h4>
        <span class="text-[10px] font-mono-math text-emerald-400">v${data.version}</span>
      </div>
      <p class="text-xs text-slate-300 mt-0.5 line-clamp-2">${data.announcement || 'New reviewers, quizzes, and deadlines synced.'}</p>
      <div class="mt-2 flex items-center gap-2">
        <button onclick="window.location.reload()" class="px-3 py-1 bg-tagsci-700 hover:bg-tagsci-600 rounded-lg text-xs font-bold text-white transition">
          Reload to Apply
        </button>
        <button onclick="document.getElementById('auto-update-toast')?.remove()" class="px-2.5 py-1 text-slate-400 hover:text-white text-xs">
          Dismiss
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-24'), 100);
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
        title: '🎓 G11 Student Hub - Editorial Application',
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
      alert('🎉 Application submitted successfully to the G11 Editorial Council! Thank you for contributing.');
      nameInput.value = '';
      sectionInput.value = '';
      subjectInput.value = '';
      msgInput.value = '';
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    alert(`Could not submit application online (${err.message}). Please reach out to your G11 SSLG Representative directly!`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application to Editorial Council';
    }
  }
}
