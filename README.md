# Nokma · MeghFarm

Marketing site for **Nokma** (MeghFarm) — vanilla JS, Vite, GSAP, Lenis.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output → dist/
npm run preview
```

## Project structure

```
.
├── index.html                 # Page markup + meta tags
├── package.json
├── vite.config.js
├── README.md
├── docs/                      # Notes / handoff docs
├── _source/                   # Offline source assets (not used at runtime)
│   ├── hero-frames-png/       # Original PNG frame sequence
│   ├── hero-frames-webp/      # Converted webp frames (legacy)
│   └── unused-cups/           # Older unused cup renders
├── public/                    # Static files copied to dist as-is
│   ├── favicon.png
│   ├── brand/                 # Logos + Open Graph share image
│   ├── images/                # Scenic / factory photography
│   ├── media/                 # Hero video + poster
│   └── products/
│       ├── ice-cream/
│       │   ├── flavours/
│       │   ├── mockups/
│       │   ├── cups/
│       │   ├── cones/
│       │   ├── tubs/
│       │   └── cartons/
│       ├── beverages/
│       ├── chips/
│       ├── spices/
│       ├── process/           # How-it’s-made / story art
│       └── mascot/
└── src/
    ├── main.js                # Boot + scene wiring
    ├── data/
    │   └── catalogue.js       # Products, flavours, blog, brand copy
    ├── modules/               # One concern per file
    │   ├── core.js
    │   ├── loader.js
    │   ├── hero.js
    │   ├── nav.js
    │   ├── universe.js
    │   ├── flavours.js
    │   ├── ingredients.js
    │   ├── blog.js
    │   ├── mascot.js
    │   ├── contact.js
    │   └── micro.js
    └── styles/
        ├── base.css
        └── sections.css
```

## Notes

- Deploy `dist/` (or the Vite build output your host expects).
- `_source/` is kept for archive/re-export work; it is not required for the live site.
- Share previews use `public/brand/og-nokma.png` via absolute `og:image` URLs.
