export function initMobileMenu() {
  const menu = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const closeButton = menu?.querySelector('.menu-close');

  if (!menu || !toggle || !closeButton) return;

  const desktop = window.matchMedia('(min-width: 1280px)');
  let scrollY = 0;
  let bodyStyles = '';
  let focusTarget = null;
  let destination = null;

  function closeMenu(target = toggle) {
    if (!menu.open) return;
    focusTarget = target;
    menu.close();
  }

  toggle.addEventListener('click', () => {
    if (menu.open || desktop.matches) return;

    scrollY = window.scrollY;
    bodyStyles = document.body.getAttribute('style');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    menu.classList.add('is-open');
    menu.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  });

  closeButton.addEventListener('click', () => closeMenu());

  menu.addEventListener('click', event => {
    if (event.target === menu) closeMenu();

    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      destination = link.getAttribute('href');
      target.setAttribute('tabindex', '-1');
      closeMenu(target);
    }
  });

  menu.addEventListener('cancel', event => {
    event.preventDefault();
    closeMenu();
  });

  menu.addEventListener('close', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');

    if (bodyStyles === null) {
      document.body.removeAttribute('style');
    } else {
      document.body.setAttribute('style', bodyStyles);
    }

    window.scrollTo({ top: scrollY, behavior: 'instant' });
    (focusTarget ?? toggle).focus({ preventScroll: true });
    if (destination && focusTarget) {
      window.history.pushState(null, '', destination);
      focusTarget.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
    }
    destination = null;
    focusTarget = null;
  });

  menu.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;

    const elements = [...menu.querySelectorAll('button, a[href]')];
    const first = elements[0];
    const last = elements.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  desktop.addEventListener('change', event => {
    if (event.matches) {
      closeMenu(document.querySelector('.desktop-navigation a'));
    }
  });
}
