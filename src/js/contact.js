import { gsap, reduced } from './core.js';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjybkqbn';

/** Contact scene: card fade-in plus Formspree-backed enquiry form. */
export function initContact() {
  const card = document.getElementById('contactCard');
  if (card) {
    if (reduced) {
      gsap.set(card, { opacity: 1 });
    } else {
      gsap.fromTo(
        card,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        }
      );
    }
  }

  const form = document.getElementById('contactForm');
  const hint = document.getElementById('cfHint');
  const submit = form?.querySelector('button[type="submit"]');
  if (!form || !hint) return;

  const setHint = (text, { error = false, success = false } = {}) => {
    hint.textContent = text;
    hint.classList.toggle('is-err', error);
    hint.classList.toggle('is-ok', success);
  };

  const fail = (text, field) => {
    setHint(text, { error: true });
    field?.focus();
    if (!reduced) gsap.fromTo(field || form, { x: -7 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.35)' });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name) return fail('Please add your name so we know who we’re talking to.', form.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('That email address doesn’t look right.', form.email);
    if (!message) return fail('Please add a short message with your enquiry.', form.message);

    submit.disabled = true;
    setHint('Sending your enquiry…');

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: 'Website enquiry — Nokma / MeghFarm',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const firstError = data?.errors?.[0]?.message;
        throw new Error(firstError || 'Something went wrong while sending. Please try again.');
      }

      form.reset();
      setHint('Thank you — your enquiry has been sent. We’ll get back to you soon.', { success: true });
    } catch (err) {
      setHint(err.message || 'Could not send right now. Please email sales@themeghfarm.com.', { error: true });
    } finally {
      submit.disabled = false;
    }
  });

  form.addEventListener('input', () => {
    if (hint.classList.contains('is-err') || hint.classList.contains('is-ok')) {
      setHint('');
    }
  });
}

/** Footer year. */
export function initFooter() {
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
}
