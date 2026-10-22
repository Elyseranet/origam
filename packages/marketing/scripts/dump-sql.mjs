/**
 * dump-sql.mjs — regenerate server/assets/db-seed.sql via pg_dump (filtered).
 *
 * Extracted verbatim from generate-playgrounds.mjs (#191) so the SQL seed can
 * be regenerated UNCONDITIONALLY (docs:dump:sql / the docs-fixtures workflow),
 * not only when new playgrounds are generated. Both callers share this module —
 * single source of truth for the pg_dump args and the bootstrap-safe filter.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

import { DB_ENV } from '../src/consts/db.const.ts'

const marketingDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const dbSeedSql = path.join(marketingDir, 'src', 'server', 'assets', 'db-seed.sql')

// ─── pg_dump connection args ──────────────────────────────────────────────────

export function buildPgDumpArgs () {
    const env = process.env
    const databaseUrl = env[DB_ENV.URL]

    const baseArgs = [
        '--data-only',
        '--column-inserts',
        '--no-owner',
        '--no-acl',
        '--exclude-table=*migrations*',
    ]

    if (databaseUrl) {
        return { args: [...baseArgs, databaseUrl], pgEnv: env }
    }

    const host     = env[DB_ENV.HOST]
    const port     = env[DB_ENV.PORT] || '5432'
    const user     = env[DB_ENV.USER]
    const password = env[DB_ENV.PASSWORD]
    const dbName   = env[DB_ENV.NAME]

    if (!host || !dbName) {
        throw new Error(
            `Cannot build pg_dump command: set ${DB_ENV.URL} or ` +
            `${DB_ENV.HOST} + ${DB_ENV.NAME} in the environment.`,
        )
    }

    const args = [
        ...baseArgs,
        `--host=${host}`,
        `--port=${port}`,
        ...(user ? [`--username=${user}`] : []),
        dbName,
    ]
    const pgEnv = password ? { ...env, PGPASSWORD: password } : env
    return { args, pgEnv }
}

// ─── Filter ───────────────────────────────────────────────────────────────────

/** Filter pg_dump output to remove lines the bootstrap plugin cannot handle. */
export function filterPgDumpOutput (raw) {
    return raw
        .split('\n')
        .filter(line =>
            !line.startsWith('CREATE EXTENSION') &&
            !line.startsWith('COMMENT ON EXTENSION') &&
            !line.includes("set_config('search_path'") &&
            !line.startsWith('\\'),
        )
        .join('\n')
}

/**
 * Try to find a running Docker container that hosts the marketing DB.
 * Returns the container name or null when Docker is unavailable / no match.
 */
export function findDockerDbContainer () {
    try {
        const output = execFileSync('docker', [
            'ps', '--format', '{{.Names}}', '--filter', 'name=marketing-db',
        ], { encoding: 'utf-8' }).trim()
        return output.split('\n').find(Boolean) || null
    } catch {
        return null
    }
}

// ─── Regenerate server/assets/db-seed.sql ────────────────────────────────────

export function regenerateDbSeedSql () {
    console.log('\n→ Regenerating server/assets/db-seed.sql via pg_dump ...')

    const { args, pgEnv } = buildPgDumpArgs()

    let raw
    try {
        raw = execFileSync('pg_dump', args, {
            env:       pgEnv,
            maxBuffer: 100 * 1024 * 1024, // 100 MB
        }).toString()
    } catch (nativeErr) {
        if (nativeErr.code !== 'ENOENT') throw nativeErr

        // pg_dump not installed locally — try via docker exec
        const container = findDockerDbContainer()
        if (!container) {
            throw new Error(
                'pg_dump not found in PATH and no running Docker DB container detected. ' +
                'Install postgresql-client or start the docker-compose db service.',
            )
        }

        console.log(`   pg_dump not in PATH — using docker exec on ${container}`)

        // Build args for docker exec (no --host/--port, DB is local inside container)
        const env          = process.env
        const user         = env[DB_ENV.USER] || 'origam'
        const dbName       = env[DB_ENV.NAME] || 'origam_docs'
        const dockerArgs   = [
            'exec', '-e', `PGPASSWORD=${env[DB_ENV.PASSWORD] || 'origam'}`,
            container,
            'pg_dump',
            '--data-only', '--column-inserts', '--no-owner', '--no-acl',
            '--exclude-table=*migrations*',
            '-U', user, dbName,
        ]

        raw = execFileSync('docker', dockerArgs, {
            maxBuffer: 100 * 1024 * 1024,
        }).toString()
    }

    const filtered = filterPgDumpOutput(raw)
    fs.writeFileSync(dbSeedSql, filtered, 'utf-8')
    console.log(`   Written ${(Buffer.byteLength(filtered, 'utf-8') / 1024 / 1024).toFixed(1)} MB → ${dbSeedSql}`)
}
