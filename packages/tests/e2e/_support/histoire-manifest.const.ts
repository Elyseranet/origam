/**
 * Constants for the served-vs-source Histoire manifest guard
 * (`e2e/_support/histoire-manifest.ts`).
 *
 * Kept in a dedicated `*.const.ts` so no magic string / magic number lives
 * inline in the guard itself (root CLAUDE.md, "Convention & nommage").
 */

/** Default Histoire port, overridable through {@link HISTOIRE_PORT_ENV}. */
export const HISTOIRE_DEFAULT_PORT = '6006'

/** Env var carrying the Histoire port — mirrors `playwright.config.ts`. */
export const HISTOIRE_PORT_ENV = 'E2E_HISTOIRE_PORT'

/** Env var that selects the prebuilt-static server (`histoire preview`). */
export const HISTOIRE_STATIC_ENV = 'E2E_STATIC'

/** Value of {@link HISTOIRE_STATIC_ENV} that turns static mode on. */
export const HISTOIRE_STATIC_ON = '1'

/**
 * Escape hatch: set to {@link HISTOIRE_STATIC_ON} to skip the guard entirely.
 *
 * Deliberately provided so a genuine incident (a story that legitimately
 * fails to collect, a Histoire upgrade that moves the manifest) can never
 * hard-block the whole suite with no way forward. It is named in the abort
 * message so whoever hits the guard can see the door — and so that using it
 * is a visible, deliberate act rather than a silent default.
 */
export const HISTOIRE_GUARD_SKIP_ENV = 'E2E_SKIP_MANIFEST_GUARD'

/** Base path Histoire is served under (`vite.base` in `histoire.config.js`). */
export const HISTOIRE_BASE_PATH = '/stories/'

/** Static build manifest, emitted by `histoire build` next to `index.html`. */
export const HISTOIRE_STATIC_MANIFEST_PATH = 'histoire.json'

/**
 * Dev-mode manifest. `histoire dev` never writes `histoire.json`; the story
 * catalogue only exists as the Vite virtual module
 * `virtual:$histoire-stories`, resolved to this URL
 * (`RESOLVED_STORIES_ID` in `histoire/dist/node/virtual/index.js`) and
 * served as a plain JS module.
 */
export const HISTOIRE_DEV_MANIFEST_PATH = '__resolved__virtual:$histoire-stories'

/** Marker preceding the story array inside the dev virtual module. */
export const HISTOIRE_DEV_FILES_MARKER = 'export let files = '

/** Marker terminating the story array inside the dev virtual module. */
export const HISTOIRE_DEV_TREE_MARKER = '\nexport let tree = '

/**
 * Strips the two non-JSON members Histoire injects per entry in the dev
 * virtual module (`component: Comp<N>` and `source: () => import(…)`), so
 * the remainder is parseable as JSON. Both quote styles are accepted: the
 * generator emits single quotes, Vite's import-analysis rewrites the
 * specifier and re-emits it double-quoted.
 */
export const HISTOIRE_DEV_NON_JSON_MEMBERS_RE =
    /,\s*component:\s*Comp\d+,\s*source:\s*\(\)\s*=>\s*import\((?:"[^"]*"|'[^']*')\)\s*\}/g

/** Glob suffix identifying a story source file. */
export const STORY_FILE_SUFFIX = '.story.vue'

/** Directory names never walked when collecting local story sources. */
export const STORY_WALK_IGNORED_DIRS = ['node_modules', 'dist']

/** Every `<Variant>` opening tag, titled or not — used to detect dynamic variants. */
export const VARIANT_OPEN_TAG_RE = /<Variant\b/g

/** Statically declared `<Variant title="…">` literals, in source order. */
export const VARIANT_STATIC_TITLE_RE = /<Variant\b[^>]*?\btitle\s*=\s*"([^"]*)"/gs

/**
 * How long to keep polling before declaring the served catalogue stale.
 *
 * `histoire dev` answers `/stories/` (and therefore satisfies Playwright's
 * `webServer.url` probe) well before it has finished executing every story
 * file, so a cold-started dev server legitimately reports a partial
 * catalogue for a few seconds. Polling until the catalogue matches converges
 * exactly when collection ends — a correct server costs one extra request,
 * a genuinely stale one costs this deadline, once, for the whole run.
 */
export const MANIFEST_GUARD_TIMEOUT_MS = 120_000

/** Delay between two polls of the served manifest. */
export const MANIFEST_GUARD_POLL_INTERVAL_MS = 1_000

/** Per-request timeout when fetching the served manifest. */
export const MANIFEST_FETCH_TIMEOUT_MS = 20_000

/** Number of drifting stories detailed in the abort message before truncating. */
export const MANIFEST_DRIFT_REPORT_LIMIT = 8

/** Number of variant titles listed per drifting story before truncating. */
export const MANIFEST_DRIFT_TITLE_LIMIT = 6
