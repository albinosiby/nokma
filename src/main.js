import './styles/base.css';
import './styles/sections.css';

import { ScrollTrigger, initSmoothScroll } from './js/core.js';
import { runLoader } from './js/loader.js';
import { preloadHero, initHero } from './js/hero.js';
import { initNav } from './js/nav.js';
import { initRipples, initMagnetic, initReveals } from './js/micro.js';
import { initStory } from './js/story.js';
import { initUniverse } from './js/universe.js';
import { initFlavours } from './js/flavours.js';
import { initIngredients } from './js/ingredients.js';
import { initImpact, initFactory } from './js/impact.js';
import { initIslands } from './js/islands.js';
import { initBrandWorld } from './js/brand-world.js';
import { initMascot } from './js/mascot.js';
import { initWhy, initContact, initFooter } from './js/contact.js';

/** Build every scene. Runs once the hero frames are ready. */
function buildScenes() {
  initSmoothScroll();

  initNav();
  initRipples();
  initMagnetic('.icon-btn, .flav__nav', 0.3);

  initHero();
  initStory();
  initUniverse();
  initFlavours();
  initIngredients();
  initImpact();
  initFactory();
  initIslands();
  initBrandWorld();
  initWhy();
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

  // The prepared scroll sequence drives 85% of progress; font readiness takes the rest.
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
