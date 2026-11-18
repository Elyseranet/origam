import { getAdminSession } from '../../../utils/admin-auth.util'
/**
 * POST /api/admin/logout
 *
 * Clears the admin session cookie. Always returns 204 No Content — even when
 * the caller had no session (idempotent from the client's perspective).
 */

export default defineEventHandler(async (event) => {
    const session = await getAdminSession(event)
    await session.clear()
    sendNoContent(event, 204)
})
