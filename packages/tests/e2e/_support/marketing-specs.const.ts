/**
 * Specs scoped to the marketing Nuxt dev server (`:3000`), never to Histoire.
 *
 * Single source of truth shared by both Playwright configs:
 * - `playwright.marketing.config.ts` uses it as `testMatch` (these specs
 *   ONLY run there, against `MARKETING_BASE_URL`).
 * - `playwright.config.ts` (Histoire, the default component-e2e config) uses
 *   it as `testIgnore` so a full local run (`playwright test`, no
 *   `E2E_GREEN_ONLY`) never boots these specs against the Histoire baseURL.
 *
 * Before this list existed, every spec below lived only in the marketing
 * config's `testMatch` — `playwright.config.ts` had no matching
 * `testIgnore`, so `testDir: './e2e'` + `testMatch: undefined` (any local
 * full run) picked them up too. Each one calls `page.goto('/...')` against
 * Histoire's baseURL, where the marketing DOM (`.primary-nav`,
 * `.site-footer`, `[data-nav-ready]`, `/changelog`, `/theming`, …) never
 * exists — so every test in the file times out identically on all three
 * engines. That is a harness-scoping bug, not a product defect: it
 * masqueraded as "229 failures reproducible on chromium/firefox/webkit"
 * when triaging the full local e2e run, for `nav-link-availability.spec.ts`
 * (7/7/7), `changelog.spec.ts` (11/10/11) and `theming-feedback-tokens.spec.ts`
 * (1/1/1).
 */
export const MARKETING_SPEC_PATTERNS = [
    '**/marketing-theming.spec.ts',
    '**/marketing-theming-isolation.spec.ts',
    '**/marketing-theme-builder.spec.ts',
    '**/marketing-theming-controls.spec.ts',
    '**/marketing-theming-viewport-height.spec.ts',
    '**/marketing-theming-theme-bg-and-triggers.spec.ts',
    '**/marketing-brand-presets.spec.ts',
    '**/marketing-theming-toggle-vs-split-parity.spec.ts',
    '**/marketing-theme-live-switch.spec.ts',
    '**/theming-feedback-tokens.spec.ts',
    '**/home-*.spec.ts',
    '**/why-origam.spec.ts',
    '**/roadmap.spec.ts',
    '**/changelog.spec.ts',
    '**/installation.spec.ts',
    '**/directives.spec.ts',
    '**/components.spec.ts',
    '**/wireframe.spec.ts',
    '**/types.spec.ts',
    '**/composables.spec.ts',
    '**/nav-link-availability.spec.ts',
    '**/api-docs-generated.spec.ts'
]
