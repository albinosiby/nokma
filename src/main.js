import './styles/base.css';
import './styles/sections.css';
import './styles/happy-faces.css';

import { ScrollTrigger, initSmoothScroll } from './modules/core.js';
import { runLoader } from './modules/loader.js';
import { preloadHero, initHero, cacheFullHeroWhenReady } from './modules/hero.js';
import { initNav } from './modules/nav.js';
import { initRipples, initMagnetic, initReveals } from './modules/micro.js';
import { initUniverse } from './modules/universe.js';
import { initMonthly } from './modules/monthly.js';
import { initFlavours } from './modules/flavours.js';
import { initIngredients } from './modules/ingredients.js';
import { initMascot } from './modules/mascot.js';
import { initContact, initFooter } from './modules/contact.js';
import { initBlog } from './modules/blog.js';
import { initHappyFaces } from './modules/happy-faces.js';
import { warmAssets } from './modules/warmup.js';
import { runLaunchCountdown } from './modules/launch-countdown.js';

/** Build the page while hero media continues loading. */
function buildScenes() {
  initSmoothScroll();

  initNav();
  initRipples();
  initMagnetic('.icon-btn', 0.3);

  initHero();
  initUniverse();
  initMonthly();
  initFlavours();
  initIngredients();
  initBlog();
  initHappyFaces();
  initContact();
  initFooter();

  initReveals();
  initMascot();

  // everything is laid out — recalculate all trigger positions
  ScrollTrigger.refresh();
}

async function boot() {
  const loader = runLoader();

  // Fonts must not keep either desktop or mobile visitors on the loader.
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const criticalFonts = Promise.race([
    fonts.catch(() => {}),
    new Promise((resolve) => window.setTimeout(resolve, 1000)),
  ]);

  await Promise.all([
    preloadHero((p) => loader.setProgress(p * 0.97)),
    criticalFonts,
  ]);

  try {
    buildScenes();
    loader.setProgress(0.97);
  } finally {
    // Release the page even if an optional scene fails to initialize.
    await loader.finish();
  }

  warmAssets();
  cacheFullHeroWhenReady();

  fonts.then(() => ScrollTrigger.refresh()).catch(() => {});
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

async function start() {
  const launchCountdown = runLaunchCountdown();
  await launchCountdown;
  await boot();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
