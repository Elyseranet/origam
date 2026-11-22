import { describe, expect, it, vi } from 'vitest'
import { McpHttpError, OrigamApiClient } from '../src/utils/http-client.util.ts'

const SECRET = 'hunter2-secret'

function client (fetchImpl: typeof fetch, env: Record<string, string> = {}, timeoutMs?: number) {
    return new OrigamApiClient({
        fetchImpl,
        getPassword: async () => SECRET,
        readEnv: n => env[n],
        timeoutMs
    })
}

const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { status: 200, ...init })
const login = () => new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'set-cookie': 'h3=sealed123; Path=/; HttpOnly' } })

describe('OrigamApiClient', () => {
    it('resout les URLs par env et la surcharge locale', () => {
        const c = client(vi.fn(), { ORIGAM_MCP_LOCAL_URL: 'http://localhost:4000/' })
        expect(c.baseUrl('local')).toBe('http://localhost:4000')
        expect(c.baseUrl('dev')).toBe('https://origam.dev.elysera.net')
        expect(c.baseUrl('prod')).toBe('https://origam.elysera.net')
    })

    it('GET : query sans undefined, JSON parse', async () => {
        const f = vi.fn(async (_u: URL | string) => json({ status: "ok" }))
        const r = await client(f as unknown as typeof fetch).request('local', 'GET', '/api/reference/component', { query: { category: 'Forms', limit: undefined, orphaned: 1 } })
        expect(r).toEqual({ status: 'ok' })
        expect(String(f.mock.calls[0]![0])).toBe('http://localhost:3000/api/reference/component?category=Forms&orphaned=1')
    })

    it('non-2xx : McpHttpError typee avec statut et statusMessage', async () => {
        const f = vi.fn(async () => json({ statusMessage: 'component \'x\' not found' }, { status: 404 }))
        const err: any = await client(f as unknown as typeof fetch).request('local', 'GET', '/api/reference/component/x').catch(e => e)
        expect(err).toBeInstanceOf(McpHttpError)
        expect(err.status).toBe(404)
        expect(err.message).toContain('not found')
    })

    it('timeout : erreur typee, signal AbortSignal transmis', async () => {
        const f = vi.fn(async (_u: unknown, init?: RequestInit) => new Promise<Response>((_res, rej) => {
            init!.signal!.addEventListener('abort', () => rej(init!.signal!.reason))
        }))
        const err: any = await client(f as unknown as typeof fetch, {}, 20).request('local', 'GET', '/api/health').catch(e => e)
        expect(err).toBeInstanceOf(McpHttpError)
        expect(err.message).toContain('timeout')
    })

    it('admin : login auto, cookie renvoye, reconnexion unique sur 401', async () => {
        let calls = 0
        const f = vi.fn(async (u: URL, init?: RequestInit) => {
            if (String(u).endsWith('/api/admin/login')) return login()
            calls++
            const cookie = (init!.headers as Record<string, string>).Cookie
            expect(cookie).toBe('h3=sealed123')
            return calls === 1 ? json({ statusMessage: 'Unauthorized' }, { status: 401 }) : json([{ id: 1 }])
        })
        const r = await client(f as unknown as typeof fetch).request('local', 'GET', '/api/admin/reference/sync/runs', { admin: true })
        expect(r).toEqual([{ id: 1 }])
        expect(f.mock.calls.filter(c => String(c[0]).endsWith('/login'))).toHaveLength(2)
    })

    it('garde prod-write : ecriture admin refusee, lecture admin et flag OK', async () => {
        const f = vi.fn(async (u: URL) => String(u).endsWith('/login') ? login() : json({ ok: true }))
        const blocked: any = await client(f as unknown as typeof fetch).request('prod', 'POST', '/api/admin/reference/sync', { admin: true }).catch(e => e)
        expect(blocked).toBeInstanceOf(McpHttpError)
        expect(blocked.message).toContain('ORIGAM_MCP_ALLOW_PROD_WRITE=1')
        expect(f).not.toHaveBeenCalled()

        await expect(client(f as unknown as typeof fetch).request('prod', 'GET', '/api/admin/reference/sync/runs', { admin: true })).resolves.toEqual({ ok: true })
        await expect(client(f as unknown as typeof fetch, { ORIGAM_MCP_ALLOW_PROD_WRITE: '1' }).request('prod', 'POST', '/api/admin/reference/sync', { admin: true })).resolves.toEqual({ ok: true })
        // les routes publiques ne sont jamais gardees
        await expect(client(f as unknown as typeof fetch).request('prod', 'GET', '/api/health')).resolves.toEqual({ ok: true })
    })

    it('aucune fuite du mot de passe dans les erreurs (login refuse, corps echo)', async () => {
        const f = vi.fn(async () => json({ statusMessage: `bad password ${SECRET}` }, { status: 401 }))
        const err: any = await client(f as unknown as typeof fetch).request("local", "GET", "/api/admin/reference/sync/runs", { admin: true }).catch(e => e)
        expect(err).toBeInstanceOf(McpHttpError)
        expect(err.message).not.toContain(SECRET)
        expect(String(err.stack)).not.toContain(SECRET)
        expect(err.url).not.toContain(SECRET)
    })

    it('le mot de passe n\'est envoye que dans le corps du login', async () => {
        const f = vi.fn(async (u: URL) => String(u).endsWith('/login') ? login() : json([]))
        await client(f as unknown as typeof fetch).request('local', 'GET', '/api/admin/reference/sync/runs', { admin: true })
        const withSecret = f.mock.calls.filter(c => JSON.stringify(c).includes(SECRET))
        expect(withSecret).toHaveLength(1)
        expect(String(withSecret[0]![0])).toContain('/api/admin/login')
    })

    it('logout verrouille : ecriture refusee sans appel login ; login deverrouille', async () => {
        const f = vi.fn(async (u: URL) => String(u).endsWith('/login') ? login() : json({ ok: true }))
        const c = client(f as unknown as typeof fetch)
        await c.request('local', 'GET', '/api/admin/reference/sync/runs', { admin: true })
        await c.logout('local')
        const loginsBefore = f.mock.calls.filter(x => String(x[0]).endsWith('/login')).length
        const err: any = await c.request('local', 'PATCH', '/api/admin/reference/component/alert', { admin: true, body: {} }).catch(e => e)
        expect(err).toBeInstanceOf(McpHttpError)
        expect(err.message).toContain('origam_admin_login')
        expect(f.mock.calls.filter(x => String(x[0]).endsWith('/login'))).toHaveLength(loginsBefore)
        // le verrou est par env
        await expect(c.request('dev', 'GET', '/api/admin/reference/sync/runs', { admin: true })).resolves.toEqual({ ok: true })
        await c.login('local')
        await expect(c.request('local', 'PATCH', '/api/admin/reference/component/alert', { admin: true, body: {} })).resolves.toEqual({ ok: true })
    })
})
