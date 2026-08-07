import { gsap, ScrollTrigger, reduced, onResize } from './core.js';

const SCENES = [
  { id: 'universe', lift: 92, pose: 'pose-05' },
  { id: 'flavours', lift: 4, pose: 'pose-03' },
  { id: 'ingredients', lift: 8, pose: 'pose-06' },
  { id: 'blog', lift: 0, pose: 'pose-01' },
  { id: 'factory', lift: 12, pose: 'pose-04' },
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

const REACT_POSES = ['pose-01', 'pose-02', 'pose-03', 'pose-04', 'pose-05', 'pose-06'];

/** Keep the Nokma character with the visitor and reposition it between sections. */
export function initMascot() {
  const mascot = document.getElementById('mascot');
  const image = document.getElementById('mascotImage');
  if (!mascot || !image) return;

  let currentScene = null;
  let currentPose = image.getAttribute('src')?.match(/pose-\d+/)?.[0];
  let reacting = false;

  REACT_POSES.forEach((pose) => {
    const preload = new Image();
    preload.src = `./products/mascot/${pose}.png`;
  });

  const swapPose = (pose, { animate = true } = {}) => {
    const src = `./products/mascot/${pose}.png`;
    const scale = POSE_SCALE[pose] ?? 1;

    if (currentPose === pose) {
      gsap.to(image, {
        scale,
        rotation: 0,
        opacity: 1,
        duration: reduced || !animate ? 0 : 0.2,
        overwrite: true,
      });
      return;
    }
    currentPose = pose;
    image.setAttribute('src', src);

    if (reduced || !animate) {
      gsap.set(image, { scale, rotation: 0, opacity: 1 });
      return;
    }

    gsap.killTweensOf(image);
    gsap.fromTo(
      image,
      { opacity: 0, scale: scale * 0.9, rotation: -3 },
      { opacity: 1, scale, rotation: 0, duration: 0.34, ease: 'back.out(1.7)', overwrite: true }
    );
  };

  const playTapReact = () => {
    if (reacting || mascot.classList.contains('is-blocked')) return;
    if (getComputedStyle(mascot).visibility === 'hidden') return;

    reacting = true;
    const basePose = currentScene?.pose || currentPose || 'pose-01';
    const baseScale = POSE_SCALE[basePose] ?? 1;
    const reaction = REACT_POSES.filter((pose) => pose !== basePose)[
      Math.floor(Math.random() * Math.max(1, REACT_POSES.length - 1))
    ] || 'pose-02';

    if (reduced) {
      swapPose(reaction, { animate: false });
      setTimeout(() => {
        swapPose(basePose, { animate: false });
        reacting = false;
      }, 220);
      return;
    }

    gsap.killTweensOf([mascot, image]);

    const jump = gsap.timeline({
      onComplete: () => {
        reacting = false;
        if (currentScene) gsap.set(mascot, positionFor(currentScene));
      },
    });

    jump
      .to(mascot, {
        y: '-=22',
        duration: 0.12,
        ease: 'power2.out',
      })
      .to(image, {
        rotation: 7,
        scale: baseScale * 1.04,
        duration: 0.1,
        ease: 'back.out(1.8)',
      }, 0)
      .add(() => swapPose(reaction, { animate: false }), 0.05)
      .to(image, {
        rotation: -5,
        duration: 0.07,
        ease: 'power1.inOut',
      })
      .to(image, {
        rotation: 4,
        duration: 0.06,
        ease: 'power1.inOut',
      })
      .to(mascot, {
        y: currentScene ? -currentScene.lift : 0,
        duration: 0.2,
        ease: 'bounce.out',
      }, 0.12)
      .to(image, {
        rotation: 0,
        scale: POSE_SCALE[reaction] ?? 1,
        duration: 0.12,
        ease: 'power2.out',
      }, 0.18)
      .add(() => swapPose(basePose), 0.3)
      .to(image, {
        scale: baseScale,
        rotation: 0,
        duration: 0.12,
        ease: 'back.out(1.4)',
      }, 0.32);
  };

  const positionFor = (scene) => {
    return { x: 0, y: -scene.lift };
  };

  const showScene = (scene) => {
    currentScene = scene;
    mascot.dataset.scene = scene.id;
    if (!reacting) swapPose(scene.pose);
    const position = positionFor(scene);

    if (reduced) {
      gsap.set(mascot, { ...position, autoAlpha: 0.9 });
      return;
    }

    gsap.to(mascot, {
      ...position,
      autoAlpha: 1,
      duration: reacting ? 0.2 : 0.65,
      ease: 'power2.out',
      overwrite: 'auto',
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
    if (currentScene && !reacting) gsap.set(mascot, positionFor(currentScene));
  });

  mascot.addEventListener('click', (e) => {
    e.preventDefault();
    playTapReact();
  });

  mascot.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    playTapReact();
  });
}
