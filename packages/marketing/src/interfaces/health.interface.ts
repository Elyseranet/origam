/** Réponse de `GET /api/health` : sonde de vivacité, la base n'y figure qu'à titre informatif. */
export interface IHealthResponse {
    status: 'ok'
    db: {
        configured: boolean
        ok: boolean
    }
}
