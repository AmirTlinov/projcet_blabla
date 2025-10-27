document.addEventListener('DOMContentLoaded',()=>console.log('ready'))
(function(){
  const toTop = document.getElementById('to-top');
  if(toTop){ const toggle =()=>{ toTop.hidden = (window.scrollY < 400) }; window.addEventListener('scroll', toggle,{passive:true}); toTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'})); toggle(); }
  const form = document.getElementById('sub-form');
  if(form){ const email = document.getElementById('sub-email'); const msg = document.getElementById('sub-msg'); form.addEventListener('submit',(e)=>{ e.preventDefault(); const v=(email.value||'').trim(); const ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); msg.classList.remove('visually-hidden'); if(ok){ msg.textContent='Спасибо! Мы отправили письмо для подтверждения.'; msg.style.color='var(--accent,#0ea5e9)'; form.reset(); } else { msg.textContent='Введите корректный email.'; msg.style.color='tomato'; email.focus(); } }); }
})();