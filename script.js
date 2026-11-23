'use strict';

/* ================= 1. ДАННЫЕ ================= */

const WORDS = {
  ru: 'время человек работа слово жизнь день рука глаз дом мир город вода земля голова друг ночь свет страна дело путь книга мысль вопрос ответ часть место сила имя тишина ветер огонь река лес окно дорога утро вечер школа музыка память сон цвет звук слой ключ точка линия форма проект код экран быстро просто всегда иногда внимание движение скорость ритм навык печать'.split(' '),
  en: 'time people work word life day hand eye home world city water earth head friend night light country way book thought answer part place power name silence wind fire river forest window road morning evening school music memory dream color sound layer key point line shape project code screen quickly simply always often focus motion speed rhythm skill typing'.split(' ')
};

const QUOTES = {
  ru: {
    short: ['Тише едешь - дальше будешь.', 'Повторение - мать учения.'],
    medium: [
      'Лучше один раз увидеть, чем сто раз услышать. Знание становится силой только тогда, когда его применяют на практике.',
      'Молодость - как тарелка, полная сластей. Люди сентиментальные уверяют, что хотели бы вернуться в то простое чистое состояние.'
    ],
    long: [
      'Быстрая печать - это не просто навык, это способ мыслить быстрее, чем слова успевают появляться в голове. Чем меньше внимания уходит на поиск клавиш, тем больше его остаётся на смысл написанного, и тем легче превращать идеи в текст.'
    ]
  },
  en: {
    short: ['Practice makes perfect.', 'Simplicity is the soul of efficiency.'],
    medium: [
      'The best way to predict the future is to invent it. Small steps repeated every day will always beat a single great effort.',
      'Fast typing is not just a skill, it is a way of thinking faster than the words can appear in your head.'
    ],
    long: [
      'Good software is built from many small decisions. Each line of code is a tiny promise to the next person who reads it, and the habit of keeping those promises is what separates a quick experiment from a project that lasts for years.'
    ]
  }
};

const T = {
  ru: {
    punct: '@ знаки', nums: '# числа', time: '◷ время',
    words: 'A слова', quote: '❝ цитата',
    all: 'все', short: 'короткие', medium: 'средние', long: 'long',
    h1: '— перезапуск', h2: '— настройки',
    hist: 'история', sett: 'настройки',
    settings: 'Настройки', theme: 'Тема', font: 'Шрифт',
    sound: 'Звук ввода', soundErr: 'Звук ошибок',
    close: 'Закрыть', clear: 'очистить историю',
    shadow: 'тёмная', light: 'светлая', ocean: 'цветная',
    empty: 'Пока нет результатов',
    type: 'режим', time2: 'время', chars: 'символы'
  },
  en: {
    punct: '@ punctuation', nums: '# numbers', time: '◷ time',
    words: 'A words', quote: '❝ quote',
    all: 'all', short: 'short', medium: 'medium', long: 'long',
    h1: '— restart', h2: '— settings',
    hist: 'history', sett: 'settings',
    settings: 'Settings', theme: 'Theme', font: 'Font',
    sound: 'Key sound', soundErr: 'Error sound',
    close: 'Close', clear: 'clear history',
    shadow: 'dark', light: 'light', ocean: 'ocean',
    empty: 'No results yet',
    type: 'test type', time2: 'time', chars: 'characters'
  }
};

const OPTIONS = {
  time: [5, 15, 30, 60, 120],
  words: [10, 25, 50, 100],
  quote: ['all', 'short', 'medium', 'long']
};

/* ================= 2. НАСТРОЙКИ ================= */

const DEFAULTS = {
  lang: 'ru',
  mode: 'time',
  time: 30,
  words: 25,
  quote: 'all',
  punct: false,
  nums: false,
  theme: 'shadow',
  font: "'Comfortaa'",
  sound: 'lofi',
  soundErr: 'thump'
};

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const cfg = {
  ...DEFAULTS,
  ...load('ft_settings_v4', {})
};

let history = load('ft_history_v4', []);

const saveCfg = () => {
  localStorage.setItem('ft_settings_v4', JSON.stringify(cfg));
};

const $ = id => document.getElementById(id);
const tr = key => T[cfg.lang][key];

/* ================= 3. ЗВУКИ (РАСШИРЕННЫЙ НАБОР) ================= */

let audio;

function initAudio() {
  if (!audio) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audio = new AudioContextClass();
  }
  if (audio.state === 'suspended') audio.resume();
}

function playTone(freq, duration, type, volume, endMultiplier) {
  initAudio();
  if (!audio) return;

  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(1, freq * endMultiplier),
    audio.currentTime + duration
  );

  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(audio.destination);

  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

function playKeySound() {
  const sounds = {
    lofi: [240, 0.11, 'sine', 0.08, 0.7],
    wood: [420, 0.05, 'triangle', 0.05, 0.7],
    click: [1250, 0.025, 'triangle', 0.04, 0.7],
    retro: [520, 0.04, 'sawtooth', 0.03, 0.7],
    typewriter: [900, 0.03, 'square', 0.05, 0.5],
    bubble: [350, 0.07, 'sine', 0.07, 1.3],
    soft: [180, 0.1, 'sine', 0.06, 0.8],
    pop: [600, 0.04, 'triangle', 0.06, 0.4],
    beep: [880, 0.04, 'square', 0.03, 1.0],
    marimba: [523.25, 0.08, 'sine', 0.07, 0.6],
    glass: [1400, 0.03, 'sine', 0.04, 0.2]
  };

  if (cfg.sound === 'off') return;
  const sound = sounds[cfg.sound] || sounds.lofi;
  playTone(...sound);
}

function playErrorSound() {
  const sounds = {
    thump: [130, 0.12, 'sine', 0.08, 0.45],
    beep: [380, 0.05, 'square', 0.04, 0.45],
    pop: [220, 0.08, 'triangle', 0.07, 0.45],
    double: [150, 0.1, 'sawtooth', 0.05, 0.3],
    low: [90, 0.15, 'sine', 0.1, 0.6],
    wood: [260, 0.06, 'triangle', 0.06, 0.5]
  };

  if (cfg.soundErr === 'off') return;
  const sound = sounds[cfg.soundErr] || sounds.thump;
  playTone(...sound);
}

/* ================= 4. ГЕНЕРАЦИЯ ТЕКСТА ================= */

const rnd = n => Math.floor(Math.random() * n);

function decorate(array) {
  if (cfg.nums) {
    array = array.map(word => Math.random() < 0.12 ? String(10 + rnd(9000)) : word);
  }

  if (!cfg.punct) return array;

  let capitalize = true;

  return array.map(word => {
    if (/^\d+$/.test(word)) return word;

    if (capitalize) {
      word = word[0].toUpperCase() + word.slice(1);
      capitalize = false;
    }

    const random = Math.random();

    if (random < 0.08) {
      word += '.';
      capitalize = true;
    } else if (random < 0.16) {
      word += ',';
    } else if (random < 0.19) {
      word += '?';
      capitalize = true;
    }

    return word;
  });
}

function makeWords() {
  if (cfg.mode === 'quote') {
    const quoteSet = QUOTES[cfg.lang];
    const pool = cfg.quote === 'all'
      ? [...quoteSet.short, ...quoteSet.medium, ...quoteSet.long]
      : quoteSet[cfg.quote];

    return pool[rnd(pool.length)].split(' ');
  }

  const list = WORDS[cfg.lang];
  const count = cfg.mode === 'time' ? 300 : cfg.words;
  const output = [];

  while (output.length < count) {
    const word = list[rnd(list.length)];
    if (word !== output[output.length - 1]) {
      output.push(word);
    }
  }

  return decorate(output);
}

/* ================= 5. СОСТОЯНИЕ ТЕСТА ================= */

let words = [];
let wordEls = [];
let typedWords = [];
let wi = 0;
let cur = '';

let started = false;
let finished = false;
let startTime = 0;
let timer = null;
let keys = 0;
let errors = 0;

let liveWpmHistory = [];

function newTest() {
  clearInterval(timer);

  words = makeWords();
  typedWords = [];
  wi = 0;
  cur = '';

  started = false;
  finished = false;
  keys = 0;
  errors = 0;
  liveWpmHistory = [];

  $('words').innerHTML =
    '<div id="caret"></div>' +
    words.map(word =>
      `<span class="w">${[...word].map(char => `<span class="l">${char}</span>`).join('')}</span> `
    ).join('');

  wordEls = [...document.querySelectorAll('.w')];
  $('words').style.transform = '';
  document.body.classList.remove('focus');

  $('testView').hidden = false;
  $('resultView').hidden = true;

  updateLive();
  moveCaret();
}

function paintWord(index) {
  if (!wordEls[index]) return;

  const word = words[index];
  const typed = index < wi ? typedWords[index] : index === wi ? cur : '';
  const element = wordEls[index];

  element.querySelectorAll('.extra').forEach(el => el.remove());

  [...element.querySelectorAll('.l')].forEach((span, i) => {
    span.className = 'l' + (i < typed.length ? (typed[i] === word[i] ? ' ok' : ' bad') : '');
  });

  for (let k = word.length; k < typed.length; k++) {
    const span = document.createElement('span');
    span.className = 'l extra';
    span.textContent = typed[k];
    element.appendChild(span);
  }

  element.classList.toggle('err', index < wi && typed !== word);
}

function moveCaret() {
  if (!wordEls[wi]) return;

  const letters = wordEls[wi].querySelectorAll('.l');
  if (!letters.length) return;

  const box = $('words').getBoundingClientRect();
  const atEnd = cur.length >= letters.length;
  const letter = letters[Math.min(cur.length, letters.length - 1)];
  const rect = letter.getBoundingClientRect();
  const caret = $('caret');
  const lineHeight = parseFloat(getComputedStyle($('words')).lineHeight);
  const top = rect.top - box.top;

  caret.style.left = ((atEnd ? rect.right : rect.left) - box.left) + 'px';
  caret.style.top = (top + (rect.height - caret.offsetHeight) / 2) + 'px';

  const line = Math.round(top / lineHeight);
  $('words').style.transform = `translateY(-${Math.max(0, line - 1) * lineHeight}px)`;
}

function calc() {
  let correct = 0;

  for (let i = 0; i < wi; i++) {
    if (typedWords[i] === words[i]) {
      correct += words[i].length + 1;
    }
  }

  const currentWord = words[wi] || '';
  for (let i = 0; i < cur.length; i++) {
    if (cur[i] === currentWord[i]) correct++;
  }

  const sec = Math.max((Date.now() - startTime) / 1000, 0.1);

  return {
    wpm: started ? Math.round(correct / 5 / (sec / 60)) : 0,
    acc: keys ? Math.round((1 - errors / keys) * 1000) / 10 : 100,
    sec
  };
}

const fmt = seconds =>
  Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');

function updateLive() {
  if (cfg.mode === 'time') {
    $('live').textContent = started ? Math.max(Math.ceil(cfg.time - calc().sec), 0) : cfg.time;
  } else {
    $('live').textContent = wi + '/' + words.length;
  }
}

/* ================= 6. ЗАПИСЬ СКОРОСТИ ================= */

function recordWpm() {
  const result = calc();
  const point = { t: result.sec, wpm: result.wpm, errors };
  const last = liveWpmHistory[liveWpmHistory.length - 1];

  if (last && Math.abs(last.t - point.t) < 0.001) {
    liveWpmHistory[liveWpmHistory.length - 1] = point;
  } else {
    liveWpmHistory.push(point);
  }
}

function start() {
  if (started || finished) return;

  started = true;
  startTime = Date.now();
  liveWpmHistory = [{ t: 0, wpm: 0, errors: 0 }];

  timer = setInterval(() => {
    recordWpm();
    updateLive();
    const result = calc();
    if (cfg.mode === 'time' && result.sec >= cfg.time) {
      finish();
    }
  }, 250);
}

function finish() {
  if (finished) return;
  clearInterval(timer);

  const result = calc();
  if (started) recordWpm();

  if (!liveWpmHistory.length) {
    liveWpmHistory.push({ t: 0, wpm: 0, errors: 0 });
  }

  finished = true;
  cur = '';
  document.body.classList.remove('focus');

  history.push({
    wpm: result.wpm,
    acc: result.acc,
    time: cfg.mode === 'time' ? cfg.time : Math.max(1, Math.round(result.sec)),
    mode: cfg.mode,
    val: cfg[cfg.mode],
    lang: cfg.lang,
    chars: keys - errors,
    err: errors,
    date: Date.now(),
    wpmHistory: [...liveWpmHistory]
  });

  history = history.slice(-50);
  localStorage.setItem('ft_history_v4', JSON.stringify(history));
  showResults();
}

/* ================= 7. ВВОД ================= */

function onChar(char) {
  if (finished) return;
  if (!started) start();
  document.body.classList.add('focus');

  if (char === ' ') {
    if (!cur) return;
    typedWords[wi] = cur;
    wi++;
    cur = '';
    paintWord(wi - 1);
    playKeySound();

    if (wi >= words.length) {
      finish();
      return;
    }
  } else {
    if (cur.length >= words[wi].length + 8) return;

    const incorrect = char !== words[wi][cur.length];
    keys++;
    if (incorrect) errors++;

    cur += char;
    paintWord(wi);

    if (incorrect) playErrorSound();
    else playKeySound();

    if (cfg.mode !== 'time' && wi === words.length - 1 && cur === words[wi]) {
      typedWords[wi] = cur;
      wi++;
      finish();
      return;
    }
  }

  moveCaret();
  updateLive();
}

document.addEventListener('keydown', event => {
  // Нажатие Escape открывает/закрывает настройки или возвращает на главную
  if (event.key === 'Escape') {
    const modal = $('settings');
    if (modal) {
      if (!modal.hidden) {
        modal.hidden = true;
      } else {
        modal.hidden = false;
      }
    }
    return;
  }

  if (event.ctrlKey && event.shiftKey && event.code === 'KeyP') {
    event.preventDefault();
    const modal = $('settings');
    modal.hidden = !modal.hidden;
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    newTest();
    return;
  }

  if (!$('settings').hidden || event.ctrlKey || event.metaKey || event.altKey) return;

  if (!$('resultView').hidden) {
    if (event.key === 'Enter') newTest();
    return;
  }

  if (event.key === 'Backspace') {
    event.preventDefault();
    if (finished) return;

    if (cur.length > 0) {
      cur = cur.slice(0, -1);
      paintWord(wi);
    } else if (wi > 0) {
      wi--;
      cur = typedWords[wi] || '';
      typedWords[wi] = undefined;
      if (wordEls[wi]) wordEls[wi].classList.remove('err');
      paintWord(wi);
    }

    moveCaret();
    updateLive();
  } else if (event.key.length === 1) {
    event.preventDefault();
    onChar(event.key);
  }
});

document.addEventListener('mousemove', () => {
  document.body.classList.remove('focus');
});

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button) button.blur();
});

/* ================= 8. ГРАФИК РЕЗУЛЬТАТОВ ================= */

function buildChart(result) {
  const chart = $('chart');
  chart.replaceChildren();

  if (!result || !Array.isArray(result.wpmHistory) || !result.wpmHistory.length) return;

  let data = result.wpmHistory.map((point, index) => {
    if (typeof point === 'number') {
      return { t: index, wpm: point, errors: 0 };
    }
    return {
      t: Number(point.t ?? index),
      wpm: Number(point.wpm ?? 0),
      errors: Number(point.errors ?? 0)
    };
  });

  data = data.filter(p => Number.isFinite(p.t) && Number.isFinite(p.wpm)).sort((a, b) => a.t - b.t);
  data = data.filter((p, i) => i === 0 || p.t > data[i - 1].t);

  if (!data.length) return;

  const W = 1000, H = 220;
  const pad = { top: 14, right: 42, bottom: 28, left: 48 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const duration = Math.max(Number(result.time) || 0, ...data.map(p => p.t), 1);
  const peak = Math.max(...data.map(p => p.wpm), 0);
  const maxWpm = Math.max(50, Math.ceil(peak / 50) * 50);

  const x = time => pad.left + (time / duration) * plotW;
  const y = wpm => pad.top + plotH - (Math.max(0, Math.min(maxWpm, wpm)) / maxWpm) * plotH;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'result-chart');

  function add(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    svg.appendChild(el);
    return el;
  }

  for (let i = 0; i <= 4; i++) {
    const value = maxWpm * (1 - i / 4);
    const yy = y(value);
    add('line', { x1: pad.left, y1: yy, x2: W - pad.right, y2: yy, class: 'chart-grid' });
    const label = add('text', { x: pad.left - 9, y: yy + 4, 'text-anchor': 'end', class: 'chart-label' });
    label.textContent = Math.round(value);
  }

  const step = duration <= 15 ? 2 : duration <= 30 ? 5 : duration <= 60 ? 10 : 15;
  const ticks = [];
  for (let t = 0; t < duration; t += step) ticks.push(t);
  if (!ticks.length || ticks[ticks.length - 1] !== duration) ticks.push(duration);

  ticks.forEach(time => {
    const xx = x(time);
    add('line', { x1: xx, y1: pad.top, x2: xx, y2: H - pad.bottom, class: 'chart-grid chart-grid-vertical' });
    const label = add('text', { x: xx, y: H - 8, 'text-anchor': 'middle', class: 'chart-label' });
    label.textContent = `${Math.round(time)}s`;
  });

  if (data[0].t > 0) data.unshift({ t: 0, wpm: 0, errors: 0 });
  if (data.length === 1) data.push({ t: duration, wpm: data[0].wpm, errors: data[0].errors });

  const points = data.map(p => ({ x: x(p.t), y: y(p.wpm), t: p.t, wpm: p.wpm }));

  function makeCurve(pts) {
    if (!pts.length) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const dx = (p2.x - p1.x) / 6;
      const minY = Math.min(p1.y, p2.y);
      const maxY = Math.max(p1.y, p2.y);
      const c1y = Math.max(minY, Math.min(maxY, p1.y + (p2.y - p0.y) / 6));
      const c2y = Math.max(minY, Math.min(maxY, p2.y - (p3.y - p1.y) / 6));
      path += ` C ${p1.x + dx} ${c1y}, ${p2.x - dx} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }

  const linePath = makeCurve(points);
  const baseline = H - pad.bottom;
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${baseline}` + ` L ${points[0].x} ${baseline} Z`;

  add('path', { d: areaPath, class: 'chart-area' });
  add('path', { d: linePath, class: 'chart-line' });

  points.forEach(p => {
    add('circle', { cx: p.x, cy: p.y, r: 2.2, class: 'chart-dot' });
  });

  add('line', {
    x1: pad.left, y1: y(result.wpm),
    x2: W - pad.right, y2: y(result.wpm),
    class: 'chart-average'
  });

  chart.appendChild(svg);
}

/* ================= 9. РЕЗУЛЬТАТЫ ================= */

function showResults() {
  $('testView').hidden = true;
  $('resultView').hidden = false;

  const result = history[history.length - 1];

  $('rWpm').textContent = result ? result.wpm : '–';
  $('rAcc').textContent = result ? Math.round(result.acc) + '%' : '–';

  $('rMeta').innerHTML = result
    ? `<div>${tr('type')}<b>${result.mode} ${result.val}<br>${result.lang === 'ru' ? 'russian' : 'english'}</b></div>
       <div>${tr('time2')}<b>${fmt(result.time)}</b></div>
       <div>${tr('chars')}<b>${result.chars}/${result.err}</b></div>`
    : `<div>${tr('empty')}</div>`;

  buildChart(result);

  $('historyList').innerHTML = [...history]
    .reverse()
    .slice(0, 10)
    .map(item =>
      `<li>
        <span>${new Date(item.date).toLocaleString()}</span>
        <span>${item.mode} ${item.val} · ${item.lang}</span>
        <span>${item.wpm} wpm · ${Math.round(item.acc)}%</span>
      </li>`
    ).join('');
}

/* ================= 10. ИНТЕРФЕЙС ================= */

function renderConfig() {
  document.querySelectorAll('[data-x]').forEach(button => {
    button.textContent = tr(button.dataset.x);
    button.classList.toggle('active', cfg[button.dataset.x]);
  });

  document.querySelectorAll('[data-mode]').forEach(button => {
    button.textContent = tr(button.dataset.mode);
    button.classList.toggle('active', button.dataset.mode === cfg.mode);
  });

  $('gExtra').classList.toggle('off', cfg.mode === 'quote');

  $('gValue').innerHTML = OPTIONS[cfg.mode]
    .map(value =>
      `<button type="button" data-v="${value}" class="${String(cfg[cfg.mode]) === String(value) ? 'active' : ''}">${
        cfg.mode === 'quote' ? tr(value) : value
      }</button>`
    ).join('');
}

function applySettings() {
  document.documentElement.dataset.theme = cfg.theme;
  document.documentElement.lang = cfg.lang;
  
  document.documentElement.style.setProperty('--font-family', cfg.font);
  document.documentElement.style.setProperty('--font', cfg.font);

  $('langName').textContent = cfg.lang === 'ru' ? 'russian' : 'english';

  document.querySelectorAll('#themeSwitch button').forEach(button => {
    button.textContent = tr(button.dataset.theme);
    button.classList.toggle('active', button.dataset.theme === cfg.theme);
  });

  $('fontSelect').value = cfg.font;
  $('soundSelect').value = cfg.sound;
  $('soundErrSelect').value = cfg.soundErr;

  $('h1').textContent = tr('h1');
  $('h2').textContent = tr('h2');
  $('btnHistory').textContent = $('fHist').textContent = tr('hist');
  $('fSet').textContent = tr('sett');
  $('fTheme').textContent = '◐ ' + cfg.theme;

  $('tSettings').textContent = tr('settings');
  $('tTheme').textContent = tr('theme');
  $('tFont').textContent = tr('font');
  $('tSound').textContent = tr('sound');
  $('tSoundErr').textContent = tr('soundErr');
  $('btnClose').textContent = tr('close');
  $('btnClear').textContent = tr('clear');

  renderConfig();
  saveCfg();
}

/* ================= 11. СОБЫТИЯ ================= */

// Клик по логотипу — возврат на главный экран и новый тест
$('logo').onclick = event => {
  event.preventDefault();
  const modal = $('settings');
  if (modal) modal.hidden = true;
  newTest();
};

$('gExtra').onclick = event => {
  const key = event.target.dataset.x;
  if (key) {
    cfg[key] = !cfg[key];
    applySettings();
    newTest();
  }
};

$('gMode').onclick = event => {
  const mode = event.target.dataset.mode;
  if (mode) {
    cfg.mode = mode;
    applySettings();
    newTest();
  }
};

$('gValue').onclick = event => {
  const value = event.target.dataset.v;
  if (value) {
    cfg[cfg.mode] = cfg.mode === 'quote' ? value : +value;
    applySettings();
    newTest();
  }
};

$('langBtn').onclick = () => {
  cfg.lang = cfg.lang === 'ru' ? 'en' : 'ru';
  applySettings();
  newTest();
};

$('themeSwitch').onclick = event => {
  const theme = event.target.dataset.theme;
  if (theme) {
    cfg.theme = theme;
    applySettings();
  }
};

$('fontSelect').onchange = event => {
  cfg.font = event.target.value;
  applySettings();
  document.fonts.ready.then(moveCaret);
};

$('soundSelect').onchange = event => {
  cfg.sound = event.target.value;
  applySettings();
  playKeySound();
};

$('soundErrSelect').onchange = event => {
  cfg.soundErr = event.target.value;
  applySettings();
  playErrorSound();
};

const openSettings = () => {
  $('settings').hidden = false;
};

$('btnSettings').onclick = $('fSet').onclick = $('fTheme').onclick = openSettings;

const closeSettings = () => {
  $('settings').hidden = true;
};

$('btnClose').onclick = closeSettings;
$('btnCloseBottom').onclick = closeSettings;

$('settings').onclick = event => {
  if (event.target.id === 'settings') {
    closeSettings();
  }
};

$('btnHistory').onclick = $('fHist').onclick = showResults;
$('restart').onclick = $('btnAgain').onclick = newTest;

$('btnClear').onclick = () => {
  history = [];
  localStorage.removeItem('ft_history_v4');
  showResults();
};

window.addEventListener('resize', () => {
  if (!$('testView').hidden) {
    moveCaret();
  }
});

/* ================= 12. СТАРТ ================= */

applySettings();
document.fonts.ready.then(newTest);