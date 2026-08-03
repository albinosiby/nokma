import { ScrollTrigger, scrollTo, lenis } from './core.js';

export function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const links = [...document.querySelectorAll('.nav__links a')];
  const menuLinks = [...document.querySelectorAll('.menu__list a')];

  /* ── sticky styling + hide on scroll-down ─────────────── */
  let last = 0;
  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    onUpdate(self) {
      const y = self.scroll();
      nav.classList.toggle('is-stuck', y > 80);
      // never hide while the mobile menu is open
      if (!document.body.classList.contains('menu-open')) {
        nav.classList.toggle('is-hidden', y > last && y > 420);
      }
      last = y;
    },
  });

  /* ── active section highlighting ──────────────────────── */
  const map = [
    ['#hero', '#hero'],
    ['#universe', '#universe'],
    ['#flavours', '#universe'],
    ['#islands', '#universe'],
    ['#brand-world', '#universe'],
    ['#impact', '#impact'],
    ['#factory', '#impact'],
    ['#contact', '#contact'],
  ];

  const setActive = (href, sectionHref = href) => {
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === href));
    menuLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === sectionHref));
  };

  map.forEach(([sectionSel, linkHref]) => {
    const sec = document.querySelector(sectionSel);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => self.isActive && setActive(linkHref, sectionSel),
    });
  });

  /* ── mobile menu ──────────────────────────────────────── */
  const closeMenu = () => {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
    lenis?.start();
  };

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  });

  /* ── smooth anchor navigation ─────────────────────────── */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    // pinned sections must land at their very top; everything else clears the nav
    const pinned = ['hero', 'factory'].includes(target.id);
    const opts = { offset: pinned ? 0 : -72 };

    if (menu.classList.contains('is-open')) {
      closeMenu();
      setTimeout(() => scrollTo(target, opts), 380);
    } else {
      scrollTo(target, opts);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });
}
