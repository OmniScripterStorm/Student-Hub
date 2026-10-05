/* =========================================================
   TagSci G11 Study WebApp - Background Systems & Notification Engine
   Provides:
   - Periodic Background Sync Registration (periodicSync API)
   - Background & Local Deadline Alarms & Notification Manager
   - System Notification Permission & Testing Framework
   - Cross-tab & Background Lifecycle Orchestration
   ========================================================= */

import { CALENDAR_EVENTS, getLocalStudyData } from '../data/study_data.js';

const STORAGE_NOTIFIED_KEY = 'tagsci_notified_deadlines';
const STORAGE_NOTIF_PREF = 'tagsci_notif_enabled';

/**
 * Checks Notification permission status: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Checks if Periodic Background Sync is supported by the client browser
 */
export async function isPeriodicSyncSupported() {
  if (!('serviceWorker' in navigator) || !('periodicSync' in ServiceWorkerRegistration.prototype)) {
    return false;
  }
  try {
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    return status.state === 'granted';
  } catch (e) {
    return 'periodicSync' in ServiceWorkerRegistration.prototype;
  }
}

/**
 * Requests Notification permission and registers background periodic sync handlers
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('⚠️ Notifications are not supported by this browser.');
    updateBackgroundSettingsUI();
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(STORAGE_NOTIF_PREF, 'true');
      updateBackgroundSettingsUI();
      registerPeriodicBackgroundSync();
      checkUpcomingDeadlinesAndNotify(true);
      return true;
    } else {
      localStorage.setItem(STORAGE_NOTIF_PREF, 'false');
      updateBackgroundSettingsUI();
      return false;
    }
  } catch (err) {
    console.warn('[BackgroundEngine] Notification permission request error:', err);
    return false;
  }
}

/**
 * Registers Periodic Background Sync with the active Service Worker
 */
export async function registerPeriodicBackgroundSync() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) {
      try {
        await reg.periodicSync.register('tagsci-periodic-curriculum-sync', {
          minInterval: 12 * 60 * 60 * 1000 // 12 Hours
        });
        console.log('[BackgroundEngine] Periodic Background Sync registered (12h interval).');
      } catch (e) {
        console.log('[BackgroundEngine] Periodic sync registration info:', e.message);
      }
    }
  } catch (err) {
    console.warn('[BackgroundEngine] Service worker ready notice:', err);
  }
}

/**
 * Dispatches a local system notification via Service Worker or Web Notification API
 */
export async function dispatchSystemNotification(title, options = {}) {
  const defaultOptions = {
    icon: './tagsci%20logo.png',
    badge: './tagsci%20logo.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: { url: './#calendar' },
    ...options
  };

  // 1. Try Service Worker showNotification first (native mobile & desktop integration)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    } catch (e) {
      console.warn('[BackgroundEngine] SW showNotification fallback:', e);
    }
  }

  // 2. Fallback to standard window Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, defaultOptions);
      notif.onclick = function() {
        window.focus();
        if (defaultOptions.data && defaultOptions.data.url) {
          window.location.hash = defaultOptions.data.url.replace('./', '');
        }
        notif.close();
      };
      return true;
    } catch (e) {
      console.warn('[BackgroundEngine] Notification constructor fallback notice:', e);
    }
  }

  return false;
}

/**
 * Scans curriculum calendar events and alerts students of deadlines occurring within 48 hours
 */
export async function checkUpcomingDeadlinesAndNotify(isManualCheck = false) {
  if (getNotificationPermissionStatus() !== 'granted') return;

  const data = getLocalStudyData();
  const events = (data && data.calendarEvents && data.calendarEvents.length > 0) 
    ? data.calendarEvents 
    : CALENDAR_EVENTS;

  if (!events || events.length === 0) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  let notifiedMap = {};
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFIED_KEY);
    if (raw) notifiedMap = JSON.parse(raw);
  } catch (e) {
    notifiedMap = {};
  }

  let notifiedCount = 0;

  events.forEach(evt => {
    if (!evt.date) return;

    const evtDate = new Date(evt.date);
    const diffTime = evtDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Alert for events happening Today (0 days), Tomorrow (1 day), or within 48h
    if (diffDays >= 0 && diffDays <= 2) {
      const notifId = `${evt.date}_${(evt.title || '').trim().toLowerCase()}`;
      const lastNotified = notifiedMap[notifId];

      // Only notify if not already alerted today
      if (!lastNotified || lastNotified !== todayStr) {
        let urgency = diffDays === 0 ? '🚨 TODAY' : (diffDays === 1 ? '⏰ TOMORROW' : '📅 In 2 Days');
        const title = `${urgency}: ${evt.title || 'Academic Deadline'}`;
        const body = `${evt.subject ? `[${evt.subject}] ` : ''}${evt.desc || 'Scheduled exam/task submission deadline.'}`;

        dispatchSystemNotification(title, {
          body: body,
          tag: `deadline-${notifId}`,
          data: { url: './#calendar' }
        });

        notifiedMap[notifId] = todayStr;
        notifiedCount++;
      }
    }
  });

  try {
    localStorage.setItem(STORAGE_NOTIFIED_KEY, JSON.stringify(notifiedMap));
  } catch (e) {}

  if (isManualCheck && notifiedCount === 0) {
    console.log('[BackgroundEngine] All upcoming deadlines are already up to date and notified.');
  }
}

/**
 * Triggers an immediate test notification so the student can verify OS delivery
 */
export async function triggerTestNotification() {
  const perm = getNotificationPermissionStatus();
  if (perm !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      alert('⚠️ Please enable notifications in your browser settings to receive deadline alerts.');
      return;
    }
  }

  const sent = await dispatchSystemNotification('🎓 TagSci G11 Background System Active', {
    body: '⚡ Background sync & deadline reminder alerts are fully configured and running on your device.',
    tag: 'tagsci-test-notification',
    data: { url: './#calendar' }
  });

  if (sent) {
    console.log('[BackgroundEngine] Test notification dispatched successfully.');
  }
}

/**
 * Updates UI Badges and toggles in the Settings view
 */
export function updateBackgroundSettingsUI() {
  const permBadge = document.getElementById('notifPermissionBadge');
  const toggleBtn = document.getElementById('btnToggleNotifications');
  const syncBadge = document.getElementById('periodicSyncStatusBadge');

  const perm = getNotificationPermissionStatus();

  if (permBadge) {
    if (perm === 'granted') {
      permBadge.className = 'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300';
      permBadge.textContent = 'Active (Alerts Enabled)';
      if (toggleBtn) {
        toggleBtn.textContent = '🔔 Notification Active';
        toggleBtn.className = 'px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition';
      }
    } else if (perm === 'denied') {
      permBadge.className = 'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300';
      permBadge.textContent = 'Blocked by Browser';
      if (toggleBtn) {
        toggleBtn.textContent = '⚠️ Blocked (Check Site Settings)';
        toggleBtn.className = 'px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-300 dark:border-rose-800 transition';
      }
    } else {
      permBadge.className = 'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300';
      permBadge.textContent = 'Not Enabled';
      if (toggleBtn) {
        toggleBtn.textContent = '🔔 Enable Deadline Alerts';
        toggleBtn.className = 'px-3.5 py-1.5 rounded-xl bg-tagsci-700 hover:bg-tagsci-800 text-white text-xs font-bold shadow-sm transition';
      }
    }
  }

  if (syncBadge) {
    isPeriodicSyncSupported().then(supported => {
      if (supported) {
        syncBadge.className = 'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300';
        syncBadge.textContent = 'Background Sync Supported';
      } else {
        syncBadge.className = 'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
        syncBadge.textContent = 'Heartbeat Poller Mode';
      }
    });
  }
}

/**
 * Initializes the Background Engine on application startup
 */
export function initBackgroundEngine() {
  updateBackgroundSettingsUI();

  // 1. If notification permission is granted, register background periodic sync
  if (getNotificationPermissionStatus() === 'granted') {
    registerPeriodicBackgroundSync();
    checkUpcomingDeadlinesAndNotify(false);
  }

  // 2. Periodic in-app deadline scanner (every 30 minutes while tab is running)
  setInterval(() => {
    checkUpcomingDeadlinesAndNotify(false);
  }, 30 * 60 * 1000);

  // 3. Scan deadlines when returning to tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkUpcomingDeadlinesAndNotify(false);
      updateBackgroundSettingsUI();
    }
  });
}
