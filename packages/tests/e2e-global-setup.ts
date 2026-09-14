import {
    HISTOIRE_GUARD_SKIP_ENV,
    HISTOIRE_PORT_ENV,
    HISTOIRE_STATIC_ENV,
    HISTOIRE_STATIC_ON,
    MANIFEST_DRIFT_REPORT_LIMIT,
    MANIFEST_DRIFT_TITLE_LIMIT,
    MANIFEST_GUARD_POLL_INTERVAL_MS,
    MANIFEST_GUARD_TIMEOUT_MS
} from './e2e/_support/histoire-manifest.const'
import type { IHistoireStoryDrift } from './e2e/_support/histoire-manifest.interface'
import type { THistoireManifestSource } from './e2e/_support/histoire-manifest.type'
import {
    diffManifests,
    fetchServedManifest,
    readLocalStories,
    resolveHistoireBaseUrl,
    resolveHistoirePort
} from './e2e/_support/histoire-manifest'

/**
 * Playwright `globalSetup` — runs ONCE, after `webServer` is up and before
 * any spec, and aborts the whole run when the process answering the Histoire
 * port does not serve THIS worktree's story catalogue.
 *
 * ## What it removes
 *
 * `reuseExistingServer: !process.env.CI` makes Playwright adopt any process
 * already bound to the port, stale manifest included. Because Histoire
 * variant ids are positional (`${story.id}-${index}`), a single Variant added
 * since that server was started shifts or invalidates every `?variantId=`
 * a spec navigates to: Histoire falls back to its "Select a variant"
 * placeholder, mounts no sandbox iframe, and every selector times out — a
 * routing miss wearing the costume of a slow component. That misdiagnosis
 * cost several debugging rounds; see `e2e/menu.spec.ts`.
 *
 * ## Why here rather than in the specs
 *
 * 1193 `page.goto(variantUrl(…))` calls live across 56 specs, and 626 more
 * `page.goto` calls elsewhere — 175 spec files in total. A per-call-site fix
 * would be long, risky, and would still leave every spec it did not touch
 * exposed. The cause is removed once, centrally, for the whole suite: zero
 * spec edits, total coverage.
 *
 * ## Cost
 *
 * One HTTP request against a correct server (the local sources are read from
 * disk, ~210 small files). The polling loop only spins when the catalogue
 * does NOT match yet, which is also the legitimate cold-start state of a
 * freshly spawned `histoire dev` — it answers `/stories/` (satisfying
 * Playwright's `webServer.url` probe) before it has finished executing every
 * story file. Polling until match therefore converges exactly when collection
 * ends, and only a genuinely stale server pays the full timeout, once.
 */
export default async function globalSetup (): Promise<void> {
    if (process.env[HISTOIRE_GUARD_SKIP_ENV] === HISTOIRE_STATIC_ON) return

    const port = resolveHistoirePort()
    const baseUrl = resolveHistoireBaseUrl()
    const local = readLocalStories()

    const deadline = Date.now() + MANIFEST_GUARD_TIMEOUT_MS
    let lastDrifts: IHistoireStoryDrift[] | null = null
    // Falls back to the env var only when nothing answered: `playwright.vrt
    // .config.ts` serves a `histoire preview` WITHOUT setting E2E_STATIC, so
    // the detected mode — not the env var — is what makes the remediation
    // command in the abort message correct.
    let servedSource: THistoireManifestSource | null = null

    for (;;) {
        const served = await fetchServedManifest(baseUrl)
        if (served) {
            servedSource = served.source
            const drifts = diffManifests(local, served.stories)
            if (!drifts.length) {
                console.log(
                    `[histoire-guard] ${served.source} server on :${port} serves this worktree's `
                    + `catalogue (${served.stories.length} stories, `
                    + `${served.stories.reduce((total, story) => total + story.variants.length, 0)} variants).`
                )
                return
            }
            lastDrifts = drifts
            if (isSettled(served.source, drifts)) break
        }

        if (Date.now() >= deadline) break
        await new Promise((done) => setTimeout(done, MANIFEST_GUARD_POLL_INTERVAL_MS))
    }

    const isStatic = servedSource === null
        ? process.env[HISTOIRE_STATIC_ENV] === HISTOIRE_STATIC_ON
        : servedSource === 'static'

    throw new Error(buildAbortMessage({
        baseUrl,
        port,
        isStatic,
        sawHistoire: servedSource !== null,
        drifts: lastDrifts,
        localCount: local.length
    }))
}

/**
 * Whether the observed drift can be acted on now, or might still be a server
 * that has not finished collecting.
 *
 * - `static` — a `histoire preview` bundle is a frozen artefact. Re-reading
 *   it can only ever return the same answer, so waiting is pure dead time.
 * - `dev` — a story enters the catalogue only once `executeStoryFile` has
 *   run it, and `@histoire/plugin-vue` fills `story.variants` synchronously
 *   during that run. A story is therefore never visible with a partial
 *   variant list: `variant-drift` and `foreign-story` cannot be transient
 *   and are decided immediately. `missing-story` CAN be transient — a
 *   cold-started dev server serves an empty catalogue until collection ends
 *   (measured on this worktree: 0 stories until 6.9s, then all 210 at once,
 *   with no story ever mutating its variant count afterwards) — so that one
 *   kind, and only that one, keeps polling until the deadline.
 */
function isSettled (source: THistoireManifestSource, drifts: IHistoireStoryDrift[]): boolean {
    if (source === 'static') return true
    return drifts.some((drift) => drift.kind !== 'missing-story')
}

interface IAbortContext {
    baseUrl: string
    port: string
    isStatic: boolean
    /** True once any poll obtained a parseable Histoire catalogue. */
    sawHistoire: boolean
    drifts: IHistoireStoryDrift[] | null
    localCount: number
}

/** Truncates a list for the report, saying how many were left out. */
function summariseTitles (titles: string[]): string {
    if (!titles.length) return '—'
    const shown = titles.slice(0, MANIFEST_DRIFT_TITLE_LIMIT).map((title) => `"${title}"`).join(', ')
    const hidden = titles.length - MANIFEST_DRIFT_TITLE_LIMIT
    return hidden > 0 ? `${shown} (+${hidden} more)` : shown
}

/**
 * The abort message the user actually reads. It has to name the cause, prove
 * it with the concrete divergence, and hand over the exact commands — the
 * whole point of the guard is that nobody spends another debugging round on
 * "the component is slow".
 */
function buildAbortMessage (context: IAbortContext): string {
    const { baseUrl, port, isStatic, sawHistoire, drifts, localCount } = context
    const rebuild = isStatic
        ? 'pnpm -F @origam/stories build   # E2E_STATIC=1 serves a PREBUILT bundle — it will not pick up story edits on its own'
        : 'pnpm -F @origam/stories dev'

    const lines = [
        '',
        '  ✗ Histoire server on this port does NOT serve this worktree\'s stories — run aborted.',
        ''
    ]

    if (!sawHistoire) {
        lines.push(
            `  Nothing on ${baseUrl}/stories/ answered with a Histoire story catalogue (neither the`,
            '  static `histoire.json` nor the dev `virtual:$histoire-stories` module). Either the port',
            '  is held by a different application entirely, or the Histoire process died after',
            '  Playwright\'s webServer probe succeeded.'
        )
    } else {
        lines.push(
            `  ${drifts?.length ?? 0} of ${localCount} local stories diverge from what the server routes.`,
            '',
            '  Histoire variant ids are POSITIONAL (`${storyId}-${index}`), so this makes',
            '  `?variantId=…` resolve to the wrong Variant — or to none, in which case Histoire',
            '  renders its "Select a variant" placeholder, never mounts a sandbox iframe, and every',
            '  spec times out looking like a slow component instead of a routing miss.',
            ''
        )
        for (const drift of (drifts ?? []).slice(0, MANIFEST_DRIFT_REPORT_LIMIT)) {
            if (drift.kind === 'missing-story') {
                lines.push(`  • [absent from server] ${drift.relativePath} (${drift.storyId})`)
            } else if (drift.kind === 'foreign-story') {
                lines.push(`  • [served but not in this worktree] ${drift.storyId}`)
            } else {
                lines.push(`  • [variant drift] ${drift.relativePath}`)
                lines.push(`      declared here, not served : ${summariseTitles(drift.missingTitles)}`)
                lines.push(`      served, not declared here : ${summariseTitles(drift.extraTitles)}`)
            }
        }
        const hidden = (drifts?.length ?? 0) - MANIFEST_DRIFT_REPORT_LIMIT
        if (hidden > 0) lines.push(`  … and ${hidden} more.`)
    }

    lines.push(
        '',
        '  Most likely cause: `reuseExistingServer: !process.env.CI` (playwright.config.ts) silently',
        '  adopted a `histoire dev`/`preview` left over from another run or another worktree.',
        '',
        '  Identify and kill it, then re-run:',
        `      lsof -i :${port}`,
        `      kill <PID>`,
        '',
        '  If the process IS this worktree\'s, its manifest is simply older than the stories — restart it:',
        `      ${rebuild}`,
        '',
        `  Port is set by ${HISTOIRE_PORT_ENV} (currently :${port}).`,
        `  To bypass this check deliberately: ${HISTOIRE_GUARD_SKIP_ENV}=${HISTOIRE_STATIC_ON}`,
        ''
    )

    return lines.join('\n')
}
