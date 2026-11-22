import { COMPONENT_PARAM, ERROR_DATASET_KEY, PLAYGROUND_INSTANCE_ATTRIBUTE, PROPS_PARAM, READY_DATASET_KEY, SLOT_PARAM } from '@origam/playground/consts'
import { encodeSceneParam, encodeTextParam } from '@origam/playground/scene-param'
import { chromium, type Browser, type Page } from '@playwright/test'
import {
    DEFAULT_PLAYGROUND_URL, DEFAULT_STYLE_PROPS, DEFAULT_VIEWPORT, ENV_VAR_PLAYGROUND_URL, ENV_VAR_STYLE_PROPS,
    PLAYGROUND_READY_TIMEOUT_MS
} from '../consts/mcp.const.ts'
import type { IPlaygroundDiff, IPlaygroundRenderInput, IPlaygroundSnapshot } from '../interfaces/mcp.interface.ts'

/*********************************************************
 * Rendu / comparaison de composants via le playground (contrat partie A de
 * #1441 : `?component=&props=` / `?scene=`, `data-playground-ready`,
 * `data-playground-instance`, `data-playground-error`).
 * Une seule instance Chromium headless, reutilisee, fermee a l'arret.
 ********************************************************/

export function playgroundBaseUrl (): string {
    return (process.env[ENV_VAR_PLAYGROUND_URL] ?? DEFAULT_PLAYGROUND_URL).replace(/\/+$/, '')
}

export function styleProps (input?: readonly string[]): readonly string[] {
    if (input?.length) return input
    const fromEnv = process.env[ENV_VAR_STYLE_PROPS]
    return fromEnv ? fromEnv.split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_STYLE_PROPS
}

/** URL d'une instance : `?component=&props=[&slot=]` (contrat partie A de #1441). */
export function buildSceneUrl (input: Pick<IPlaygroundRenderInput, 'component' | 'props' | 'slot'>): string {
    const url = new URL(`${playgroundBaseUrl()}/`)
    url.searchParams.set(COMPONENT_PARAM, input.component)
    url.searchParams.set(PROPS_PARAM, encodeSceneParam(input.props ?? {}))
    if (input.slot !== undefined) url.searchParams.set(SLOT_PARAM, encodeTextParam(input.slot))
    return url.toString()
}

export class PlaygroundBrowser {
    private browser: Browser | null = null

    private async getBrowser (): Promise<Browser> {
        if (!this.browser) {
            this.browser = await chromium.launch({ headless: true })
            this.browser.on('disconnected', () => { this.browser = null })
        }
        return this.browser
    }

    /** Contexte avec le shim `__name` : tsx (esbuild keepNames) l'injecte dans les fonctions passees a `evaluate`. */
    private async newContext (options?: Parameters<Browser['newContext']>[0]) {
        const context = await (await this.getBrowser()).newContext(options)
        await context.addInitScript('window.__name = window.__name || ((f) => f)')
        return context
    }

    async close (): Promise<void> {
        const b = this.browser
        this.browser = null
        if (b) await b.close().catch(() => undefined)
    }

    async render (input: IPlaygroundRenderInput): Promise<IPlaygroundSnapshot> {
        const context = await this.newContext({ viewport: input.viewport ?? DEFAULT_VIEWPORT })
        try {
            if (input.theme || input.mode) {
                await context.addInitScript(({ theme, mode }) => {
                    const apply = () => {
                        if (theme) document.documentElement.dataset.theme = theme
                        if (mode) document.documentElement.dataset.mode = mode
                    }
                    apply()
                    document.addEventListener('DOMContentLoaded', apply)
                }, { theme: input.theme, mode: input.mode })
            }
            const page = await context.newPage()
            const logs: string[] = []
            page.on('console', (m) => {
                if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`)
            })
            page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))
            await page.goto(buildSceneUrl(input), { waitUntil: 'domcontentloaded' })
            return await this.snapshot(page, logs, styleProps(input.styleProps))
        } finally {
            await context.close().catch(() => undefined)
        }
    }

    private async snapshot (page: Page, logs: string[], props: readonly string[]): Promise<IPlaygroundSnapshot> {
        try {
            await page.waitForFunction(
                ([ready, err]) => document.documentElement.dataset[ready!] === 'true' || !!document.documentElement.dataset[err!],
                [READY_DATASET_KEY, ERROR_DATASET_KEY],
                { timeout: PLAYGROUND_READY_TIMEOUT_MS }
            )
        } catch {
            return { png: await page.screenshot(), styles: {}, classes: [], outerHTML: '', console: logs, error: `timeout : data-playground-ready absent apres ${PLAYGROUND_READY_TIMEOUT_MS} ms (l'hote du playground tourne-t-il sur ${playgroundBaseUrl()} ?)` }
        }
        const error = await page.evaluate(k => document.documentElement.dataset[k] ?? null, ERROR_DATASET_KEY)
        const instance = page.locator(`[${PLAYGROUND_INSTANCE_ATTRIBUTE}]`).first()
        if (error || (await instance.count()) === 0) {
            return { png: await page.screenshot(), styles: {}, classes: [], outerHTML: '', console: logs, error: error ? `data-playground-error=${error}` : 'instance root not found (composant a racine fragment/teleport ? aucun [data-playground-instance])' }
        }
        const info = await instance.evaluate((el, names) => {
            const cs = getComputedStyle(el)
            const styles: Record<string, string> = {}
            for (const n of names) styles[n] = cs.getPropertyValue(n)
            return { styles, classes: [...el.classList], outerHTML: el.outerHTML }
        }, [...props])
        return { png: await instance.screenshot(), ...info, console: logs, error: null }
    }

    async diff (a: IPlaygroundRenderInput, b: IPlaygroundRenderInput): Promise<{ a: IPlaygroundSnapshot, b: IPlaygroundSnapshot, diff: IPlaygroundDiff }> {
        const sa = await this.render(a)
        const sb = await this.render(b)
        const pixelDiffPercent = sa.error || sb.error ? 100 : await this.pixelDiff(sa.png, sb.png)
        const props = Object.keys({ ...sa.styles, ...sb.styles })
        const styleDiffs = props.filter(p => sa.styles[p] !== sb.styles[p]).map(p => ({ prop: p, a: sa.styles[p] ?? '', b: sb.styles[p] ?? '' }))
        const strip = (h: string) => h.replace(/ data-playground-instance="[^"]*"/g, '').replace(/ data-v-[0-9a-f]+(="")?/g, '')
        const domChanged = strip(sa.outerHTML) !== strip(sb.outerHTML)
        const classesOnlyA = sa.classes.filter(c => !sb.classes.includes(c))
        const classesOnlyB = sb.classes.filter(c => !sa.classes.includes(c))
        const identical = pixelDiffPercent === 0 && !styleDiffs.length && !classesOnlyA.length && !classesOnlyB.length && !domChanged && !sa.error && !sb.error
        return { a: sa, b: sb, diff: { identical, pixelDiffPercent, styleDiffs, classesOnlyA, classesOnlyB, domChanged } }
    }

    /** Pourcentage de pixels differents (taille differente = dimensions max comparees). */
    async pixelDiff (pngA: Buffer, pngB: Buffer): Promise<number> {
        const context = await this.newContext()
        try {
            const page = await context.newPage()
            await page.goto('about:blank')
            return await page.evaluate(async ([x, y]) => {
                const load = async (b64: string) => {
                    const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob()
                    return createImageBitmap(blob)
                }
                const [ia, ib] = await Promise.all([load(x!), load(y!)])
                const w = Math.max(ia.width, ib.width)
                const h = Math.max(ia.height, ib.height)
                const px = (img: ImageBitmap) => {
                    const c = new OffscreenCanvas(w, h)
                    const g = c.getContext('2d')!
                    g.drawImage(img, 0, 0)
                    return g.getImageData(0, 0, w, h).data
                }
                const da = px(ia)
                const db = px(ib)
                let diff = 0
                for (let i = 0; i < da.length; i += 4) {
                    if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2] || da[i + 3] !== db[i + 3]) diff++
                }
                return (diff / (w * h)) * 100
            }, [pngA.toString('base64'), pngB.toString('base64')])
        } finally {
            await context.close().catch(() => undefined)
        }
    }
}
