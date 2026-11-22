import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { PASSWORD_ENTRY_PREFIX } from '../consts/mcp.const.ts'
import type { TEnvName } from '../types/mcp.type.ts'

const run = promisify(execFile)

/**
 * Mot de passe admin d'un env : trousseau macOS d'abord, variable d'env de
 * repli. Lu a chaque appel de login, jamais journalise ni persiste.
 */
export async function readAdminPassword (env: TEnvName): Promise<string> {
    const entry = `${PASSWORD_ENTRY_PREFIX}${env.toUpperCase()}`
    try {
        const { stdout } = await run('security', ['find-generic-password', '-s', entry, '-w'])
        const value = stdout.replace(/\r?\n$/, '')
        if (value) return value
    } catch {
        // entree absente ou `security` indisponible (non-macOS) : repli env
    }
    const fallback = process.env[entry]
    if (fallback) return fallback
    throw new Error(
        `Mot de passe admin introuvable pour l'env "${env}". Cree l'entree trousseau :\n`
        + `  security add-generic-password -a "$USER" -s ${entry} -w\n`
        + `ou exporte la variable d'environnement ${entry}.`
    )
}
