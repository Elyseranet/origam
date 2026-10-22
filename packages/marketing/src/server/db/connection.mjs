/**
 * connection.mjs — resolve the TypeORM postgres connection options from the
 * environment. Shared by the DataSource (runtime + migrations) and the
 * ingestion pipeline. No secret is ever hardcoded: everything reads from the
 * process environment (see DB_ENV in src/consts/db.const.ts).
 */

import { DB_ENV, DB_DEFAULTS } from '../../consts/db.const.ts'

/** Truthy string → SSL config accepted by node-postgres. Empty → no SSL. */
function parseSsl (raw) {
    if (!raw) return undefined
    const v = String(raw).toLowerCase()
    if (v === 'false' || v === '0' || v === 'no' || v === 'disable') return undefined
    // Managed Postgres (Coolify/most providers) presents a self-signed chain.
    return { rejectUnauthorized: false }
}

/**
 * Build the TypeORM postgres connection options from the environment.
 * Primary form = the discrete NUXT_DB_* variables (Nuxt runtimeConfig
 * convention); DATABASE_URL is an optional override that takes precedence.
 * Throws a clear, secret-free error when nothing is configured.
 *
 * @param {NodeJS.ProcessEnv} [env]
 */
export function resolveConnection (env = process.env) {
    const url = env[DB_ENV.URL]
    const ssl = parseSsl(env[DB_ENV.SSL])

    if (url) {
        return ssl ? { url, ssl } : { url }
    }

    const host = env[DB_ENV.HOST]
    if (!host) {
        throw new Error(
            `Database connection is not configured. Set ${DB_ENV.URL} ` +
            `(e.g. postgres://user:pass@host:5432/db) or the discrete ` +
            `${DB_ENV.HOST}/${DB_ENV.PORT}/${DB_ENV.USER}/${DB_ENV.PASSWORD}/${DB_ENV.NAME} variables.`
        )
    }

    return {
        host,
        port: Number(env[DB_ENV.PORT]) || DB_DEFAULTS.PORT,
        username: env[DB_ENV.USER],
        password: env[DB_ENV.PASSWORD],
        database: env[DB_ENV.NAME],
        ...(ssl ? { ssl } : {}),
    }
}

/** True when at least the minimum connection inputs are present. */
export function isConfigured (env = process.env) {
    return Boolean(env[DB_ENV.URL] || env[DB_ENV.HOST])
}
