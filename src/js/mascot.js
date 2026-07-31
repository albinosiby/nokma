import { gsap, ScrollTrigger, reduced, onResize } from './core.js';

const SCENES = [
  { id: 'story', side: 'left', lift: 0, asset: 'story-farmer', variant: 'compact' },
  { id: 'universe', side: 'right', lift: 92, asset: 'mascot', variant: 'compact' },
  { id: 'flavours', side: 'left', lift: 4, asset: 'garo-dancer', variant: 'wide' },
  { id: 'ingredients', side: 'right', lift: 8, asset: 'garo-ginger', variant: 'wide' },
  { id: 'impact', side: 'right', lift: 170, asset: 'garo-basket', variant: 'wide' },
  { id: 'factory', side: 'right', lift: 12, asset: 'story-processing', variant: 'compact' },
  { id: 'islands', side: 'left', lift: 4, asset: 'mascot', variant: 'mascot' },
  { id: 'timeline', side: 'left', lift: 6, asset: 'story-delivery', variant: 'vehicle' },
  { id: 'why', side: 'right', lift: 4, asset: 'story-qc', variant: 'compact' },
];

const PRODUCT_CHARACTERS = {
  'ice-cream': { asset: 'mascot', variant: 'compact' },
  drinks: { asset: 'story-consumer', variant: 'compact' },
  chips: { asset: 'garo-basket', variant: 'wide' },
  spices: { asset: 'garo-ginger', variant: 'wide' },
  bulk: { asset: 'story-farmer', variant: 'compact' },
};

/** Keep the Nokma character with the visitor and reposition it between sections. */
export function initMascot() {
  const mascot = document.getElementById('mascot');
  const image = document.getElementById('mascotImage');
  if (!mascot || !image) return;

  let currentScene = null;

  const positionFor = (scene) => {
    const edge = window.innerWidth <= 760 ? 8 : 18;
    const width = mascot.getBoundingClientRect().width;
    const x = scene.side === 'right' ? Math.max(0, window.innerWidth - width - edge * 2) : 0;
    return { x, y: -scene.lift };
  };

  const showScene = (scene) => {
    currentScene = scene;
    const src = `./products/${scene.asset}.webp`;
    if (image.getAttribute('src') !== src) image.setAttribute('src', src);
    mascot.dataset.variant = scene.variant;
    mascot.dataset.scene = scene.id;
    const position = positionFor(scene);

    if (reduced) {
      gsap.set(mascot, { ...position, autoAlpha: 0.9 });
      return;
    }

    gsap.to(mascot, {
      ...position,
      autoAlpha: 1,
      duration: 0.65,
      ease: 'power2.out',
      overwrite: true,
    });
  };

  const hide = () => {
    currentScene = null;
    gsap.to(mascot, {
      autoAlpha: 0,
      duration: reduced ? 0 : 0.25,
      overwrite: true,
    });
  };

  gsap.set(mascot, { autoAlpha: 0, x: 0, y: 0 });

  SCENES.forEach((scene) => {
    const section = document.getElementById(scene.id);
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 58%',
      end: 'bottom 42%',
      onEnter: () => showScene(scene),
      onEnterBack: () => showScene(scene),
    });
  });

  const hiddenSections = ['hero', 'brand-world', 'contact'];

  hiddenSections.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 58%',
      end: 'bottom 42%',
      onEnter: hide,
      onEnterBack: hide,
    });
  });

  const syncFromViewport = () => {
    const marker = window.innerHeight * 0.5;
    const hiddenSection = hiddenSections
      .map((id) => document.getElementById(id))
      .find((section) => {
        const rect = section?.getBoundingClientRect();
        return rect && rect.top <= marker && rect.bottom >= marker;
      });

    if (hiddenSection) {
      hide();
      return;
    }

    const scene = SCENES.find((item) => {
      const rect = document.getElementById(item.id)?.getBoundingClientRect();
      return rect && rect.top <= marker && rect.bottom >= marker;
    });

    if (scene) showScene(scene);
  };

  ScrollTrigger.addEventListener('refresh', syncFromViewport);
  syncFromViewport();

  const syncInteractiveState = () => {
    const blocked = document.body.classList.contains('menu-open') || document.getElementById('pdp')?.classList.contains('is-open');
    mascot.classList.toggle('is-blocked', blocked);
  };

  const observer = new MutationObserver(syncInteractiveState);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
  const pdp = document.getElementById('pdp');
  if (pdp) observer.observe(pdp, { attributes: true, attributeFilter: ['class'] });
  syncInteractiveState();

  window.addEventListener('nokma:product-category', (event) => {
    const next = PRODUCT_CHARACTERS[event.detail?.category];
    const universe = SCENES.find((scene) => scene.id === 'universe');
    if (!next || !universe) return;
    universe.asset = next.asset;
    universe.variant = next.variant;
    if (currentScene?.id === 'universe') showScene(universe);
  });

  onResize(() => {
    if (currentScene) gsap.set(mascot, positionFor(currentScene));
  });
}
