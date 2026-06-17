/* ============================================
   PORTFÓLIO — main.js
   Interatividade: scroll reveal + formulário + menu hambúrguer
   ============================================ */

// ── MENU HAMBÚRGUER ──
document.addEventListener('DOMContentLoaded', () => {

  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  function openMenu() {
    hamburger.classList.add('active');
    navLinks.classList.add('open');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // Fecha ao clicar em um link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // ── SCROLL REVEAL ──
  const reveals = document.querySelectorAll('.reveal');

  // FIX: threshold menor para mobile (elementos menores na tela)
  // FIX: rootMargin para disparar antes do elemento sair da área visível
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i % 4) * 0.1 + 's';
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));

  // FIX: fallback — após 1.5s força visibilidade de qualquer elemento
  // que ainda não apareceu (evita botões invisíveis travados no mobile)
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.style.transitionDelay = '0s';
      el.classList.add('visible');
    });
  }, 1500);
});

// ── FORMULÁRIO ──
function handleSubmit(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  const original = btn.textContent;

  btn.textContent = '✓ Mensagem enviada!';
  btn.style.background = '#1a1a25';
  btn.style.color = 'var(--accent)';
  btn.style.border = '1px solid var(--accent)';

  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
    btn.style.color = '';
    btn.style.border = '';
    e.target.reset();
  }, 3000);
}