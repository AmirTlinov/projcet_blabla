const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const themeKey = 'subagents.theme';
const getTheme = () => localStorage.getItem(themeKey) || 'auto';
const applyTheme = (t) => { document.body.dataset.theme = t; };

const installThemeToggle = () => {
  const btn = document.getElementById('toggle-theme');
  if (!btn) return;
  const cycle = { auto: 'dark', dark: 'light', light: 'auto' };
  const label = { auto: 'Тема: авто', dark: 'Тема: тёмная', light: 'Тема: светлая' };
  let t = getTheme();
  applyTheme(t);
  btn.textContent = 'Тема';
  btn.setAttribute('aria-pressed', String(t === 'dark' || (t==='auto' && prefersDark)));
  btn.addEventListener('click', () => {
    t = cycle[t] || 'auto';
    localStorage.setItem(themeKey, t);
    applyTheme(t);
    btn.setAttribute('aria-pressed', String(t === 'dark' || (t==='auto' && prefersDark)));
  });
};

const log = (s) => {
  const ol = document.querySelector('[data-log-stream]');
  if (!ol) return;
  const li = document.createElement('li');
  li.textContent = s + ' · ' + new Date().toLocaleTimeString();
  ol.appendChild(li);
  while (ol.children.length > 8) ol.removeChild(ol.firstElementChild);
};

const updateMetrics = () => {
  $$('[data-metric]').forEach(el => {
    const min = Number(el.dataset.min || 0);
    const max = Number(el.dataset.max || 100);
    const suffix = el.nextElementSibling?.textContent?.trim() || '';
    const val = (Math.random()*(max-min)+min);
    el.textContent = (suffix === '$' ? val.toFixed(2) : Math.round(val));
  });
};

const runCommand = () => {
  const input = document.getElementById('command-input');
  const out = document.getElementById('terminal-output');
  if (!input || !out) return;
  const cmd = input.value.trim();
  if (!cmd) return;
  const line = document.createElement('div');
  line.textContent = `$ ${cmd}`;
  out.appendChild(line);
  input.value = '';
  out.scrollTop = out.scrollHeight;
  // Demo responses (deterministic snippets)
  if (cmd.includes('patch --summary-only')) {
    out.appendChild(Object.assign(document.createElement('pre'),{textContent:`{\n  "type":"unified",\n  "updated":["src/app.ts"],\n  "stat":{"added":12,"removed":4}\n}`}));
  } else if (cmd.includes('gh pr-merge')) {
    out.appendChild(Object.assign(document.createElement('pre'),{textContent:`{\n  "merged":true,\n  "auto":true,\n  "method":"squash"\n}`}));
  } else {
    out.appendChild(Object.assign(document.createElement('pre'),{textContent:'ok'}));
  }
};

const smoothScroll = () => {
  $$('[data-scroll]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    const sel = btn.getAttribute('data-scroll');
    const el = sel ? $(sel) : null;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 12, behavior: 'smooth' });
  }));
};

const boot = () => {
  installThemeToggle();
  smoothScroll();
  updateMetrics();
  setInterval(() => { updateMetrics(); log('tick'); }, 5000);
  const run = document.getElementById('run-command');
  if (run) run.addEventListener('click', runCommand);
};

document.addEventListener('DOMContentLoaded', boot);
