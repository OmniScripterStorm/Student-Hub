import { getSyncUrl, setSyncUrl, resetSyncUrlToDefault, clearAppCache, saveSyncedData, CURRENT_APP_VERSION, DEFAULT_OTA_URL } from '../data/study_data.js';

export async function checkOtaUpdates() {
  const statusBadge = document.getElementById('otaStatusBadge');
  const syncBtn = document.getElementById('syncBtn');
  const settingsSyncBtn = document.getElementById('settingsSyncBtn');

  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.innerHTML = `<span>&#x23F3; Syncing GDrive...</span>`;
  }
  if (settingsSyncBtn) {
    settingsSyncBtn.disabled = true;
    settingsSyncBtn.textContent = 'Syncing...';
  }

  const endpoint = getSyncUrl();

  try {
    const res = await fetch(endpoint, { 
      method: 'GET',
      redirect: 'follow',
      cache: 'no-cache'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && data.version) {
      saveSyncedData(data);

      if (statusBadge) {
        statusBadge.textContent = `v${data.version} (Synced)`;
      }

      const counts = `• Reviewers: ${data.stemReviewers ? data.stemReviewers.length : 0}\n• Quizzes: ${data.quizSets ? data.quizSets.length : 0}\n• Deadlines: ${data.calendarEvents ? data.calendarEvents.length : 0}`;
      alert(`✅ Google Drive OTA Sync Successful!\n\nVersion: v${data.version}\n\n${counts}\n\n${data.announcement || 'Study materials refreshed.'}`);
      
      // Reload UI views with fresh data
      window.location.reload();
    } else if (data && data.status === 'error') {
      throw new Error(data.message || 'Google Drive endpoint returned an error.');
    } else {
      throw new Error('Invalid update payload format from Google Drive.');
    }
  } catch (err) {
    console.warn('OTA Check notice:', err);
    alert(`ℹ️ Google Drive Sync Notice:\nCould not connect to:\n${endpoint}\n\nDetails: ${err.message}\n\n(If you are offline, all existing downloaded reviewers and personal tasks remain 100% accessible!)`);
  } finally {
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.innerHTML = `<span>&#x26A1; Check Updates</span>`;
    }
    if (settingsSyncBtn) {
      settingsSyncBtn.disabled = false;
      settingsSyncBtn.textContent = 'Sync from GDrive Now';
    }
  }
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
  alert('✅ Reset OTA Endpoint to default Google Drive Apps Script URL!');
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
    alert('Please fill out your Name, Section, and Preferred Subject.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  const payload = {
    username: 'TagSci G11 Study Hub',
    avatar_url: 'https://raw.githubusercontent.com/favicon.ico',
    embeds: [
      {
        title: '🌸 New Editorial Council Application',
        color: 15485110, // G11 Pink
        fields: [
          { name: '👤 Student Name', value: name, inline: true },
          { name: '🏫 Section', value: section, inline: true },
          { name: '🔬 Preferred STEM Subject', value: subject, inline: true },
          { name: '💬 Statement / Pitch', value: message || 'No extra remarks provided.' }
        ],
        footer: { text: 'TagSci G11 SSLG Study WebApp' },
        timestamp: new Date().toISOString()
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
      alert('🎉 Application submitted successfully! The Editorial Council and G11 Rep will review your submission on Discord.');
      nameInput.value = '';
      sectionInput.value = '';
      subjectInput.value = '';
      msgInput.value = '';
    } else {
      throw new Error(`Server returned status ${res.status}`);
    }
  } catch (err) {
    console.error('Discord Webhook Error:', err);
    alert('⚠️ Error submitting request. Please check your internet connection or notify the G11 Rep directly.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application to Discord';
    }
  }
}
