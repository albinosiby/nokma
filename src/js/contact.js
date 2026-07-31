import { gsap, reduced } from './core.js';
import { WHY, OPPORTUNITIES, BRAND } from './data.js';
import { initTilt } from './micro.js';

/** "Why MeghFarm" cards with 3D hover. */
export function initWhy() {
  const grid = document.getElementById('whyGrid');
  if (!grid) return;

  WHY.forEach((w, i) => {
    const el = document.createElement('article');
    el.className = 'wcard';
    el.innerHTML = `
      <div class="wcard__i">${String(i + 1).padStart(2, '0')}</div>
      <h4>${w.t}</h4>
      <p>${w.d}</p>`;
    grid.appendChild(el);
  });

  const cards = [...grid.querySelectorAll('.wcard')];

  if (reduced) {
    gsap.set(cards, { opacity: 1 });
  } else {
    gsap.set(cards, { y: 40 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 84%', once: true },
    });
  }

  initTilt('.wcard', 9);
}

/** Contact scene: card fade-in plus a client-side-validated enquiry form. */
export function initContact() {
  const ops = document.getElementById('opsList');
  if (ops) {
    OPPORTUNITIES.forEach((o) => {
      const li = document.createElement('li');
      li.textContent = o;
      ops.appendChild(li);
    });
  }

  const card = document.getElementById('contactCard');
  if (card) {
    if (reduced) {
      gsap.set(card, { opacity: 1 });
    } else {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60, filter: 'blur(14px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 82%', once: true },
        }
      );
    }
  }

  /* ── enquiry form ─────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const hint = document.getElementById('cfHint');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const topic = form.topic.value;
    const msg = form.message.value.trim();

    const fail = (text, field) => {
      hint.textContent = text;
      hint.classList.add('is-err');
      field?.focus();
      if (!reduced) gsap.fromTo(field || form, { x: -7 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.35)' });
    };

    if (!name) return fail('Please add your name so we know who we’re talking to.', form.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('That email address doesn’t look right.', form.email);

    hint.classList.remove('is-err');

    // No backend is wired up yet — hand the enquiry to the visitor's mail client
    // so nothing is silently dropped.
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Interested in: ${topic}`,
      '',
      msg || '(no message)',
    ].join('\n');

    const href = `mailto:${BRAND.email}?subject=${encodeURIComponent(
      `Website enquiry — ${topic}`
    )}&body=${encodeURIComponent(body)}`;

    hint.textContent = 'Opening your mail app with the enquiry ready to send…';
    window.location.href = href;

    setTimeout(() => {
      hint.textContent = `If nothing opened, email us directly at ${BRAND.email}.`;
    }, 2600);
  });

  // clear the hint as soon as the visitor starts fixing things
  form.addEventListener('input', () => {
    if (hint.classList.contains('is-err')) {
      hint.textContent = '';
      hint.classList.remove('is-err');
    }
  });
}

/** Footer year. */
export function initFooter() {
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
}
