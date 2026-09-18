/**
 * server/middleware/ci-db-required.ts — #835.
 *
 * `00.db-bootstrap.ts` already refuses to seed/sync when the database is
 * unconfigured under `process.env.CI`, and logs a clear, actionable error at
 * boot. That log alone is not enough to make the failure IMPOSSIBLE to miss:
 * measured directly against this repo's own dev server (`nuxt dev`), a Nitro
 * plugin that `throw`s or calls `process.exit()` during startup does NOT
 * terminate the process Playwright's `webServer` tracks — Nuxt dev runs the
 * Nitro server inside its own isolated dev worker (the same "worker SSR"
 * this repo's tickets already name elsewhere), and:
 *   - `process.exit()` there kills only that worker — the outer process keeps
 *     the port bound and starts answering every request with a bare 500;
 *   - a thrown/rejected plugin is caught by Nitro's own global
 *     `unhandledRejection` handler (dev-mode resilience, by design) and only
 *     logged — the server keeps running, still able to render an empty
 *     catalogue as a plain 200.
 * Neither on its own converts the boot-time refusal into a signal a test run
 * cannot miss. This middleware is that signal: with the DB unconfigured under
 * CI, EVERY request gets an identical, loud 503 instead of a silently-empty
 * 200 page — the exact failure #835 diagnosed (69 e2e failures that looked
 * like 13 broken specs, when the actual cause was one missing dependency)
 * cannot recur, because there is no code path left that renders content
 * without a working database in that context.
 */

import { DB_ENV } from '../db/db.const.mjs'

export default defineEventHandler(() => {
    if (!process.env.CI || isDbConfigured()) return

    throw createError({
        statusCode: 503,
        statusMessage: 'Database is not configured',
        message: '[db-bootstrap] DB non configurée sous CI — requête refusée (#835). ' +
            `Renseigne ${DB_ENV.URL} ou l'ensemble discret ` +
            `${[DB_ENV.HOST, DB_ENV.PORT, DB_ENV.USER, DB_ENV.PASSWORD, DB_ENV.NAME].join(', ')}.`
    })
})
