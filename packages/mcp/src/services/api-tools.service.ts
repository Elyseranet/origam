import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { DEFAULT_ENV, ENV_NAMES } from '../consts/mcp.const.ts'
// Source de verite du marketing, importee par chemin relatif (comme packages/marketing/scripts/*.mjs).
import { ALLOWED_COLLECTIONS } from '../../../marketing/src/consts/admin-mappers.const.ts'
import { DOC_KINDS, REL_TYPES } from '../../../marketing/src/consts/db.const.ts'
import type { IRequestOptions } from '../interfaces/mcp.interface.ts'
import type { TEnvName, THttpMethod } from '../types/mcp.type.ts'
import { McpHttpError, type OrigamApiClient } from '../utils/http-client.util.ts'

/*********************************************************
 * Outils MCP -> routes de packages/marketing/src/server/api/**.
 * Les corps/parametres sont ceux lus dans chaque handler. Les reponses sont
 * renvoyees telles quelles (JSON) : les interfaces *Doc du marketing ne sont
 * pas exportees par un paquet importable, on ne les copie donc pas.
 ********************************************************/

const env = z.enum(ENV_NAMES).optional().describe(`Environnement (defaut ${DEFAULT_ENV}).`)
const kind = z.enum(DOC_KINDS)
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug kebab-case')
const uuid = z.string().regex(/^[0-9a-f-]{36}$/i, 'UUID attendu')
const text = z.string().nullable().optional()

const toResult = (data: unknown) => ({ content: [{ type: 'text' as const, text: data === undefined ? 'OK (pas de contenu)' : JSON.stringify(data, null, 2) }] })
const toError = (err: unknown) => ({
    isError: true,
    content: [{ type: 'text' as const, text: err instanceof McpHttpError || err instanceof Error ? err.message : String(err) }]
})

interface IApiToolDef {
    name: string
    description: string
    method: THttpMethod
    admin?: boolean
    shape: z.ZodRawShape
    /** Construit le chemin, la query et le corps a partir des arguments valides. */
    build: (a: any) => { path: string, query?: IRequestOptions['query'], body?: unknown }
}

const base = (k: string, s: string) => `/api/admin/reference/${k}/${s}`

const API_TOOLS: IApiToolDef[] = [
    { name: 'origam_health', description: 'GET /api/health : liveness + etat de la base.', method: 'GET', shape: {}, build: () => ({ path: '/api/health' }) },
    { name: 'origam_npm_version', description: 'GET /api/npm-version : derniere version npm (repli sur la version du build).', method: 'GET', shape: {}, build: () => ({ path: '/api/npm-version' }) },
    { name: 'origam_npm_downloads', description: 'GET /api/npm-downloads : telechargements hebdo (null si indisponible).', method: 'GET', shape: {}, build: () => ({ path: '/api/npm-downloads' }) },
    { name: 'origam_github_stars', description: 'GET /api/github-stars : etoiles du depot (null si indisponible).', method: 'GET', shape: {}, build: () => ({ path: '/api/github-stars' }) },
    {
        name: 'origam_reference_list',
        description: 'GET /api/reference/:kind : catalogue leger d\'une famille. includePropSurface (component seulement) ajoute props[] + playground.',
        method: 'GET',
        shape: {
            kind,
            category: z.string().optional(),
            limit: z.number().int().positive().optional(),
            orphaned: z.boolean().optional().describe('Inclure les entrees orphelines.'),
            includePropSurface: z.boolean().optional(),
            locale: z.string().optional()
        },
        build: a => ({
            path: `/api/reference/${a.kind}`,
            query: { category: a.category, limit: a.limit, orphaned: a.orphaned ? 1 : undefined, includePropSurface: a.includePropSurface ? 1 : undefined, locale: a.locale }
        })
    },
    {
        name: 'origam_reference_get',
        description: 'GET /api/reference/:kind/:slug : fiche complete. limit plafonne les listes de valeurs (const/enum/type).',
        method: 'GET',
        shape: { kind, slug, limit: z.number().int().positive().optional(), locale: z.string().optional() },
        build: a => ({ path: `/api/reference/${a.kind}/${a.slug}`, query: { limit: a.limit, locale: a.locale } })
    },
    {
        name: 'origam_reference_categories',
        description: 'GET /api/reference/categories/:kind : categories (derivees des entrees), triees.',
        method: 'GET',
        shape: { kind, locale: z.string().optional() },
        build: a => ({ path: `/api/reference/categories/${a.kind}`, query: { locale: a.locale } })
    },
    {
        name: 'origam_reference_neighbours',
        description: 'GET /api/reference/neighbours/:kind/:slug : precedent/suivant dans l\'index + entrees reliees.',
        method: 'GET',
        shape: { kind, slug },
        build: a => ({ path: `/api/reference/neighbours/${a.kind}/${a.slug}` })
    },
    {
        name: 'origam_admin_login',
        description: 'POST /api/admin/login avec le mot de passe du trousseau (ORIGAM_ADMIN_PASSWORD_<ENV>). Facultatif : les outils admin se connectent seuls.',
        method: 'POST',
        admin: true,
        shape: {},
        build: () => ({ path: '/api/admin/login' })
    },
    {
        name: 'origam_admin_logout',
        description: 'POST /api/admin/logout : ferme la session admin de l\'env.',
        method: 'POST',
        admin: true,
        shape: {},
        build: () => ({ path: '/api/admin/logout' })
    },
    {
        name: 'origam_admin_patch_entry',
        description: 'PATCH /api/admin/reference/:kind/:slug : champs editoriaux (camelCase, chaines ou null, <= 4096 car.). Les champs source sont refuses (400).',
        method: 'PATCH',
        admin: true,
        shape: {
            kind, slug,
            category: text, icon: text, descriptionKey: text, descriptionFallback: text,
            noteKey: text, noteFallback: text, storyUrl: text, docUrl: text
        },
        build: ({ kind: k, slug: s, ...body }) => ({ path: base(k, s), body })
    },
    {
        name: 'origam_admin_add_example',
        description: 'POST /api/admin/reference/:kind/:slug/examples : ajoute un exemple en fin de liste (201).',
        method: 'POST',
        admin: true,
        shape: { kind, slug, titleKey: text, titleFallback: text, code: z.string().max(65536).nullable().optional(), lang: text },
        build: ({ kind: k, slug: s, ...body }) => ({ path: `${base(k, s)}/examples`, body })
    },
    {
        name: 'origam_admin_patch_example',
        description: 'PATCH /api/admin/reference/:kind/:slug/examples/:id.',
        method: 'PATCH',
        admin: true,
        shape: { kind, slug, id: uuid, titleKey: text, titleFallback: text, code: z.string().max(65536).nullable().optional(), lang: text },
        build: ({ kind: k, slug: s, id, ...body }) => ({ path: `${base(k, s)}/examples/${id}`, body })
    },
    {
        name: 'origam_admin_delete_example',
        description: 'DELETE /api/admin/reference/:kind/:slug/examples/:id (suppression definitive, 204).',
        method: 'DELETE',
        admin: true,
        shape: { kind, slug, id: uuid },
        build: ({ kind: k, slug: s, id }) => ({ path: `${base(k, s)}/examples/${id}` })
    },
    {
        name: 'origam_admin_add_relation',
        description: 'POST /api/admin/reference/:kind/:slug/relations : relType requis (used_by|related|family|extends).',
        method: 'POST',
        admin: true,
        shape: {
            kind, slug, relType: z.enum(REL_TYPES),
            toKind: text, toSlug: text, toName: text, propName: text, descriptionKey: text, descriptionFallback: text,
            position: z.number().int().optional()
        },
        build: ({ kind: k, slug: s, ...body }) => ({ path: `${base(k, s)}/relations`, body })
    },
    {
        name: 'origam_admin_patch_relation',
        description: 'PATCH /api/admin/reference/:kind/:slug/relations/:id : descriptionKey / descriptionFallback seulement.',
        method: 'PATCH',
        admin: true,
        shape: { kind, slug, id: uuid, descriptionKey: text, descriptionFallback: text },
        build: ({ kind: k, slug: s, id, ...body }) => ({ path: `${base(k, s)}/relations/${id}`, body })
    },
    {
        name: 'origam_admin_delete_relation',
        description: 'DELETE /api/admin/reference/:kind/:slug/relations/:id (suppression logique : orphaned_at, 204).',
        method: 'DELETE',
        admin: true,
        shape: { kind, slug, id: uuid },
        build: ({ kind: k, slug: s, id }) => ({ path: `${base(k, s)}/relations/${id}` })
    },
    {
        name: 'origam_admin_patch_item',
        description: 'PATCH /api/admin/reference/:kind/:slug/items/:id?collection= : description d\'un item enfant (prop, value, param, return, emit, slot, directive_arg, directive_modifier).',
        method: 'PATCH',
        admin: true,
        shape: { kind, slug, id: uuid, collection: z.enum(ALLOWED_COLLECTIONS as unknown as [string, ...string[]]), descriptionKey: text, descriptionFallback: text },
        build: ({ kind: k, slug: s, id, collection, ...body }) => ({ path: `${base(k, s)}/items/${id}`, query: { collection }, body })
    },
    {
        name: 'origam_admin_sync',
        description: 'POST /api/admin/reference/sync : re-applique les fixtures embarquees a la base (idempotent).',
        method: 'POST',
        admin: true,
        shape: {},
        build: () => ({ path: '/api/admin/reference/sync' })
    },
    {
        name: 'origam_admin_sync_runs',
        description: 'GET /api/admin/reference/sync/runs : historique des syncs (limit defaut 20, max 100).',
        method: 'GET',
        admin: true,
        shape: { limit: z.number().int().positive().max(100).optional() },
        build: a => ({ path: '/api/admin/reference/sync/runs', query: { limit: a.limit } })
    }
]

export function registerApiTools (server: McpServer, client: OrigamApiClient): void {
    for (const def of API_TOOLS) {
        server.registerTool(
            def.name,
            { description: def.description, inputSchema: { env, ...def.shape } },
            async (args: any) => {
                try {
                    const e: TEnvName = args.env ?? DEFAULT_ENV
                    if (def.name === 'origam_admin_login') {
                        await client.login(e)
                        return toResult({ ok: true, env: e })
                    }
                    if (def.name === 'origam_admin_logout') {
                        await client.logout(e)
                        return toResult({ ok: true, env: e })
                    }
                    const { path, query, body } = def.build(args)
                    return toResult(await client.request(e, def.method, path, { query, body, admin: def.admin }))
                } catch (err) {
                    return toError(err)
                }
            }
        )
    }
}

export { toError, toResult }
