/**
 * reference-cache.spec.ts — clé de cache des handlers `server/api/reference/**`
 * et invalidation admin de la fiche détail (#1063).
 *
 * Les tests passent par les VRAIS handlers (globaux Nitro substitués, utilitaires `src/utils` explicitement importés et mockés), pas par
 * les utilitaires seuls : ils valent donc aussi contre le code d'avant le
 * correctif, où ils échouent — c'est ce qui prouve qu'ils mesurent quelque
 * chose.
 *
 * Le format de la clé stockée est celui que Nitro écrit réellement (mesuré en
 * dev : `.nuxt/cache/nitro/handlers/reference-doc/doccomponentalerten.json`),
 * reproduit ici par `storedKey` : `cache:nitro:handlers:<name>:<clé échappée>.json`
 * où l'échappement retire tout caractère non-mot
 * (`nitropack/dist/runtime/internal/cache.mjs`, `escapeKey`).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../marketing/server/db/entities', () => ({
    DocEntry: class DocEntry {},
    DocProp: class DocProp {},
    DocRelation: class DocRelation {},
    DocValue: class DocValue {},
    DocEmit: class DocEmit {},
    DocSlot: class DocSlot {},
    DocExample: class DocExample {},
    DocParam: class DocParam {},
    DocReturn: class DocReturn {},
    DocDirectiveArg: class DocDirectiveArg {},
    DocDirectiveModifier: class DocDirectiveModifier {}
}))

const dbState = vi.hoisted(() => ({ useDb: async (): Promise<unknown> => ({}) }))

vi.mock('../../../marketing/src/utils/db.util', () => ({
    useDb: () => dbState.useDb(),
    isDbConfigured: () => true,
    pingDb: async () => true
}))

vi.mock('../../../marketing/src/utils/reference-validation.util', () => ({
    assertKind: () => undefined,
    assertSlug: () => undefined
}))

interface ICaptured {
    handler: (event: any) => Promise<unknown>
    opts: { name: string; maxAge: number; getKey: (event: any) => string }
}

const ev = (params: Record<string, string> = {}, query: Record<string, unknown> = {}) => ({ params, query })

/** La clé telle que Nitro l'écrit dans le stockage. */
const storedKey = (name: string, key: string) =>
    `cache:nitro:handlers:${name}:${String(key).replace(/\W/g, '')}.json`

/** Stockage unstorage minimal en mémoire — `getKeys(base)` renvoie les clés complètes sous `base`. */
function memoryStorage (seed: string[]) {
    const keys = new Set(seed)
    return {
        keys,
        getKeys: async (base = '') => [...keys].filter(k => k.startsWith(base)),
        removeItem: async (k: string) => { keys.delete(k) }
    }
}

function stubNitroGlobals (storage: ReturnType<typeof memoryStorage>, captured: ICaptured[]) {
    vi.stubGlobal('defineCachedEventHandler', (handler: any, opts: any) => {
        captured.push({ handler, opts })
        return handler
    })
    vi.stubGlobal('defineEventHandler', (h: any) => h)
    vi.stubGlobal('getRouterParam', (e: any, n: string) => e.params[n])
    vi.stubGlobal('getQuery', (e: any) => e.query)
    vi.stubGlobal('useStorage', () => storage)
}

async function loadGetKey (load: () => Promise<unknown>): Promise<ICaptured> {
    const captured: ICaptured[] = []
    stubNitroGlobals(memoryStorage([]), captured)
    vi.resetModules()
    await load()
    return captured[0]
}

// Chemins littéraux : Vite ne résout pas un import dynamique dont le chemin est une variable.
const HANDLERS = {
    catalog: () => import('../../../marketing/server/api/reference/[kind].get'),
    doc: () => import('../../../marketing/server/api/reference/[kind]/[slug].get'),
    categories: () => import('../../../marketing/server/api/reference/categories/[kind].get'),
    neighbours: () => import('../../../marketing/server/api/reference/neighbours/[kind]/[slug].get')
} as const
const PATCH = () => import('../../../marketing/server/api/admin/reference/[kind]/[slug].patch')

const EVENTS = {
    catalog: ev({ kind: 'component' }, { locale: 'fr' }),
    doc: ev({ kind: 'component', slug: 'alert' }, { locale: 'fr' }),
    categories: ev({ kind: 'component' }),
    neighbours: ev({ kind: 'component', slug: 'alert' })
} as const

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('clé de cache — version de format (#1063)', () => {
    for (const name of Object.keys(HANDLERS) as (keyof typeof HANDLERS)[]) {
        it(`reference-${name} : la clé porte la version de format`, async () => {
            const { opts } = await loadGetKey(HANDLERS[name])
            const { REFERENCE_CACHE_FORMAT_VERSION } = await import('../../../marketing/src/consts/cache.const')

            expect(opts.getKey(EVENTS[name]).startsWith(`${REFERENCE_CACHE_FORMAT_VERSION}:`)).toBe(true)
        })
    }

    it('incrémenter la version change la clé des 4 handlers (ancienne entrée plus lue)', async () => {
        const before: Record<string, string> = {}
        for (const name of Object.keys(HANDLERS) as (keyof typeof HANDLERS)[]) {
            before[name] = (await loadGetKey(HANDLERS[name])).opts.getKey(EVENTS[name])
        }

        vi.resetModules()
        vi.doMock('../../../marketing/src/consts/cache.const', async (orig) => ({
            ...(await orig<object>()),
            REFERENCE_CACHE_FORMAT_VERSION: 'v999'
        }))
        for (const name of Object.keys(HANDLERS) as (keyof typeof HANDLERS)[]) {
            const after = (await loadGetKey(HANDLERS[name])).opts.getKey(EVENTS[name])
            expect(after, name).not.toBe(before[name])
            expect(after, name).toContain('v999')
        }
        vi.doUnmock('../../../marketing/src/consts/cache.const')
    })

    it('les 4 handlers lisent le même TTL, issu de la constante partagée', async () => {
        const { REFERENCE_CACHE_TTL_SECONDS } = await import('../../../marketing/src/consts/cache.const')
        for (const name of Object.keys(HANDLERS) as (keyof typeof HANDLERS)[]) {
            expect((await loadGetKey(HANDLERS[name])).opts.maxAge, name).toBe(REFERENCE_CACHE_TTL_SECONDS)
        }
    })

    it('la clé de reference-doc distingue limit et locale (comportement conservé)', async () => {
        const { opts } = await loadGetKey(HANDLERS.doc)
        const k = (q: Record<string, unknown>) => opts.getKey(ev({ kind: 'component', slug: 'alert' }, q))

        expect(k({})).not.toBe(k({ locale: 'fr' }))
        expect(k({})).not.toBe(k({ limit: '5' }))
        expect(k({ locale: 'xx' })).toBe(k({}))
    })
})

describe('invalidation admin — PATCH /api/admin/reference/:kind/:slug (#1063)', () => {
    /** Charge le handler PATCH avec une base factice, le stockage fourni, et renvoie le handler public pour fabriquer les clés. */
    async function setup (seedFrom: { slug: string; query: Record<string, unknown> }[]) {
        const captured: ICaptured[] = []
        const storage = memoryStorage([])
        stubNitroGlobals(storage, captured)
        vi.stubGlobal('readBody', async () => ({ descriptionFallback: 'EDITED' }))
        vi.stubGlobal('createError', (o: any) => Object.assign(new Error(o.statusMessage), o))
        const entry = { id: 'e1', editorial_locked_at: null }
        dbState.useDb = async () => ({
            getRepository: () => ({
                createQueryBuilder: () => ({ where: () => ({ getOne: async () => entry }) }),
                update: async () => undefined,
                findOneBy: async () => ({ ...entry })
            })
        })
        vi.resetModules()
        await HANDLERS.doc()
        const doc = captured[0]
        for (const s of seedFrom) {
            storage.keys.add(storedKey(doc.opts.name, doc.opts.getKey(ev({ kind: 'component', slug: s.slug }, s.query))))
        }
        const patch = (await PATCH()).default as (e: any) => Promise<unknown>
        return { storage, patch }
    }

    it('supprime toutes les variantes (locales × limit) de la fiche et laisse les autres', async () => {
        const { storage, patch } = await setup([
            { slug: 'alert', query: {} },
            { slug: 'alert', query: { locale: 'fr' } },
            { slug: 'alert', query: { limit: '5', locale: 'fr' } },
            { slug: 'btn', query: {} }
        ])
        expect(storage.keys.size).toBe(4)

        await patch(ev({ kind: 'component', slug: 'alert' }))

        const left = [...storage.keys]
        expect(left).toHaveLength(1)
        expect(left[0]).toContain('btn')
    })

    it('la réponse PATCH reste un succès quand le stockage échoue, et l’erreur est journalisée', async () => {
        const { storage, patch } = await setup([{ slug: 'alert', query: {} }])
        storage.getKeys = async () => { throw new Error('disk gone') }
        const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)

        await expect(patch(ev({ kind: 'component', slug: 'alert' }))).resolves.toBeTruthy()

        expect(log).toHaveBeenCalled()
        log.mockRestore()
    })
})

describe('invalidateReferenceDoc — la clé réelle mesurée', () => {
    beforeEach(() => vi.resetModules())

    it('retrouve une entrée au format stocké par Nitro et ne touche pas un autre dossier', async () => {
        const { invalidateReferenceDoc } = await import('../../../marketing/src/utils/reference-cache.util')
        const { REFERENCE_CACHE_FORMAT_VERSION } = await import('../../../marketing/src/consts/cache.const')
        // Forme mesurée en dev : .nuxt/cache/nitro/handlers/reference-doc/doccomponentalerten.json
        const mine = storedKey('reference-doc', `${REFERENCE_CACHE_FORMAT_VERSION}:doc:component:alert::en`)
        const otherFolder = storedKey('reference-catalog', `${REFERENCE_CACHE_FORMAT_VERSION}:doc:component:alert::en`)
        const storage = memoryStorage([mine, otherFolder])

        expect(await invalidateReferenceDoc(storage, 'component', 'alert')).toBe(1)
        expect([...storage.keys]).toEqual([otherFolder])
    })
})
