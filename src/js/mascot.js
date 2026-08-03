import { gsap, ScrollTrigger, reduced, onResize } from './core.js';

const SCENES = [
  { id: 'universe', side: 'right', lift: 92, pose: 'pose-05' },
  { id: 'flavours', side: 'left', lift: 4, pose: 'pose-03' },
  { id: 'ingredients', side: 'right', lift: 8, pose: 'pose-06' },
  { id: 'impact', side: 'right', lift: 0, pose: 'pose-01' },
  { id: 'factory', side: 'right', lift: 12, pose: 'pose-04' },
  { id: 'islands', side: 'left', lift: 4, pose: 'pose-02' },
  { id: 'why', side: 'right', lift: 4, pose: 'pose-06' },
];

// The source PNGs share a canvas size but have different transparent margins.
const POSE_SCALE = {
  'pose-01': 1,
  'pose-02': 1.1,
  'pose-03': 0.91,
  'pose-04': 0.85,
  'pose-05': 1.01,
  'pose-06': 1.03,
};

/** Keep the Nokma character with the visitor and reposition it between sections. */
export function initMascot() {
  const mascot = document.getElementById('mascot');
  const image = document.getElementById('mascotImage');
  if (!mascot || !image) return;

  let currentScene = null;
  let currentPose = image.getAttribute('src')?.match(/pose-\d+/)?.[0];

  SCENES.forEach(({ pose }) => {
    const preload = new Image();
    preload.src = `./products/mascot/${pose}.png`;
  });

  const swapPose = (pose, side) => {
    const src = `./products/mascot/${pose}.png`;
    const scale = POSE_SCALE[pose] ?? 1;

    if (currentPose === pose) {
      gsap.to(image, {
        scale,
        rotation: 0,
        opacity: 1,
        duration: reduced ? 0 : 0.2,
        overwrite: true,
      });
      return;
    }
    currentPose = pose;
    image.setAttribute('src', src);

    if (reduced) {
      gsap.set(image, { scale, rotation: 0, opacity: 1 });
      return;
    }

    gsap.killTweensOf(image);
    gsap.fromTo(
      image,
      { opacity: 0, scale: scale * 0.9, rotation: side === 'right' ? -3 : 3 },
      { opacity: 1, scale, rotation: 0, duration: 0.34, ease: 'back.out(1.7)', overwrite: true }
    );
  };

  const positionFor = (scene) => {
    const edge = window.innerWidth <= 760 ? 8 : 18;
    const width = mascot.getBoundingClientRect().width;
    const x = scene.side === 'right' ? Math.max(0, window.innerWidth - width - edge * 2) : 0;
    return { x, y: -scene.lift };
  };

  const showScene = (scene) => {
    currentScene = scene;
    swapPose(scene.pose, scene.side);
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

  const hiddenSections = ['hero', 'contact'];

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

  onResize(() => {
    if (currentScene) gsap.set(mascot, positionFor(currentScene));
  });
}
