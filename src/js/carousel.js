export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
}

export function initCarousel(root) {
  if (root.classList.contains('is-enhanced')) return;

  const viewport = root.querySelector('.carousel-window');
  const track = root.querySelector('.carousel-track');
  const previous = root.querySelector('[data-carousel-previous]');
  const next = root.querySelector('[data-carousel-next]');
  const status = root.querySelector('[data-carousel-status]');

  if (!viewport || !track || !previous || !next || !status) return;

  let cards = [];
  let first = 0;
  let visible = 1;
  let frame = 0;
  let layoutFrame = 0;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function step() {
    if (cards.length < 2) return viewport.clientWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  }

  function maximum() {
    return Math.max(0, cards.length - visible);
  }

  function update() {
    if (!viewport.clientWidth) return;
    const distance = step();
    first = Math.min(
      maximum(),
      Math.max(0, Math.round(viewport.scrollLeft / distance))
    );
    previous.disabled = first === 0;
    next.disabled = first === maximum();

    const message = cards.length
      ? `Showing cards ${first + 1}–${Math.min(first + visible, cards.length)} of ${cards.length}`
      : 'No cards available';

    if (status.textContent !== message) status.textContent = message;
  }

  function move(index, instant = false) {
    viewport.scrollTo({
      left: Math.max(0, Math.min(index, maximum())) * step(),
      behavior: instant || reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  function layout() {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => {
      if (!viewport.clientWidth) return;
      cards = [...track.querySelectorAll('[data-carousel-card]')];
      visible = Math.max(
        1,
        Number.parseInt(
          getComputedStyle(root).getPropertyValue('--cards-per-view'),
          10
        ) || 1
      );
      first = Math.min(first, maximum());
      move(first, true);
      update();
    });
  }

  root.classList.add('is-enhanced');
  layout();

  previous.addEventListener('click', () => move(first - 1));
  next.addEventListener('click', () => move(first + 1));

  viewport.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    },
    { passive: true }
  );

  viewport.addEventListener('keydown', event => {
    // Preserve arrow-key behavior inside future form controls.
    if (
      event.target.matches('input, textarea, select, [contenteditable="true"]')
    )
      return;

    const destinations = {
      ArrowLeft: first - 1,
      ArrowRight: first + 1,
      Home: 0,
      End: maximum(),
    };
    if (!(event.key in destinations)) return;

    event.preventDefault();
    move(destinations[event.key]);
  });

  // Native touch scrolling and scroll snap preserve vertical swipes and pinch zoom.
  viewport.addEventListener('focusin', event => {
    const card = event.target.closest('[data-carousel-card]');
    const index = cards.indexOf(card);
    if (index < 0) return;
    if (index < first) move(index);
    else if (index >= first + visible) move(index - visible + 1);
  });

  new ResizeObserver(layout).observe(viewport);
  new MutationObserver(layout).observe(track, { childList: true });
}
