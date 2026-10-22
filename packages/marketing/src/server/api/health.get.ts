import { isDbConfigured, pingDb } from '../../utils/db.util'
// Liveness probe for container orchestrators (Coolify healthcheck GETs
// /api/health). The Nitro server being able to answer IS the liveness signal —
// it always returns 200 so a merely-unreachable API-Reference database never
// fails the container healthcheck and rolls back a deploy. DB reachability is
// surfaced as an informational `db` block for observability/readiness dashboards
// (gate on `db.ok` there, not on the HTTP status of this liveness probe).

export default defineEventHandler(async (): Promise<IHealthResponse> => {
    const configured = isDbConfigured()
    const ok = configured ? await pingDb() : false

    return {
        status: 'ok',
        db: { configured, ok }
    }
})
