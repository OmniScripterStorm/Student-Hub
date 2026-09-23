import { INITIAL_TASKS } from '../data/study_data.js';

const STORAGE_KEY = 'tagsci_g11_tasks';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || INITIAL_TASKS;

export function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

export function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
}

export function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
}

export function addTask() {
  const input = document.getElementById('newTaskInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  tasks.push({ id: Date.now(), text: val, done: false });
  input.value = '';
  saveTasks();
}

export function renderTasks() {
  const container = document.getElementById('tasksList');
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = `<p class="text-slate-400 text-[11px] py-1">No personal tasks yet.</p>`;
    return;
  }

  container.innerHTML = tasks.map(t => `
    <div class="flex items-center justify-between group p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/50 transition">
      <label class="flex items-center space-x-2 cursor-pointer select-none flex-1">
        <input 
          type="checkbox" 
          ${t.done ? 'checked' : ''} 
          onchange="window.App.toggleTask(${t.id})"
          class="rounded text-tagsci-600 focus:ring-tagsci-500 w-3.5 h-3.5 cursor-pointer"
        />
        <span class="${t.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}">${t.text}</span>
      </label>
      <button onclick="window.App.deleteTask(${t.id})" class="text-rose-500 sm:opacity-0 sm:group-hover:opacity-100 text-xs px-1.5 py-0.5 hover:text-rose-700 transition">
        &times;
      </button>
    </div>
  `).join('');
}
