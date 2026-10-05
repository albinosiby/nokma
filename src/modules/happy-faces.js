const AUTO_DELAY = 4000;
const SETTLE_DELAY = 180;
const images = import.meta.glob('../assets/happy-faces/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function initHappyFaces() {
  const section = document.getElementById('happy-faces');
  if (!section || section.dataset.ready) return;
  section.dataset.ready = 'true';
  const track = section.querySelector('.happy__track');
  const paths = Object.keys(images).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const items = paths.map((path) => {
    const slide = document.createElement('div');
    slide.className = 'happy__slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    const image = document.createElement('img');
    image.src = images[path];
    const filename = path.split('/').pop();
    image.alt = filename.replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim() || 'Happy Faces';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    slide.append(image);
    return slide;
  });
  track.replaceChildren(...items);
  const slides = [...track.children];
  const dots = section.querySelector('.happy__dots');
  const count = section.querySelector('.happy__count');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!slides.length) { section.hidden = true; return; }
  let active = 0;
  let visible = false;
  let hovered = false;
  let focused = false;
  let pointer = null;
  let timer;
  let settled;

  const schedule = () => {
    clearTimeout(timer);
    if (slides.length > 1 && !motion.matches && visible && !hovered && !focused && !pointer && !document.hidden) {
      timer = setTimeout(() => goTo(active + 1), AUTO_DELAY);
    }
  };
  const update = (index) => {
    active = index;
    buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
    count.textContent = `${active + 1} / ${slides.length}`;
  };
  const goTo = (index, instant = false) => {
    const next = (index + slides.length) % slides.length;
    clearTimeout(timer);
    track.scrollTo({ left: slides[next].offsetLeft - slides[0].offsetLeft, behavior: instant || motion.matches ? 'instant' : 'smooth' });
    update(next);
    schedule();
  };
  const buttons = slides.map((slide, index) => {
    slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'happy__dot';
    button.setAttribute('aria-label', `Show image ${index + 1} of ${slides.length}`);
    button.setAttribute('aria-controls', track.id);
    button.addEventListener('click', () => goTo(index));
    dots.append(button);
    return button;
  });
  update(0);
  motion.addEventListener('change', schedule);
  section.querySelector('[data-happy-prev]').addEventListener('click', () => goTo(active - 1));
  section.querySelector('[data-happy-next]').addEventListener('click', () => goTo(active + 1));
  track.addEventListener('keydown', (event) => {
    const target = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: slides.length - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    goTo(target);
  });
  track.addEventListener('scroll', () => {
    clearTimeout(timer);
    clearTimeout(settled);
    settled = setTimeout(() => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      update(Math.max(0, Math.min(slides.length - 1, index)));
      schedule();
    }, SETTLE_DELAY);
  }, { passive: true });

  // Touch uses native scroll snapping; mouse users can also drag the image.
  track.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = { id: event.pointerId, type: event.pointerType, x: event.clientX, left: track.scrollLeft };
    clearTimeout(timer);
    if (event.pointerType === 'mouse') {
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
      event.preventDefault();
    }
  });
  track.addEventListener('pointermove', (event) => {
    if (pointer?.id === event.pointerId && pointer.type === 'mouse') track.scrollLeft = pointer.left + pointer.x - event.clientX;
  });
  const release = (event) => {
    if (pointer?.id !== event.pointerId) return;
    const mouse = pointer.type === 'mouse';
    pointer = null;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    if (mouse) goTo(Math.round(track.scrollLeft / track.clientWidth));
    else schedule();
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  section.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  section.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  section.addEventListener('focusin', () => { focused = true; schedule(); });
  section.addEventListener('focusout', (event) => { focused = section.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: 0.25 }).observe(section);
  new ResizeObserver(() => goTo(active, true)).observe(track);
  if (slides.length === 1) section.querySelector('.happy__nav').hidden = true;
}
