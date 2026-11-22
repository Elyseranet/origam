import type { TEnvName, TQueryValue } from '../types/mcp.type.ts'

/*********************************************************
 * Interfaces du serveur MCP origam
 ********************************************************/

export interface IHttpClientOptions {
    /** `fetch` injectable (tests). Defaut : `globalThis.fetch`. */
    fetchImpl?: typeof fetch
    /** Resout le mot de passe admin d'un env (trousseau puis variable d'env). */
    getPassword: (env: TEnvName) => Promise<string>
    /** Lit une variable d'environnement (injectable). Defaut : `process.env`. */
    readEnv?: (name: string) => string | undefined
    timeoutMs?: number
}

export interface IRequestOptions {
    query?: Record<string, TQueryValue>
    body?: unknown
    /** Route /api/admin/** : cookie de session + garde prod-write. */
    admin?: boolean
}

export interface IPlaygroundRenderInput {
    component: string
    props?: Record<string, unknown>
    slot?: string
    viewport?: { width: number, height: number }
    theme?: string
    mode?: 'light' | 'dark'
    styleProps?: readonly string[]
}

export interface IPlaygroundSnapshot {
    png: Buffer
    styles: Record<string, string>
    classes: string[]
    outerHTML: string
    console: string[]
    error: string | null
}

export interface IPlaygroundDiff {
    identical: boolean
    pixelDiffPercent: number
    styleDiffs: Array<{ prop: string, a: string, b: string }>
    classesOnlyA: string[]
    classesOnlyB: string[]
    domChanged: boolean
}
