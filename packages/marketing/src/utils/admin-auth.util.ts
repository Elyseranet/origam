/**
 * admin-auth.ts — backoffice authentication helpers.
 *
 * Password hashing uses Node's built-in `crypto.scrypt` (no external dep).
 * The stored hash format is `<salt-hex>:<derived-hex>` where the salt is 16
 * random bytes and the derived key is 64 bytes (scrypt N=16384, r=8, p=1).
 *
 * Generate a hash for a new password:
 *
 *   node -e "
 *     const { scryptSync, randomBytes } = require('crypto')
 *     const salt = randomBytes(16).toString('hex')
 *     const hash = scryptSync('YOUR_PASSWORD', salt, 64).toString('hex')
 *     console.log(salt + ':' + hash)
 *   "
 *
 * Then set NUXT_ADMIN_PASSWORD_HASH=<output> in your environment.
 *
 * Sessions ride on sealed cookies (h3 `useSession`). The seal secret is
 * NUXT_SESSION_PASSWORD (min 32 chars). Both env vars are read through
 * Nuxt runtimeConfig — never hardcoded.
 */

import { scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

/** Session config object — pulled from runtimeConfig each call so hot-reload works. */
function sessionConfig (event: Parameters<typeof useSession>[0]) {
    const cfg = useRuntimeConfig()
    const password = cfg.sessionPassword as string
    if (!password || password.length < 32) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server misconfiguration: NUXT_SESSION_PASSWORD must be at least 32 characters',
        })
    }
    // The `Secure` cookie attribute is derived from the ACTUAL request protocol
    // (x-forwarded-proto aware). A `Secure` cookie is silently dropped by the
    // browser over plain HTTP — so an http-only dev/stage env would set the
    // session cookie at login but never receive it back, breaking every
    // /api/admin/** request with a 401. Over HTTPS the cookie stays Secure.
    const secure = getRequestProtocol(event) === 'https'
    return {
        password,
        maxAge: 60 * 60 * 8, /* 8 h */
        cookie: {
            httpOnly: true,
            sameSite: 'lax' as const,
            path: '/',
            secure,
        },
    }
}

/**
 * Verify `candidate` against the stored scrypt hash from NUXT_ADMIN_PASSWORD_HASH.
 * Returns false (never throws) when the hash is missing or malformed so the
 * caller always surfaces a uniform 401.
 */
export async function verifyAdminPassword (candidate: string): Promise<boolean> {
    const cfg = useRuntimeConfig()
    const stored = cfg.adminPasswordHash as string | undefined
    if (!stored || !stored.includes(':')) return false

    const [saltHex, hashHex] = stored.split(':')
    if (!saltHex || !hashHex) return false

    try {
        const storedBuf = Buffer.from(hashHex, 'hex')
        const derived = (await scryptAsync(candidate, saltHex, 64)) as Buffer
        if (derived.length !== storedBuf.length) return false
        return timingSafeEqual(storedBuf, derived)
    } catch {
        return false
    }
}

/** Read (and seal-validate) the current admin session. */
export async function getAdminSession (event: Parameters<typeof useSession>[0]) {
    return useSession<{ admin?: boolean }>(event, sessionConfig(event))
}

/**
 * Throws 401 when there is no valid admin session.
 * Called by server/middleware/admin.ts for every /api/admin/** request (except login/logout).
 */
export async function assertAdminSession (event: Parameters<typeof useSession>[0]): Promise<void> {
    const session = await getAdminSession(event)
    if (!session.data?.admin) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
}
