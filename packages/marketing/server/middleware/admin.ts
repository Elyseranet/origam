import { assertAdminSession } from '../../src/utils/admin-auth.util'
/**
 * server/middleware/admin.ts — auth guard for the backoffice API.
 *
 * This is a Nitro server middleware (applies globally to all routes). It gates
 * every request whose path starts with /api/admin/ and is NOT login or logout
 * (those must be reachable unauthenticated by definition).
 *
 * The public /api/reference/** routes are never touched — this middleware
 * returns early for anything outside /api/admin/.
 */

export default defineEventHandler(async (event) => {
    const path = getRequestURL(event).pathname

    if (!path.startsWith('/api/admin/')) return

    const isAuthRoute = path === '/api/admin/login' || path === '/api/admin/logout'
    if (isAuthRoute) return

    await assertAdminSession(event)
})
