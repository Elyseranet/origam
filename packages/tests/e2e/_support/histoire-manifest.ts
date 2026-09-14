import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    HISTOIRE_BASE_PATH,
    HISTOIRE_DEFAULT_PORT,
    HISTOIRE_DEV_FILES_MARKER,
    HISTOIRE_DEV_MANIFEST_PATH,
    HISTOIRE_DEV_NON_JSON_MEMBERS_RE,
    HISTOIRE_DEV_TREE_MARKER,
    HISTOIRE_PORT_ENV,
    HISTOIRE_STATIC_MANIFEST_PATH,
    MANIFEST_FETCH_TIMEOUT_MS,
    STORY_FILE_SUFFIX,
    STORY_WALK_IGNORED_DIRS,
    VARIANT_OPEN_TAG_RE,
    VARIANT_STATIC_TITLE_RE
} from './histoire-manifest.const'
import type {
    IHistoireLocalStory,
    IHistoireServedManifest,
    IHistoireServedStory,
    IHistoireStoryDrift
} from './histoire-manifest.interface'

/**
 * Reads the story catalogue the running Histoire server actually serves and
 * compares it to the `*.story.vue` sources of the CURRENT worktree.
 *
 * ## The failure class this exists to kill
 *
 * `playwright.config.ts` sets `reuseExistingServer: !process.env.CI`, so
 * Playwright silently adopts ANY process already bound to the Histoire port
 * — including a `histoire dev` / `histoire preview` left behind by another
 * run, another worktree, or a killed session, whose story manifest predates
 * a Variant that a spec now navigates to.
 *
 * Variant ids are POSITIONAL (`${story.id}-${index}` — generated
 * synchronously by `@histoire/plugin-vue` from `story.variants.length`), so a
 * Variant added at the end of a story makes `?variantId=<id>-<n>` resolve to
 * nothing on the stale server. Histoire then renders its "Select a variant"
 * placeholder and never mounts a sandbox iframe at all. Every selector the
 * spec waits for times out, and the failure reads as "the component is slow"
 * when it is really a routing miss against the wrong server. Reproduced and
 * confirmed; see the diagnostic block in `e2e/menu.spec.ts`.
 *
 * ## Why the catalogue is read over HTTP rather than assumed
 *
 * Only the process answering the port can say what it will actually route.
 * Two endpoints expose that, one per mode:
 *
 * - `E2E_STATIC=1` (`histoire preview`) serves the build's `histoire.json`,
 *   written by `histoire build` (`histoire/dist/node/build.js`).
 * - Default (`histoire dev`) never writes that file. The catalogue lives
 *   only as the Vite virtual module `virtual:$histoire-stories`, served as a
 *   JS module at `/__resolved__virtual:$histoire-stories`. Its `export let
 *   files = […]` array carries the same per-story `variants: [{ id, title }]`
 *   payload, plus two non-JSON members that are stripped before parsing.
 *
 * Both are probed in that order, so the guard works without being told which
 * mode it is in — and a port answered by something that is not Histoire at
 * all (the marketing site, a stray Vite, a killed server's replacement)
 * yields neither, which is itself reported as a distinct, named cause.
 *
 * ## Why source parsing is trustworthy here
 *
 * Measured against a fresh `pnpm -F @origam/stories build` on this worktree:
 * 210 story files, 1938 `<Variant>` tags, 1938 of them carrying a static
 * `title="…"` — the ordered title list matches the built manifest story for
 * story, with zero divergence, and every served variant id matches
 * `${storyId}-${index}`. Ordered equality is therefore enforced. Should a
 * story ever build Variants dynamically (`:title`, `v-for`, `v-if`), its tag
 * count stops matching its static-title count and only a subset check is
 * applied to THAT story — the guard degrades for the one file concerned
 * instead of crying wolf across the suite.
 */

const HERE = dirname(fileURLToPath(import.meta.url))

/** `packages/stories` — the single source of truth for the story catalogue. */
export const STORIES_PACKAGE_ROOT = resolve(HERE, '..', '..', '..', 'stories')

/** Port the Histoire server is expected on — mirrors `playwright.config.ts`. */
export function resolveHistoirePort (): string {
    return process.env[HISTOIRE_PORT_ENV] ?? HISTOIRE_DEFAULT_PORT
}

/** Origin the guard (and the specs) talk to. */
export function resolveHistoireBaseUrl (): string {
    return `http://localhost:${resolveHistoirePort()}`
}

/**
 * Replicates Histoire's auto story id: the story file's path relative to the
 * stories package, lowercased, every run of non-alphanumerics collapsed to a
 * single `-`. Same derivation as `e2e/_support/audit-variant-titles.mjs`.
 */
export function storyIdForFile (storyFile: string): string {
    return relative(STORIES_PACKAGE_ROOT, storyFile)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/** Recursively collects `*.story.vue` files, skipping build output and deps. */
function collectStoryFiles (dir: string, acc: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
        if (name.startsWith('.') || STORY_WALK_IGNORED_DIRS.includes(name)) continue
        const full = join(dir, name)
        if (statSync(full).isDirectory()) collectStoryFiles(full, acc)
        else if (full.endsWith(STORY_FILE_SUFFIX)) acc.push(full)
    }
    return acc
}

/** The story catalogue as the current worktree declares it. */
export function readLocalStories (): IHistoireLocalStory[] {
    return collectStoryFiles(STORIES_PACKAGE_ROOT).map((file) => {
        const source = readFileSync(file, 'utf8')
        const staticTitles: string[] = []
        const titleRe = new RegExp(VARIANT_STATIC_TITLE_RE.source, VARIANT_STATIC_TITLE_RE.flags)
        let match: RegExpExecArray | null
        while ((match = titleRe.exec(source)) !== null) staticTitles.push(match[1])
        const openTags = source.match(VARIANT_OPEN_TAG_RE)?.length ?? 0

        return {
            id: storyIdForFile(file),
            relativePath: relative(STORIES_PACKAGE_ROOT, file),
            staticTitles,
            fullyStatic: openTags === staticTitles.length
        }
    })
}

/** GET helper that never throws on a dead / slow port — returns null instead. */
async function fetchText (url: string): Promise<string | null> {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(MANIFEST_FETCH_TIMEOUT_MS) })
        if (!response.ok) return null
        return await response.text()
    } catch {
        return null
    }
}

/** Normalises either endpoint's payload down to `{ id, title, variants }`. */
function toServedStories (raw: unknown[]): IHistoireServedStory[] {
    const stories: IHistoireServedStory[] = []
    for (const entry of raw) {
        const story = (entry as { story?: unknown }).story ?? entry
        const { id, title, variants } = story as IHistoireServedStory
        if (typeof id !== 'string') continue
        stories.push({ id, title, variants: Array.isArray(variants) ? variants : [] })
    }
    return stories
}

/**
 * Reads `histoire.json` — present only when the port is served by
 * `histoire preview` over a `histoire build` output (`E2E_STATIC=1`).
 *
 * A dev server answers the same URL with its SPA fallback (`text/html`), so
 * the payload is validated by parsing rather than by status code.
 */
async function fetchStaticManifest (baseUrl: string): Promise<IHistoireServedManifest | null> {
    const body = await fetchText(`${baseUrl}${HISTOIRE_BASE_PATH}${HISTOIRE_STATIC_MANIFEST_PATH}`)
    if (body === null) return null
    try {
        const parsed = JSON.parse(body) as { stories?: unknown }
        if (!Array.isArray(parsed.stories)) return null
        return { source: 'static', stories: toServedStories(parsed.stories) }
    } catch {
        return null
    }
}

/** Reads the `virtual:$histoire-stories` module served by `histoire dev`. */
async function fetchDevManifest (baseUrl: string): Promise<IHistoireServedManifest | null> {
    const body = await fetchText(`${baseUrl}${HISTOIRE_BASE_PATH}${HISTOIRE_DEV_MANIFEST_PATH}`)
    if (body === null) return null

    const start = body.indexOf(HISTOIRE_DEV_FILES_MARKER)
    const end = body.indexOf(HISTOIRE_DEV_TREE_MARKER)
    if (start === -1 || end === -1 || end <= start) return null

    const array = body
        .slice(start + HISTOIRE_DEV_FILES_MARKER.length, end)
        .replace(HISTOIRE_DEV_NON_JSON_MEMBERS_RE, '}')
    try {
        const parsed = JSON.parse(array) as unknown[]
        if (!Array.isArray(parsed)) return null
        return { source: 'dev', stories: toServedStories(parsed) }
    } catch {
        return null
    }
}

/** The story catalogue whatever answers the port will actually route to. */
export async function fetchServedManifest (baseUrl: string): Promise<IHistoireServedManifest | null> {
    return (await fetchStaticManifest(baseUrl)) ?? (await fetchDevManifest(baseUrl))
}

/**
 * Every divergence between the worktree's stories and the served catalogue.
 * An empty array means the server routes exactly what the specs were written
 * against.
 */
export function diffManifests (
    local: IHistoireLocalStory[],
    served: IHistoireServedStory[]
): IHistoireStoryDrift[] {
    const servedById = new Map(served.map((story) => [story.id, story]))
    const localById = new Map(local.map((story) => [story.id, story]))
    const drifts: IHistoireStoryDrift[] = []

    for (const story of local) {
        const match = servedById.get(story.id)
        if (!match) {
            drifts.push({
                kind: 'missing-story',
                storyId: story.id,
                relativePath: story.relativePath,
                missingTitles: story.staticTitles,
                extraTitles: []
            })
            continue
        }

        const servedTitles = match.variants.map((variant) => variant.title)
        const missingTitles = story.staticTitles.filter((title) => !servedTitles.includes(title))
        // Ordered equality is only asserted when the source fully determines
        // the runtime list; otherwise a dynamic Variant would look like drift.
        const extraTitles = story.fullyStatic
            ? servedTitles.filter((title) => !story.staticTitles.includes(title))
            : []
        const reordered = story.fullyStatic
            && !missingTitles.length
            && !extraTitles.length
            && servedTitles.join(' ') !== story.staticTitles.join(' ')

        if (missingTitles.length || extraTitles.length || reordered) {
            drifts.push({
                kind: 'variant-drift',
                storyId: story.id,
                relativePath: story.relativePath,
                missingTitles,
                extraTitles: reordered ? servedTitles : extraTitles
            })
        }
    }

    for (const story of served) {
        if (localById.has(story.id)) continue
        drifts.push({
            kind: 'foreign-story',
            storyId: story.id,
            relativePath: '',
            missingTitles: [],
            extraTitles: story.variants.map((variant) => variant.title)
        })
    }

    return drifts
}
