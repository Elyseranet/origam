import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/*
 * Integration : lance le serveur en stdio. Les tests qui ont besoin d'un
 * serveur marketing (ORIGAM_MCP_LOCAL_URL, defaut :3000) ou de l'hote du
 * playground (ORIGAM_MCP_PLAYGROUND_URL, defaut :5183, partie A de #1441)
 * sont ignores s'ils ne repondent pas. Voir README.
 */
const MARKETING = process.env.ORIGAM_MCP_LOCAL_URL ?? 'http://localhost:3000'
const PLAYGROUND = process.env.ORIGAM_MCP_PLAYGROUND_URL ?? 'http://localhost:5183'

async function up (url: string): Promise<boolean> {
    try {
        return (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok
    } catch {
        return false
    }
}
async function playgroundDriveable (): Promise<boolean> {
    try {
        // la partie A ajoute le pilotage URL : l'hote repond alors a ?scene=
        return (await up(PLAYGROUND)) && (await (await fetch(PLAYGROUND)).text()).includes('playground')
    } catch {
        return false
    }
}

const [marketingUp, playgroundUp] = await Promise.all([up(`${MARKETING}/api/health`), playgroundDriveable()])

let client: Client
beforeAll(async () => {
    client = new Client({ name: 'test', version: '0.0.0' })
    await client.connect(new StdioClientTransport({ command: 'node', args: ['src/index.ts'], env: { ...process.env as Record<string, string> } }))
})
afterAll(async () => { await client.close() })

const text = (r: any) => r.content.find((c: any) => c.type === 'text').text as string

describe('serveur MCP (stdio)', () => {
    it('liste les outils API et playground', async () => {
        const names = (await client.listTools()).tools.map(t => t.name)
        expect(names).toEqual(expect.arrayContaining(['origam_health', 'origam_reference_list', 'origam_admin_sync', 'playground_render', 'playground_diff', 'playground_sweep']))
        expect(names.length).toBe(23)
    })

    it('refuse une ecriture admin en prod sans le flag', async () => {
        const r: any = await client.callTool({ name: 'origam_admin_sync', arguments: { env: 'prod' } })
        expect(r.isError).toBe(true)
        expect(text(r)).toContain('ORIGAM_MCP_ALLOW_PROD_WRITE=1')
    })

    it.skipIf(!marketingUp)('health + reference contre le marketing local', async () => {
        const h: any = await client.callTool({ name: 'origam_health', arguments: {} })
        expect(JSON.parse(text(h)).status).toBe('ok')
        const l: any = await client.callTool({ name: 'origam_reference_list', arguments: { kind: 'component', limit: 2 } })
        // sans base configuree le marketing repond 503 : l'outil doit relayer l'erreur typee
        if (JSON.parse(text(h)).db.ok) expect(Array.isArray(JSON.parse(text(l)))).toBe(true)
        else {
            expect(l.isError).toBe(true)
            expect(text(l)).toContain('HTTP 503')
        }
    })

    it.skipIf(!playgroundUp)('playground_render (partie A requise)', async () => {
        const r: any = await client.callTool({ name: 'playground_render', arguments: { component: 'origam-btn', props: { color: 'primary' }, slot: 'Hello' } })
        expect(r.content.some((c: any) => c.type === 'image')).toBe(true)
        expect(JSON.parse(text(r)).error).toBeNull()
    })
})
