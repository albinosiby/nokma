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

## Cloudflare Workers (static)

This project deploys as a **static Worker** (assets from `dist/`).

### Fill these fields on the Cloudflare setup page

| Field | Value |
|---|---|
| **Name** | `nokma` |
| **Build command** | `npm install && npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| **Non-production builds** | `npx wrangler versions upload` |
| **Root directory** | `/` (leave as `/` or blank) |
| **API token** | Create new token (auto is fine) |
| **Node version** (Advanced) | `22` |

Wrangler 4 requires **Node.js 22+**. Set this in Cloudflare Advanced settings as `NODE_VERSION=22` if the build still picks Node 20.

Do **not** use `wrangler pages deploy` on that screen — this is Workers static assets.

### Deploy from CLI

```bash
npm install
npm run deploy
```

Config:

- `wrangler.toml` — Worker name + `[assets] directory = "./dist"`
- `public/_headers` — cache + security headers
- `.nvmrc` / `.node-version` — Node 22 (required by Wrangler 4)
