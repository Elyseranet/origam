/*
 * `origam/styles` resolves (via `vite.host.config.ts`'s alias) to the DS's
 * hand-maintained `assets/css/main.css` — a side-effect CSS import the
 * standalone host needs, with no TypeScript types of its own.
 */
declare module 'origam/styles'

/*
 * ⛔ Every OTHER `origam` / `origam/*` import is resolved to DS SOURCE by
 * `tsconfig.json`'s `paths` (`origam` → `../ds/src/origam.ts`, `origam/*` →
 * `../ds/src/*\/index.ts`) — the same mapping `vite.host.config.ts` applies
 * at runtime. There used to be loosely typed ambient shims here instead
 * (#1141). They made the static check depend on whatever sat on disk: with
 * no `packages/ds/dist/` the shims answered, but with a `dist/` present —
 * even a stale one — `package.json` `exports` won, `vue-tsc` pulled the
 * built `.vue` files in, and type-checked them under this package's options
 * (measured: 2 399 errors, all under `../ds/dist/src`, 0 in the playground).
 *
 * Resolving to source makes the check deterministic, and it checks the
 * playground against the DS's REAL signatures rather than a hand-copied
 * subset that could drift. What it costs, all set in `tsconfig.json`:
 *
 *   - DS's three ambient files (`globals.d.ts`, `vite-env.d.ts`,
 *     `shims.d.ts`) are included, because the DS source relies on them
 *     (`HTMLElement._clickOutside`, `ImportMeta.env`, `__VUE_OPTIONS_API__`).
 *   - `noUnusedLocals` / `noUnusedParameters` are OFF, mirroring
 *     `packages/ds/tsconfig.json` for the same reason: under TypeScript 6,
 *     `@vue/language-core` 3.3.x reports template refs (`ref="x"`) as unused
 *     — 18 false positives in DS source. `packages/ds/scripts/nounusedlocals-
 *     canary.mjs` tracks the upstream fix; when it lands, re-enable both
 *     here too. Unused bindings stay caught by ESLint's
 *     `@typescript-eslint/no-unused-vars` (error, all `.ts` / `.vue`).
 */
