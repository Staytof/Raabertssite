function toggleMenu(header, menuToggle, mobileMenu) {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  if (isOpen) {
    mobileMenu.hidden = true;
  } else {
    mobileMenu.hidden = false;
  }
}

/** Fecha o menu mobile, se aberto. */
function closeMenu(header, menuToggle, mobileMenu) {
  if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  mobileMenu.hidden = true;
}

/** Configura a sombra/borda do header conforme a rolagem. */
function setupHeaderScroll(header) {
  const onScroll = () => {
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/** Faz as âncoras internas respeitarem o header fixo e o topo real da página. */
function setupSmoothAnchors(menuToggle, mobileMenu) {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      closeMenu(null, menuToggle, mobileMenu);

      const top =
        targetId === '#inicio'
          ? 0
          : Math.max(0, window.scrollY + target.getBoundingClientRect().top - 88);

      window.scrollTo({
        top,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });

      history.pushState(null, '', targetId);
    });
  });
}

/** Anima a entrada das seções quando visíveis. */
function setupReveal() {
  const targets = document.querySelectorAll(
    '.hero-services li, .pillar, .case, .section-copy, .section-visual, .contact-flow li, .contato-card'
  );
  if (!targets.length) return;

  targets.forEach((el) => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/** Bloqueia interações comuns de inspeção, seleção e arraste no site. */
function setupInteractionLocks() {
  document.querySelectorAll('img').forEach((image) => {
    image.setAttribute('draggable', 'false');
  });

  ['contextmenu', 'dragstart', 'selectstart'].forEach((eventName) => {
    document.addEventListener(
      eventName,
      (event) => {
        event.preventDefault();
      },
      { capture: true }
    );
  });

  document.addEventListener(
    'keydown',
    (event) => {
      const key = event.key.toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey;
      const blockedShortcut =
        event.key === 'F12' ||
        (hasModifier && key === 'i') ||
        (hasModifier && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (hasModifier && ['u', 's'].includes(key));

      if (!blockedShortcut) return;

      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true }
  );
}

/** Inicializa todas as interações após o DOM pronto. */
function init() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (header) setupHeaderScroll(header);

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => toggleMenu(header, menuToggle, mobileMenu));

    // Fecha o menu com a tecla Escape.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu(header, menuToggle, mobileMenu);
    });
  }

  if (menuToggle && mobileMenu) setupSmoothAnchors(menuToggle, mobileMenu);
  setupReveal();
  setupInteractionLocks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
