import { gsap, reduced } from './core.js';
import { BRAND } from './data.js';

/** Contact scene: card fade-in plus a client-side-validated enquiry form. */
export function initContact() {
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
