# Nokma / MeghFarm Website — Handoff Notes

## Project
Premium animated website for **Nokma** (flagship brand of MeghFarm / Muktidata Multipurpose
Co-operative Society Ltd.), an ice cream + agro-products company from Meghalaya. Built per a
detailed client brief: scroll-scrubbed hero animation, 3D product universe, flavour carousel
with color-changing backgrounds, ingredient pipeline, animated impact counters, factory
parallax, category islands, horizontal timeline, mountain-sunset contact section, custom
cursor, particles, seasonal themes, ambient sound. Vanilla JS + GSAP + Lenis, no framework.

**Location:** `/Users/albinosiby/personal dev/website jefin`

## Source materials (already extracted)
- Two PDFs (product pamphlet + company brochure) — text and images extracted via PyMuPDF into
  `public/products/` and `public/img/` (55 product webp assets, logos, story illustrations,
  factory photos).
- 233 hero animation frames (ice cream tub flying over Meghalaya hills), originally in `new/`
  → converted to `public/frames/desktop/` and `public/frames/mobile/` (webp, two sizes) for
  scroll-scrubbing.
- **Google Drive folder (crawled, not yet integrated):** public folder
  `1XWl5FeGOdOYnVHCvq6MVG1RNtgygLq4L` ("NOKMA") with real 3D product mockup renders — higher
  quality than the PDF extracts. Downloaded to
  `/private/tmp/claude-501/-Users-albinosiby-personal-dev-website-jefin/b54020de-5250-4eb9-997d-8770114d904a/scratchpad/drive/`
  across folders: `mockups`, `round-tub`, `oval-tub`, `mono-carton`, `drink`, `spices`,
  `3d-mascot`, `web-cone`, `web-cup`, `web-tub`, `pineapple`.
  - **Needs re-check:** all `web-cone` files downloaded at an identical 32,455 KB — almost
    certainly all fetched the same cached/wrong response. Re-download and verify before using
    any of them.
  - Crawl script + index: `scratchpad/crawl.py`, `scratchpad/dl.py`, `scratchpad/drive_index.json`.

## Architecture built so far
- `index.html` — full page markup, all 11 sections wired to container IDs.
- `src/styles/base.css` + `src/styles/sections.css` — full design system + section styles.
- `src/js/data.js` — product catalogue (source of truth, transcribed from brochure).
- `src/js/*.js` — one module per concern:
  - `core.js` — Lenis/GSAP setup
  - `loader.js` — preloader
  - `hero.js` — scroll-scrubbed frame sequence engine
  - `cursor.js`, `nav.js`, `micro.js`, `particles.js`, `season.js`, `ambient.js`
  - `story.js`, `universe.js`, `flavours.js`, `ingredients.js`, `impact.js`,
    `islands.js`, `timeline.js`, `contact.js`
- `src/main.js` — boot orchestrator.
- Vite + npm project scaffolded and running via `.claude/launch.json`
  (`npm run dev`, port 5173).

## Testing status
Verifying section-by-section in the Browser pane (viewport 1280×800). Since Lenis intercepts
native scroll, deterministic jumps were done via `window.__lenis.scrollTo(...)`.

### Fixed
- **Hero:** working, matches reference composition.
- **Story chain:** fixed SVG line alignment (was using rail-relative coords instead of actual
  disc centers).
- **Universe product grid:** fixed a bug where `max-height: 100%` doesn't resolve on
  absolutely-unconstrained flex/grid children — switched to `position:absolute; inset:0`
  pattern on all product images (`ucard`, `fslide`, `tcard`, `snode`, `istep`, `island`).
- **Flavour carousel:** fixed z-index stacking (melt puddle was painting over the tub) and
  widened the 3D ring spacing.
- **Nav anchor scroll:** added offset logic so pinned sections (hero/story/factory/timeline)
  land at true top while normal sections clear the fixed nav.

### In progress / not yet verified
- Was about to test the flavour carousel dot-clicking interaction (color-theming per flavour)
  when the browser tool timed out (30s) — **never confirmed flavour switching actually works
  in the browser.** This is the next thing to check.

## Not yet done
1. Confirm/fix the suspect `web-cone` Drive downloads, then decide whether to swap in
   Drive-sourced renders anywhere (they're higher quality than PDF extracts, especially for
   cones/cups/tubs per-flavour).
2. Finish walking through remaining sections in-browser:
   - ingredients pipeline
   - impact counters
   - factory parallax
   - islands fly-to interaction
   - timeline horizontal scroll
   - why-cards tilt
   - contact form + fireflies
3. Mobile responsive pass (only tested at 1280×800 desktop so far).
4. Final full-page screenshot pass top-to-bottom once fixes land.
