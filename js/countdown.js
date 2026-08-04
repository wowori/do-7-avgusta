/**
 * countdown.js — отсчёт до 7 августа 2026 года 19:00 MSK
 *
 * Минимализм: без частиц и конфетти — только таймер и прогресс-бар.
 */

// ────────────────────────────────────────
// 1. КОНСТАНТЫ
// ────────────────────────────────────────

const TARGET_DATE = new Date('2026-08-07T19:00:00+03:00'); // MSK (UTC+3)
const EPOCH_2026  = new Date('2026-01-01T00:00:00+03:00'); // начало отсчёта прогресса

// ────────────────────────────────────────
// 2. DOM-ССЫЛКИ
// ────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);

const elDays      = $('#days');
const elHours     = $('#hours');
const elMinutes   = $('#minutes');
const elSeconds   = $('#seconds');
const elProgress  = $('#progress-fill');
const elPercent   = $('#progress-percent');
const elCountdown = $('#countdown');

// ────────────────────────────────────────
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ────────────────────────────────────────

/** Форматирует число с ведущим нулём до двух знаков. */
function pad(n) {
  return String(n).padStart(2, '0');
}

/** Разница в мс между целью и сейчас (никогда не бывает < 0). */
function getRemaining() {
  return Math.max(TARGET_DATE - new Date(), 0);
}

// ────────────────────────────────────────
// 4. ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
// ────────────────────────────────────────

let prevValues = { days: null, hours: null, minutes: null, seconds: null };

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Плавный «разворот» цифры из нижней грани (как у flip-часов):
 * старая цифра видна до последнего момента, смена значения скрыта
 * в складке, новая цифра разворачивается снизу вверх.
 * Web Animations API — перезапуск гарантирован, без классов и reflow.
 */
function flipDigit(el) {
  if (prefersReducedMotion) return;
  // Отменяем предыдущую анимацию, если ещё идёт
  el.getAnimations().forEach((a) => a.cancel());
  el.animate(
    [
      { transform: 'perspective(600px) rotateX(88deg)', opacity: 0.4 },
      { transform: 'perspective(600px) rotateX(0deg)',  opacity: 1 },
    ],
    {
      duration: 420,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      transformOrigin: '50% 100%', // нижняя грань
    }
  );
}

function updateCountdown() {
  const remaining = getRemaining();

  if (remaining <= 0) {
    // ── Отсчёт завершён ──
    elCountdown.innerHTML = '<p class="final-message">Время пришло</p>';
    if (elProgress) elProgress.style.width = '100%';
    if (elPercent)  elPercent.textContent  = '100%';
    return;
  }

  // Вычисляем компоненты
  const totalSec = Math.floor(remaining / 1000);
  const days     = Math.floor(totalSec / 86400);
  const hours    = Math.floor((totalSec % 86400) / 3600);
  const minutes  = Math.floor((totalSec % 3600) / 60);
  const seconds  = totalSec % 60;

  const values = {
    days:    String(days),      // без ведущего нуля — их может быть много
    hours:   pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };

  const els = { days: elDays, hours: elHours, minutes: elMinutes, seconds: elSeconds };

  for (const key of Object.keys(els)) {
    if (els[key] && prevValues[key] !== values[key]) {
      els[key].textContent = values[key];
      // При первом рендере не анимируем — только при реальной смене
      if (prevValues[key] !== null) flipDigit(els[key]);
      prevValues[key] = values[key];
    }
  }
}

// ────────────────────────────────────────
// 5. ПРОГРЕСС-БАР
// ────────────────────────────────────────

function updateProgress() {
  const now      = new Date();
  const total    = TARGET_DATE - EPOCH_2026;          // полный промежуток
  const elapsed  = now - EPOCH_2026;                  // уже прошло
  const fraction = Math.min(Math.max(elapsed / total, 0), 1);
  const percent  = Math.round(fraction * 100);

  if (elProgress) elProgress.style.width = `${fraction * 100}%`;
  if (elPercent)  elPercent.textContent  = `${percent}%`;
}

// ────────────────────────────────────────
// 6. ЗАПУСК
// ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Первичное обновление таймера и прогресса
  updateCountdown();
  updateProgress();

  // Запуск интервалов
  setInterval(updateCountdown, 1000);
  setInterval(updateProgress, 1000);
});
