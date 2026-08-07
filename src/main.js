import './styles/base.css';
import './styles/sections.css';

import { ScrollTrigger, initSmoothScroll } from './modules/core.js';
import { runLoader } from './modules/loader.js';
import { preloadHero, initHero } from './modules/hero.js';
import { initNav } from './modules/nav.js';
import { initRipples, initMagnetic, initReveals } from './modules/micro.js';
import { initUniverse } from './modules/universe.js';
import { initFlavours } from './modules/flavours.js';
import { initIngredients } from './modules/ingredients.js';
import { initBlog } from './modules/blog.js';
import { initMascot } from './modules/mascot.js';
import { initContact, initFooter } from './modules/contact.js';

/** Build every scene once the hero video is ready. */
function buildScenes() {
  initSmoothScroll();

  initNav();
  initRipples();
  initMagnetic('.icon-btn, .flav__nav', 0.3);

  initHero();
  initUniverse();
  initFlavours();
  initIngredients();
  initBlog();
  initContact();
  initFooter();

  initReveals();
  initMascot();

  // everything is laid out — recalculate all trigger positions
  ScrollTrigger.refresh();
}

async function boot() {
  const loader = runLoader();

  // Fonts first: SplitText must measure final glyphs, not fallbacks.
  const fonts = document.fonts?.ready ?? Promise.resolve();

  // The hero video drives 85% of progress; font readiness takes the rest.
  await Promise.all([
    preloadHero((p) => loader.setProgress(p * 0.85)),
    fonts.then(() => loader.setProgress(0.88)),
  ]);

  buildScenes();
  loader.setProgress(0.97);

  await loader.finish();

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
