export function initNavigation() {
  const header = document.querySelector('.header');
  const menu = document.querySelector('#mobile-menu');
  const sections = [
    ...document.querySelectorAll('main > section[id], footer[id]'),
  ];
  const links = [
    ...document.querySelectorAll(
      '.desktop-navigation a[href^="#"], .mobile-navigation a[href^="#"], .footer-navigation a[href^="#"], .header-sign-up, .camera-link'
    ),
  ];

  if (!header || !sections.length) return;

  let frame = 0;
  let activeId = null;
  let selectedTarget = null;
  let transitionUntil = 0;
  let transitionTimer = 0;
  let touchStart = null;

  function activate(id) {
    if (activeId === id) return;
    activeId = id;
    links.forEach(link => {
      if (link.getAttribute('href') === `#${id}`) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function update() {
    if (menu?.open) return;

    const line = header.getBoundingClientRect().bottom + 16;

    if (selectedTarget) {
      const rect = selectedTarget.getBoundingClientRect();
      const visible = rect.bottom > line && rect.top < window.innerHeight;
      // A clicked section wins when neighboring sections share the viewport.
      // Keep that choice after scrolling finishes, until manual scrolling starts.
      if (visible || performance.now() < transitionUntil) {
        activate(selectedTarget.id);
        return;
      }
      selectedTarget = null;
    }

    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line + 2) current = section.id;
    }

    const atBottom =
      window.scrollY > 0 &&
      window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
    if (atBottom) current = sections.at(-1).id;
    activate(current);
  }

  function scheduleUpdate() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }

  function select(target) {
    selectedTarget = target;
    transitionUntil = performance.now() + 1600;
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(scheduleUpdate, 1650);
    activate(target.id);
    scheduleUpdate();
  }

  function cancelSelection() {
    selectedTarget = null;
    clearTimeout(transitionTimer);
    scheduleUpdate();
  }

  function syncHistory() {
    const target = sections.find(
      section => `#${section.id}` === window.location.hash
    );
    if (!target) cancelSelection();
    else if (target !== selectedTarget) select(target);
    else scheduleUpdate();
  }

  document.addEventListener('click', event => {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = sections.find(
      section => `#${section.id}` === link.getAttribute('href')
    );
    if (target) select(target);
  });

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('hashchange', syncHistory);
  window.addEventListener('popstate', syncHistory);
  window.addEventListener(
    'wheel',
    event => {
      if (event.deltaY) cancelSelection();
    },
    { passive: true }
  );

  window.addEventListener(
    'touchstart',
    event => {
      const touch = event.touches[0];
      touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
    },
    { passive: true }
  );
  window.addEventListener(
    'touchmove',
    event => {
      const touch = event.touches[0];
      if (!touchStart || !touch) return;
      const dx = Math.abs(touch.clientX - touchStart.x);
      const dy = Math.abs(touch.clientY - touchStart.y);
      if (dy > 10 && dy > dx) cancelSelection();
    },
    { passive: true }
  );

  document.addEventListener('pointerdown', event => {
    if (event.clientX >= document.documentElement.clientWidth)
      cancelSelection();
  });

  document.addEventListener('keydown', event => {
    if (
      event.defaultPrevented ||
      event.target.closest('input, textarea, select, [contenteditable="true"]')
    )
      return;
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
      ].includes(event.key)
    )
      cancelSelection();
  });

  new ResizeObserver(scheduleUpdate).observe(document.body);
  if (window.location.hash) syncHistory();
  else scheduleUpdate();
}
