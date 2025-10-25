const button = document.getElementById('cta');
const hero = document.querySelector('.hero');
const messages = [
  'Subagents orchestrated this site without ручного ввода',
  'Worktrees создаются автоматически и подчёркивают zero-touch',
  'HTTP сервис даёт /metrics и streaming logs',
];
let idx = 0;

function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 350);
  }, 3000);
}

button?.addEventListener('click', () => {
  hero.classList.add('pulse');
  setTimeout(() => hero.classList.remove('pulse'), 450);
  toast(messages[idx]);
  idx = (idx + 1) % messages.length;
});

const style = document.createElement('style');
style.textContent = `
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: rgba(56, 189, 248, 0.95);
  color: #031525;
  padding: 0.85rem 1.25rem;
  border-radius: 999px;
  box-shadow: 0 16px 40px rgba(56, 189, 248, 0.35);
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-weight: 600;
}
.toast.visible {
  opacity: 1;
  transform: translateY(0);
}
.hero.pulse {
  animation: heroPulse 0.45s ease;
}
@keyframes heroPulse {
  0% { transform: scale(1); }
  40% { transform: scale(1.02); }
  100% { transform: scale(1); }
}`;

document.head.appendChild(style);
