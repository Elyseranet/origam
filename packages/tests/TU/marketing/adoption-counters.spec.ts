/**
 * adoption-counters.spec.ts — #1210 : les routes `github-stars` / `npm-downloads`
 * rendent la valeur réelle, et `null` (jamais un 0 inventé) quand l'API échoue.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function loadHandler (name: 'npm-downloads' | 'github-stars') {
    let captured: any
    vi.stubGlobal('defineCachedEventHandler', (handler: any) => {
        captured = handler
        return handler
    })
    vi.resetModules()
    if (name === 'npm-downloads') await import('../../../marketing/src/server/api/npm-downloads.get')
    else await import('../../../marketing/src/server/api/github-stars.get')
    return captured as () => Promise<Record<string, number | null>>
}

describe('compteurs d\'adoption (server/api)', () => {
    beforeEach(() => { vi.unstubAllGlobals() })
    afterEach(() => { vi.unstubAllGlobals() })

    it('npm-downloads : rend le nombre renvoyé par npm', async () => {
        vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ downloads: 796 }))
        const handler = await loadHandler('npm-downloads')
        expect(await handler()).toEqual({ downloads: 796 })
    })

    it('npm-downloads : null (pas 0) si npm échoue', async () => {
        vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('offline')))
        const handler = await loadHandler('npm-downloads')
        expect(await handler()).toEqual({ downloads: null })
    })

    it('github-stars : rend le nombre renvoyé par GitHub', async () => {
        vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ stargazers_count: 42 }))
        const handler = await loadHandler('github-stars')
        expect(await handler()).toEqual({ stars: 42 })
    })

    it('github-stars : null (pas 0) si GitHub échoue', async () => {
        vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('rate limit')))
        const handler = await loadHandler('github-stars')
        expect(await handler()).toEqual({ stars: null })
    })
})
