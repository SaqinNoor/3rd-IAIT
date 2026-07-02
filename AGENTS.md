# AGENTS.md — 3rd IAIT

Single-page scroll-driven documentary about the global submarine cable network, built with vanilla JS + Vite + pnpm.

## Commands

| Command | Action |
|---|---|
| `pnpm dev` | Dev server with HMR |
| `pnpm build` | `vite build` + `node scripts/generate-sitemap.mjs` |
| `pnpm preview` | Serve built `dist/` |

No test, lint, format, or typecheck scripts exist.

## Toolchain

- **Package manager:** pnpm (not npm). Lockfile is `pnpm-lock.yaml`.
- **Build:** Vite 5.4 with `manualChunks` splitting `three` and `gsap+ScrollTrigger` into separate vendor bundles.
- **JS:** Single `src/main.js` (~1376 lines) with all logic. No modules beyond Vite's native ESM.
- **CSS:** Single `src/style.css` (~2268 lines). No preprocessor.
- **Entrypoint:** `index.html` loads `src/main.js` as a module script.

## Dependencies

- `three@0.170.0`, `gsap@3.12.7`, `@studio-freight/lenis@1.0.42`
- `@studio-freight/lenis` is **deprecated/removed from npm** — version 1.0.42 is locked in `pnpm-lock.yaml` and still works.
- `pnpm-workspace.yaml` only contains `allowBuilds: { esbuild: true }` (needed for lockfile).

## Architecture notes

- **3D globe** fetches country outlines from `https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json` at runtime. Requires internet.
- **Lenis smooth scrolling** is toggled off during touch drag on the globe. Touch handler uses `passive: false`.
- **IntersectionObserver** gates both the Bangladesh canvas animation and the globe render loop — they only run when their section is visible.
- **Custom cursor** uses `mix-blend-mode: difference` and `cursor: none !important`. Hidden on mobile (<=768px).
- **Deploy domain** hardcoded in `scripts/generate-sitemap.mjs`: `https://3rdiait.vercel.app`.

## Mobile

Dedicated styles at `@media (max-width: 768px)`. Descent section is 550vh vs 400vh desktop. Hotspot cards, cable SVG, and depth gauge all reflow.

## What's not here

- No CI/CD, no GitHub Actions, no deployment config.
- No TypeScript, no JSX, no frameworks.
- No linting, formatting, or typechecking tooling.
