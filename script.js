const button = document.getElementById('cta-button');
const hero = document.querySelector('.hero');
const messages = [
  'Subagents deployed another payload! 🚀',
  'All edits delivered via sandboxed workflows. ✨',
  'Another iteration shipped without touching main. 🔁',
  'Automation makes the dream work. 🤖',
];

let idx = 0;

function createToast(text) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

button.addEventListener('click', () => {
  hero.classList.add('pulse');
  setTimeout(() => hero.classList.remove('pulse'), 320);

  createToast(messages[idx]);
  idx = (idx + 1) % messages.length;
});

const style = document.createElement('style');
const styleRules = [
  '.toast {',
  '  position: fixed;',
  '  top: 2rem;',
  '  right: 2rem;',
  '  padding: 0.9rem 1.35rem;',
  '  background: rgba(56, 189, 248, 0.95);',
  '  color: #0f172a;',
  '  border-radius: 999px;',
  '  box-shadow: 0 16px 32px rgba(56, 189, 248, 0.35);',
  '  opacity: 0;',
  '  transform: translateY(-20px);',
  '  transition: opacity 0.2s ease, transform 0.2s ease;',
  '  font-weight: 600;',
  '}',
  '',
  '.toast.visible {',
  '  opacity: 1;',
  '  transform: translateY(0);',
  '}',
  '',
  '.hero.pulse {',
  '  animation: heroPulse 0.32s ease;',
  '}',
  '',
  '@keyframes heroPulse {',
  '  0% { transform: scale(1); }',
  '  40% { transform: scale(1.01); }',
  '  70% { transform: scale(0.995); }',
  '  100% { transform: scale(1); }',
  '}',
].join('
');

style.textContent = styleRules;
document.head.appendChild(style);
// === Enhancements (appended by apply_agents) ===
(function(){
  const toTop = document.getElementById('to-top');
  if(toTop){\n    const toggle =()=>{ toTop.hidden = (window.scrollY < 400); };
    window.addEventListener('scroll', toggle,{passive:true});
    toTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
    toggle();
  }
  const form = document.getElementById('sub-form');
  if(form){
    const email = document.getElementById('sub-email');
    const msg = document.getElementById('sub-msg');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const value = (email.value||'').trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      msg.classList.remove('visually-hidden');
      if(ok){ msg.textContent = 'Спасибо! Мы отправили письмо для подтверждения.'; msg.style.color='var(--accent,#0ea5e9)'; form.reset(); }
      else { msg.textContent = 'Введите корректный email.'; msg.style.color='tomato'; email.focus(); }
    });
  }
  // Keyboard shortcuts hint (press ?)
  let hintShown=false;document.addEventListener('keydown',(e)=>{if(e.key==='?'&&!hintShown){alert('Сокращения: T — смена темы, ↑ — вверх');hintShown=true;}});
})();
// === End enhancements ===