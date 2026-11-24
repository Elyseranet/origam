import {
    DEFAULT_ENV, DEFAULT_LOCAL_URL, ENV_URLS, ENV_VAR_ALLOW_PROD_WRITE, ENV_VAR_LOCAL_URL, HTTP_TIMEOUT_MS
} from '../consts/mcp.const.ts'
import type { IHttpClientOptions, IRequestOptions } from '../interfaces/mcp.interface.ts'
import type { TEnvName, THttpMethod } from '../types/mcp.type.ts'

/*********************************************************
 * Client HTTP maison au-dessus de `fetch` natif (axios proscrit).
 * URL de base par env, JSON, timeout `AbortSignal.timeout`, erreur typee sur
 * non-2xx, cookie de session admin conserve en memoire (un par env).
 ********************************************************/

export class McpHttpError extends Error {
    readonly status: number
    readonly url: string

    constructor (message: string, status: number, url: string) {
        super(message)
        this.name = 'McpHttpError'
        this.status = status
        this.url = url
    }
}

export class OrigamApiClient {
    private readonly fetchImpl: typeof fetch
    private readonly readEnv: (name: string) => string | undefined
    private readonly timeoutMs: number
    /** env -> "name=value; name2=value2" */
    private readonly cookies = new Map<TEnvName, string>()
    /** Envs fermes par un logout explicite : pas de reconnexion automatique (en memoire du process). */
    private readonly loggedOut = new Set<TEnvName>()

    private readonly options: IHttpClientOptions

    constructor (options: IHttpClientOptions) {
        this.options = options
        this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis)
        this.readEnv = options.readEnv ?? (name => process.env[name])
        this.timeoutMs = options.timeoutMs ?? HTTP_TIMEOUT_MS
    }

    baseUrl (env: TEnvName = DEFAULT_ENV): string {
        const raw = env === 'local' ? (this.readEnv(ENV_VAR_LOCAL_URL) ?? DEFAULT_LOCAL_URL) : ENV_URLS[env]
        return raw.replace(/\/+$/, '')
    }

    async request<T = unknown> (env: TEnvName, method: THttpMethod, path: string, opts: IRequestOptions = {}): Promise<T> {
        const admin = opts.admin === true
        if (admin && env === 'prod' && method !== 'GET' && this.readEnv(ENV_VAR_ALLOW_PROD_WRITE) !== '1') {
            throw new McpHttpError(
                `Ecriture admin refusee en prod : definis ${ENV_VAR_ALLOW_PROD_WRITE}=1 pour l'autoriser explicitement.`,
                0,
                path
            )
        }
        if (admin && this.loggedOut.has(env)) {
            throw new McpHttpError(`Session fermee par logout sur ${env} : appelle origam_admin_login.`, 0, path)
        }
        if (admin && !this.cookies.has(env)) await this.login(env)
        try {
            return await this.send<T>(env, method, path, opts)
        } catch (err) {
            // Session expiree cote serveur : une seule reconnexion.
            if (admin && err instanceof McpHttpError && err.status === 401) {
                this.cookies.delete(env)
                await this.login(env)
                return this.send<T>(env, method, path, opts)
            }
            throw err
        }
    }

    async login (env: TEnvName): Promise<void> {
        this.loggedOut.delete(env)
        const password = await this.options.getPassword(env)
        try {
            await this.send(env, 'POST', '/api/admin/login', { body: { password } }, true)
        } catch (err) {
            if (err instanceof McpHttpError) {
                throw new McpHttpError(this.redact(`Connexion admin refusee sur ${env} (HTTP ${err.status}).`, password), err.status, err.url)
            }
            throw err
        }
    }

    async logout (env: TEnvName): Promise<void> {
        await this.send(env, 'POST', '/api/admin/logout', {})
        this.cookies.delete(env)
        this.loggedOut.add(env)
    }

    private async send<T> (env: TEnvName, method: THttpMethod, path: string, opts: IRequestOptions, captureCookie = false): Promise<T> {
        const url = new URL(this.baseUrl(env) + path)
        for (const [k, v] of Object.entries(opts.query ?? {})) {
            if (v !== undefined) url.searchParams.set(k, String(v))
        }
        const headers: Record<string, string> = { Accept: 'application/json' }
        if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
        const cookie = this.cookies.get(env)
        if (cookie) headers.Cookie = cookie

        let res: Response
        try {
            res = await this.fetchImpl(url, {
                method,
                headers,
                body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
                signal: AbortSignal.timeout(this.timeoutMs)
            })
        } catch (err) {
            const name = err instanceof Error ? err.name : ''
            const reason = name === 'TimeoutError' || name === 'AbortError'
                ? `timeout apres ${this.timeoutMs} ms`
                : 'injoignable'
            throw new McpHttpError(`${method} ${url.origin}${path} : ${reason}`, 0, url.toString())
        }

        if (captureCookie && res.ok) {
            const pairs = res.headers.getSetCookie().map(c => c.split(';')[0]).filter(Boolean)
            if (pairs.length) this.cookies.set(env, pairs.join('; '))
        }
        if (!res.ok) {
            const detail = await this.errorDetail(res)
            throw new McpHttpError(`${method} ${path} -> HTTP ${res.status}${detail ? ` : ${detail}` : ''}`, res.status, url.toString())
        }
        if (res.status === 204) return undefined as T
        const text = await res.text()
        return (text ? JSON.parse(text) : undefined) as T
    }

    private async errorDetail (res: Response): Promise<string> {
        try {
            const j = await res.json() as { statusMessage?: string, message?: string }
            return (j.statusMessage ?? j.message ?? '').slice(0, 300)
        } catch {
            return ''
        }
    }

    private redact (message: string, secret: string): string {
        return secret ? message.split(secret).join('***') : message
    }
}
