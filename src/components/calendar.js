import { CALENDAR_EVENTS } from '../data/study_data.js';

const now = new Date();
let currentYear = now.getFullYear();
let currentMonth = now.getMonth();

const todayPadMonth = String(now.getMonth() + 1).padStart(2, '0');
const todayPadDay = String(now.getDate()).padStart(2, '0');
let selectedDateStr = `${currentYear}-${todayPadMonth}-${todayPadDay}`;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function renderCalendar() {
  const label = document.getElementById('calendarMonthLabel');
  if (label) label.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const currentBannerDate = document.getElementById('currentDateDisplay');
  if (currentBannerDate) {
    currentBannerDate.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }

  const grid = document.getElementById('calendarDaysGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Lead cells
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'h-9 sm:h-10 rounded-lg bg-slate-100/40 dark:bg-slate-800/20';
    grid.appendChild(emptyCell);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const monthPad = String(currentMonth + 1).padStart(2, '0');
    const dayPad = String(day).padStart(2, '0');
    const dateKey = `${currentYear}-${monthPad}-${dayPad}`;

    const hasEvents = CALENDAR_EVENTS.filter(e => e.date === dateKey);
    const isSelected = dateKey === selectedDateStr;
    const isToday = (day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear());

    const cell = document.createElement('button');
    cell.onclick = () => selectCalendarDate(dateKey);
    
    let cellClass = 'h-9 sm:h-10 rounded-lg text-xs font-semibold flex flex-col items-center justify-center relative transition active:scale-95 border ';
    
    if (isSelected) {
      cellClass += 'bg-tagsci-800 text-white border-tagsci-600 shadow-sm ';
    } else if (isToday) {
      cellClass += 'bg-g11pink-100 dark:bg-g11pink-950/60 text-g11pink-700 dark:text-g11pink-300 border-g11pink-400 font-bold ';
    } else {
      cellClass += 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 ';
    }

    cell.className = cellClass;
    cell.innerHTML = `
      <span>${day}</span>
      ${hasEvents.length > 0 ? `<span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-g11pink-400' : 'bg-g11pink-500'} mt-0.5"></span>` : ''}
    `;
    grid.appendChild(cell);
  }

  renderEventsList();
}

export function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

export function selectCalendarDate(dateKey) {
  selectedDateStr = dateKey;
  renderCalendar();
}

export function renderEventsList() {
  const container = document.getElementById('eventsList');
  const title = document.getElementById('selectedDateTitle');
  if (!container || !title) return;
  
  const filtered = CALENDAR_EVENTS.filter(e => e.date === selectedDateStr);
  title.textContent = `Schedule for ${selectedDateStr}`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-xs text-slate-400 dark:text-slate-500 py-3 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        No deadlines scheduled for this date.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(evt => {
    const isTagSci = evt.subject === 'TagSci' || evt.tag === 'TagSci';
    const isDepEd = evt.subject === 'DepEd' || evt.tag === 'DepEd';
    let subjectBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    if (isTagSci) {
      subjectBadgeClass = 'bg-tagsci-100 text-tagsci-800 dark:bg-tagsci-950 dark:text-tagsci-300 font-bold border border-tagsci-300 dark:border-tagsci-800';
    } else if (isDepEd) {
      subjectBadgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-300 dark:border-blue-800';
    } else if (evt.subject) {
      subjectBadgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    }

    return `
      <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border ${isTagSci ? 'border-tagsci-400 dark:border-tagsci-800' : isDepEd ? 'border-blue-400 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'} flex items-start justify-between space-x-2">
        <div class="flex-1">
          <div class="flex items-center space-x-1.5 flex-wrap gap-1">
            <span class="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${subjectBadgeClass}">
              ${evt.subject || (isTagSci ? 'TagSci' : isDepEd ? 'DepEd' : 'Event')}
            </span>
            <span class="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-g11pink-100 text-g11pink-700 dark:bg-g11pink-950 dark:text-g11pink-300">
              ${evt.badge || evt.type || 'Event'}
            </span>
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">${evt.title}</h4>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${evt.desc || ''}</p>
        </div>
      </div>
    `;
  }).join('');
}
