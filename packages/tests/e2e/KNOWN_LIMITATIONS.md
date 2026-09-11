# Known limitation — Histoire's sandbox iframe is not reliable for timing-sensitive e2e assertions

Investigated 2026-08-11 on `histoire@1.0.0-beta.1` / `@histoire/plugin-vue@1.0.0-beta.1` /
`@histoire/app@1.0.0-beta.1`. Branch: `debug/histoire-double-mount`.

## TL;DR

Every story rendered through the default Histoire preview (`layout.iframe` unset,
i.e. `{ type: 'single', iframe: true }`, which is every story in this repo except
`OrigamUtilities.story.vue`) executes its `.story.vue` `<script setup>` **twice**,
in two separate JS realms, kept loosely in sync through `postMessage`:

1. Once in the **main Histoire document**, hidden (`@histoire/app/src/app/App.vue`
   always keeps `<GenericMountStory :story="storyStore.currentStory">` mounted in a
   `display:none` div — this is the "state collector" that feeds the props/controls
   side panel).
2. Once inside the **sandbox iframe** (`__sandbox.html` → `@histoire/app/src/app/sandbox.ts`),
   which itself mounts a *second*, independent `GenericMountStory` (hidden) plus the
   visible `GenericRenderStory` that actually renders your `<Variant>` content.

Only the iframe's `GenericRenderStory` instance produces real, visible DOM (the
`<Variant>` component's own `render()` returns `null`, so the "collector" copies never
paint anything) — so this is **not** two visible copies of your component. But it *is*
two independent `ref()`/`reactive()` trees for every piece of state your story
declares at the top level (props auto-tracked via `implicitState`/`devtoolsRawSetupState`),
bridged by an **asynchronous, eventually-consistent `postMessage` round-trip**
(`STATE_SYNC` messages, see `@histoire/app/src/app/sandbox.ts` and
`.../components/story/StoryVariantSinglePreviewRemote.vue`).

## What we measured (Playwright, against a Histoire dev server on a scratch port,
run from a dedicated worktree — see method below)

On `TextField/OrigamTextField`, variant "Prop — mask (custom pattern)":

| Probe | Default (iframe) mode | `layout: { iframe: false }` (native) |
|---|---|---|
| `<script setup>` execution count | **2** (1 in main doc, 1 in `__sandbox.html`) | **1** |
| Real DOM mounts of the field | 1 | 1 |
| `<Suspense>` "experimental feature" console warnings | **2** | 1 |
| `watch(maskCustomModel)` firings per keystroke | **2** (duplicated — one per independent ref) | 1 (clean) |
| Typing `1234567890` (masked to `(##) ###-####`, 9-digit capacity) | **truncated after 2 chars** (`"(12) "`) | **correct** (`"(12) 345-6789"`, all 9 digits) |

This reproduces, with a fresh `console.log`/`window.__COUNTER__` instrumentation
directly in the story file (temporary, reverted after measurement) — not a guess.

## Why this explains the historical mask-test `fixme`s

`packages/tests/e2e/textfield-mask.spec.ts` carries several `test.fixme(...)` entries
diagnosed (twice, both times wrong) as "Playwright synthetic input" and later as a
"DS `nextTick` race condition". The design system is not at fault — the same typing
scenario passes cleanly **outside Histoire** (plain Vue mount, no sandbox). What
actually happens: Histoire's per-keystroke `postMessage` state-sync (deep-watching
the whole `variant.state` tree and `toRawDeep`-cloning it on every change) adds
synchronous work on the main thread on top of the DS's own `nextTick`-scheduled mask
rewrite. Under Playwright's fast synthetic typing (`delay: 5-30ms`), this extra load
is enough to let a second keystroke's `input` event land before the first one's
`nextTick` rewrite of `el.value` has settled, corrupting/truncating the value. This is
consistent with Histoire's own history of "state not syncing in iframe mode" /
"postMessage error" bugs (`histoire-dev/histoire` changelog: fixes for #144, #250,
#361 in earlier 0.x versions) — the iframe/postMessage bridge is a known fragile
spot in this project, not something introduced by this repo's config.

## Why we are not "fixing" this in `histoire.config.js`

Setting `layout: { type: 'single', iframe: false }` — globally via
`defaultStoryProps`, or scoped to just the affected `<Story>` — does eliminate the
double execution (see the "native" column above, measured, not assumed). **We are not
shipping that change** because:

- `page.frameLocator('iframe[src*="__sandbox"]')` is the standard navigation pattern
  used across the e2e suite: **147 of the spec files** in `packages/tests/e2e/`
  reference `__sandbox` directly, including `text-field.spec.ts` (46 references,
  currently green and part of the CI `GREEN_SPECS` gate). Disabling the iframe — even
  scoped to only `OrigamTextField.story.vue` — breaks every locator in that spec file,
  converting a green, CI-gated spec into a fully red one. That is a materially worse
  outcome than the handful of `fixme`d mask tests.
- No narrower, Histoire-config-level knob exists to make the `postMessage` state sync
  synchronous or to skip it selectively for one story while keeping the iframe (the
  sync is wired into `@histoire/app`'s `StoryVariantSinglePreviewRemote.vue` /
  `sandbox.ts`, not exposed via `histoire.config.js` / `histoire.setup.ts`).

## Practical guidance for the next person

- **Do not trust a failing timing-sensitive e2e assertion against Histoire as proof of
  a DS bug.** Reproduce it against a plain Vue mount (no Histoire) first. If it passes
  there, the failure is very likely this sandbox double-execution/postMessage race,
  not the component under test.
- Prefer **larger typing delays** (`{ delay: 50+ }`) or `input.fill()` /
  `input.pressSequentially()` with generous `waitForTimeout` between chunks for
  masked/validated inputs in e2e specs — this reduces (does not eliminate) the chance
  of racing the `postMessage` round trip.
- If a future Histoire release changes this architecture (e.g. removes the
  always-mounted main-doc collector, or makes the sandbox sync synchronous), re-run the
  measurement in this doc before assuming this limitation still applies. Check
  `histoire`'s installed version first (`node_modules/histoire/package.json`).
- If the e2e suite is ever migrated off the `iframe[src*="__sandbox"]` locator pattern
  (a bigger refactor, out of scope here), `layout: { iframe: false }` per-story becomes
  a real, low-risk option worth revisiting.

## Method (for reproducing)

1. Dedicated worktree, `histoire dev --port <free port>` run from that worktree (do
   **not** trust a Histoire process already listening on 6006 — verify its cwd with
   `lsof -p <pid> -a -d cwd` first; it may belong to a different checkout).
2. Playwright probes against that port only, config with no `webServer` block (see
   deleted `playwright.debug-worktree.config.ts`, not committed).
3. Instrumentation added directly to the story file under test (a `console.log` +
   `window.top.__COUNTER__` in `<script setup>`, a `v-mounted` custom directive on the
   field, a `watch()` on the v-model ref) — reverted after each measurement, never
   committed.
