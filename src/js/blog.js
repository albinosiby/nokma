import { gsap, reduced, lenis } from './core.js';
import { BLOG } from './data.js';

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** Blog index with a lightweight article reader. */
export function initBlog() {
  const grid = document.getElementById('blogGrid');
  const modal = document.getElementById('blogPost');
  const card = document.getElementById('blogPostCard');
  if (!grid || !modal) return;

  const els = {
    label: document.getElementById('blogPostLabel'),
    date: document.getElementById('blogPostDate'),
    title: document.getElementById('blogPostTitle'),
    body: document.getElementById('blogPostBody'),
  };

  grid.innerHTML = BLOG.map((post, i) => `
    <article class="bcard${i === 0 ? ' bcard--feature' : ''}" data-id="${post.id}">
      <button type="button" class="bcard__hit" data-cursor="link" aria-label="Read: ${post.title}">
        <p class="bcard__meta"><span>${post.label}</span><time datetime="${post.date}">${formatDate(post.date)}</time></p>
        <h3 class="bcard__title">${post.title}</h3>
        <p class="bcard__excerpt">${post.excerpt}</p>
        <span class="bcard__more" aria-hidden="true">Read article <span>→</span></span>
      </button>
    </article>
  `).join('');

  const cards = [...grid.querySelectorAll('.bcard')];
  let lastFocus = null;

  function open(id) {
    const post = BLOG.find((item) => item.id === id);
    if (!post) return;

    lastFocus = document.activeElement;
    els.label.textContent = post.label;
    els.date.textContent = formatDate(post.date);
    els.title.textContent = post.title;
    els.body.innerHTML = post.body.map((p) => `<p>${p}</p>`).join('');

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lenis?.stop();
    document.body.style.overflow = 'hidden';

    if (!reduced) {
      gsap.fromTo(
        card,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
    }

    setTimeout(() => modal.querySelector('.bpost__x')?.focus(), 120);
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    lenis?.start();
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }

  grid.addEventListener('click', (e) => {
    const hit = e.target.closest('.bcard__hit');
    if (!hit) return;
    open(hit.closest('.bcard').dataset.id);
  });

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-blog-close]')) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('button, a[href]');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  if (!reduced) {
    gsap.set(cards, { opacity: 0, y: 32 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
    });
  }
}
