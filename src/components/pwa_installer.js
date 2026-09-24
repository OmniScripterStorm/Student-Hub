/* =========================================================
   TagSci G11 Study WebApp - First Launch PWA Installation Manager
   ========================================================= */

let deferredPrompt = null;
const STORAGE_KEY_PROMPT = 'tagsci_pwa_dismissed';

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true || 
         document.referrer.includes('android-app://');
}

export function isIosDevice() {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

export function initPwaInstallPrompt() {
  if (isStandalone()) {
    console.log('App is already running in standalone PWA mode.');
    return;
  }

  // Listen for native install prompt event (Chrome, Edge, Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const dismissedTimestamp = localStorage.getItem(STORAGE_KEY_PROMPT);
    // If not dismissed or dismissed more than 7 days ago, show install prompt
    if (!dismissedTimestamp || (Date.now() - parseInt(dismissedTimestamp)) > 7 * 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        showPwaPromptModal(false);
      }, 1500);
    }
  });

  // For iOS Safari (which doesn't support beforeinstallprompt)
  if (isIosDevice() && !isStandalone()) {
    const dismissedTimestamp = localStorage.getItem(STORAGE_KEY_PROMPT);
    if (!dismissedTimestamp) {
      setTimeout(() => {
        showPwaPromptModal(true);
      }, 2000);
    }
  }
}

export function showPwaPromptModal(isIos = false) {
  if (document.getElementById('pwa-install-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'pwa-install-modal';
  modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300';
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-bottom duration-300">
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <img src="./tagsci logo.png" alt="TagSci Logo" class="w-12 h-12 rounded-xl object-contain p-1 bg-white shadow border border-slate-200" />
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-g11pink-600 dark:text-g11pink-400 bg-g11pink-50 dark:bg-g11pink-950/60 px-2 py-0.5 rounded-full border border-g11pink-200 dark:border-g11pink-900">
              Offline WebApp
            </span>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              Install TagSci G11 App
            </h3>
          </div>
        </div>
        <button onclick="window.App.dismissPwaPrompt()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-lg font-bold">
          &times;
        </button>
      </div>

      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Install the <b>TagSci Student Hub</b> on your home screen for instantaneous loading, full offline access to reviewers & formulas, and zero data usage during school hours.
      </p>

      ${isIos ? `
        <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 space-y-1.5">
          <p class="font-bold flex items-center gap-1.5 text-tagsci-800 dark:text-emerald-400">
            <span>📱 iOS Safari Install Steps:</span>
          </p>
          <p>1. Tap the <b>Share</b> button <span class="text-base">⎋</span> at the bottom of Safari.</p>
          <p>2. Scroll down and tap <b>Add to Home Screen</b> <span class="text-base">⊞</span>.</p>
        </div>
      ` : ''}

      <div class="flex items-center gap-2 pt-1">
        ${!isIos ? `
          <button onclick="window.App.triggerPwaInstall()" class="flex-1 py-2.5 rounded-xl bg-tagsci-800 hover:bg-tagsci-700 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5">
            <span>📲</span>
            <span>Install App on Device</span>
          </button>
        ` : ''}
        <button onclick="window.App.dismissPwaPrompt()" class="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition">
          ${isIos ? 'Got It' : 'Maybe Later'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

export async function triggerPwaInstall() {
  if (!deferredPrompt) {
    alert('Please tap your browser settings menu (⋮ or ⎋) and select "Install app" or "Add to Home Screen".');
    dismissPwaPrompt();
    return;
  }

  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  console.log('PWA install choice:', choice.outcome);
  deferredPrompt = null;
  dismissPwaPrompt();
}

export function dismissPwaPrompt() {
  localStorage.setItem(STORAGE_KEY_PROMPT, Date.now().toString());
  const modal = document.getElementById('pwa-install-modal');
  if (modal) modal.remove();
}
