const AUTO_DELAY = 4500;
const SETTLE_DELAY = 120;

// Automatically discover all images from src/assets/happy-faces/
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
  const counter = section.querySelector('#happyCounter');
  const dotsContainer = section.querySelector('.happy__dots');
  const prevBtn = section.querySelector('[data-happy-prev]');
  const nextBtn = section.querySelector('[data-happy-next]');

  // Modal elements
  const modal = document.getElementById('happyModal');
  const modalImg = document.getElementById('happyModalImg');
  const modalCount = document.getElementById('happyModalCount');
  const modalPrev = modal?.querySelector('[data-modal-prev]');
  const modalNext = modal?.querySelector('[data-modal-next]');

  const paths = Object.keys(images).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  if (!paths.length) {
    section.hidden = true;
    return;
  }

  // Build gallery slides (purely showcasing the images)
  const slides = paths.map((path, idx) => {
    const filename = path.split('/').pop() || '';
    const cleanAlt = filename
      .replace(/\.[^.]+$/, '')
      .replace(/^\d+[-_ ]*/, '')
      .replace(/[-_]+/g, ' ')
      .trim() || 'Happy Faces';
    const imageUrl = images[path];

    const slide = document.createElement('div');
    slide.className = 'happy__slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `Photo ${idx + 1} of ${paths.length}`);
    slide.dataset.index = String(idx);

    slide.innerHTML = `
      <div class="happy__media">
        <img
          class="happy__img"
          src="${imageUrl}"
          alt="${cleanAlt}"
          loading="${idx === 0 ? 'eager' : 'lazy'}"
          decoding="async"
          draggable="false"
        />
        <div class="happy__overlay">
          <span class="happy__zoom-btn" title="View photo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
        </div>
      </div>
    `;

    // Click to open in full Lightbox
    slide.addEventListener('click', () => {
      openModal(idx);
    });

    return slide;
  });

  track.replaceChildren(...slides);

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let visible = false;
  let hovered = false;
  let focused = false;
  let pointer = null;
  let timer = null;
  let settledTimer = null;
  let modalActive = 0;

  // Build pagination dots
  const dotButtons = slides.map((_, idx) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'happy__dot';
    dot.setAttribute('aria-label', `Go to photo ${idx + 1} of ${slides.length}`);
    dot.setAttribute('aria-controls', track.id);
    dot.addEventListener('click', () => goTo(idx));
    dotsContainer.append(dot);
    return dot;
  });

  const update = (index) => {
    active = index;

    slides.forEach((slide, i) => {
      const isActive = i === active;
      slide.classList.toggle('is-active', isActive);
    });

    dotButtons.forEach((btn, i) => {
      btn.setAttribute('aria-current', String(i === active));
    });

    if (counter) {
      counter.textContent = `${active + 1} / ${slides.length}`;
    }
  };

  const schedule = () => {
    clearTimeout(timer);
    const modalOpen = modal && modal.classList.contains('is-open');
    if (slides.length > 1 && !motion.matches && visible && !hovered && !focused && !pointer && !document.hidden && !modalOpen) {
      timer = setTimeout(() => goTo(active + 1), AUTO_DELAY);
    }
  };

  const goTo = (index, instant = false) => {
    const next = (index + slides.length) % slides.length;
    clearTimeout(timer);

    const targetSlide = slides[next];
    if (targetSlide) {
      const offset = targetSlide.offsetLeft - (track.clientWidth - targetSlide.clientWidth) / 2;
      track.scrollTo({
        left: Math.max(0, offset),
        behavior: instant || motion.matches ? 'instant' : 'smooth',
      });
    }

    update(next);
    schedule();
  };

  const syncScrollToActive = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDist = Infinity;

    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const dist = Math.abs(center - slideCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    update(closestIndex);
    schedule();
  };

  track.addEventListener('scroll', () => {
    clearTimeout(timer);
    clearTimeout(settledTimer);
    settledTimer = setTimeout(syncScrollToActive, SETTLE_DELAY);
  }, { passive: true });

  prevBtn?.addEventListener('click', () => goTo(active - 1));
  nextBtn?.addEventListener('click', () => goTo(active + 1));

  // Keyboard navigation for gallery track
  track.addEventListener('keydown', (e) => {
    const map = {
      ArrowLeft: active - 1,
      ArrowRight: active + 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (map[e.key] !== undefined) {
      e.preventDefault();
      goTo(map[e.key]);
    }
  });

  // Pointer drag for mouse
  track.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || e.button !== 0) return;
    pointer = {
      id: e.pointerId,
      type: e.pointerType,
      x: e.clientX,
      left: track.scrollLeft,
      moved: false,
    };
    clearTimeout(timer);
    if (e.pointerType === 'mouse') {
      track.setPointerCapture(e.pointerId);
      track.classList.add('is-dragging');
    }
  });

  track.addEventListener('pointermove', (e) => {
    if (pointer?.id === e.pointerId && pointer.type === 'mouse') {
      const dx = pointer.x - e.clientX;
      if (Math.abs(dx) > 4) pointer.moved = true;
      track.scrollLeft = pointer.left + dx;
    }
  });

  const releasePointer = (e) => {
    if (pointer?.id !== e.pointerId) return;
    const isMouse = pointer.type === 'mouse';
    const hasMoved = pointer.moved;
    pointer = null;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(e.pointerId)) {
      track.releasePointerCapture(e.pointerId);
    }
    if (isMouse) {
      if (hasMoved) {
        syncScrollToActive();
      }
    } else {
      schedule();
    }
  };

  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);

  section.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  section.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  section.addEventListener('focusin', () => { focused = true; schedule(); });
  section.addEventListener('focusout', (e) => {
    focused = section.contains(e.relatedTarget);
    schedule();
  });

  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, { threshold: 0.2 }).observe(section);

  new ResizeObserver(() => goTo(active, true)).observe(track);

  // ─── Lightbox Modal ───────────────────────────────────────
  const updateModal = (idx) => {
    modalActive = (idx + paths.length) % paths.length;
    const path = paths[modalActive];
    const url = images[path];
    if (modalImg) modalImg.src = url;
    if (modalCount) modalCount.textContent = `${modalActive + 1} / ${paths.length}`;
  };

  const openModal = (idx) => {
    if (!modal) return;
    clearTimeout(timer);
    updateModal(idx);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    schedule();
  };

  if (modal) {
    modal.querySelectorAll('[data-modal-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });

    modalPrev?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModal(modalActive - 1);
    });

    modalNext?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateModal(modalActive + 1);
    });

    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') updateModal(modalActive - 1);
      if (e.key === 'ArrowRight') updateModal(modalActive + 1);
    });
  }

  // Initialize
  update(0);
  goTo(0, true);

  if (slides.length <= 1) {
    section.querySelectorAll('.happy__head-right, .happy__footer').forEach((el) => {
      el.hidden = true;
    });
  }
}
