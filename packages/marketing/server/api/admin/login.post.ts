import { verifyAdminPassword, getAdminSession } from '../../../src/utils/admin-auth.util'
/**
 * POST /api/admin/login
 *
 * Body: { password: string }
 *
 * Compares the submitted password against the scrypt hash stored in
 * NUXT_ADMIN_PASSWORD_HASH (via Nuxt runtimeConfig). On success, seals an
 * httpOnly session cookie (NUXT_SESSION_PASSWORD) and returns 200. On failure
 * returns 401 without leaking whether the user or password is wrong.
 *
 * Rate limiting and brute-force protection are expected to be handled by the
 * infrastructure layer (reverse proxy / CDN) — not in this handler.
 */

interface ILoginBody {
    password: string
}

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (raw): raw is ILoginBody => {
        if (typeof raw !== 'object' || raw === null) return false
        const b = raw as Record<string, unknown>
        return typeof b.password === 'string' && b.password.length > 0
    })

    if (!body) {
        throw createError({ statusCode: 400, statusMessage: 'Missing or invalid body: password (string) is required' })
    }

    const ok = await verifyAdminPassword(body.password)
    if (!ok) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const session = await getAdminSession(event)
    await session.update({ admin: true })

    return { ok: true }
})
