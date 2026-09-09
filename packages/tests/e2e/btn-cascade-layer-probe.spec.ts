import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * #391 / #514 — CASCADE PROBE. Measures, in a real browser, what `@layer`
 * would actually do to this DS, so the decision rests on numbers instead of
 * reasoning.
 *
 * Two facts are in tension and BOTH are load-bearing:
 *
 *  1. A utility (`.origam--border-thick`, specificity (0,1,0)) LOSES to a Vue
 *     scoped rule (`.origam-btn[data-v-hash]`, (0,2,0)) regardless of sheet
 *     order. That is why `border="thick"` painted 1px — #391.
 *  2. `origam-utilities.css`'s own header says utilities are *"intended to be
 *     loaded BEFORE component-scoped SCSS so that `.origam-btn--variant-flat`
 *     can override `.origam--bg-primary`"*. So component rules are SUPPOSED
 *     to win some fights.
 *
 * `@layer` would settle (1) by putting component styles in an earlier layer —
 * a later/unlayered origin beats any specificity. This spec measures the
 * price of that: it layers the component sheets at runtime and reports every
 * declaration that flips.
 *
 * The probe builds its OWN elements carrying the competing classes rather
 * than mutating a Vue-rendered one — Vue re-patches a live element's class
 * list between an `evaluate` and a later assertion (the `alert.spec.ts`
 * trap), so mutation and measurement stay inside a single `evaluate`.
 */

const STORY_ID = 'components-stories-btn-origambtn-story-vue'
const STORY_PATH = `/stories/story/${STORY_ID}`
// 13 → Prop — border (VRT matrix)
const BORDER_MATRIX_URL = `${STORY_PATH}?variantId=${STORY_ID}-13`

type TProbeRow = { label: string, before: string, after: string, flipped: boolean }

test.describe('#391 — @layer cascade probe', () => {
    test('measures what layering component styles would win and break', async ({ page }) => {
        await page.goto(BORDER_MATRIX_URL, { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('[data-cy="btn-border-matrix"]')).toBeVisible()

        const result = await sandbox.locator('[data-cy="btn-border-matrix"]').evaluate((anchor) => {
            const doc = anchor.ownerDocument
            const win = doc.defaultView!

            // The scoped-style hash Vite emitted for OrigamBtn, read off a
            // real rendered button so the probe reproduces the exact selector.
            const realBtn = doc.querySelector('.origam-btn')!
            const dataV = Array.from(realBtn.attributes)
                .map((a) => a.name)
                .find((n) => n.startsWith('data-v-')) ?? ''

            const host = doc.createElement('div')
            host.style.position = 'absolute'
            host.style.left = '-9999px'
            doc.body.appendChild(host)

            const make = (classes: string) => {
                const el = doc.createElement('button')
                el.className = classes
                if (dataV) el.setAttribute(dataV, '')
                host.appendChild(el)

                return el
            }

            // The two sides of the tension, plus the foreground channel #514
            // showed is a different token entirely.
            const probes: Array<{ label: string, el: Element, prop: string }> = [
                { label: 'WIN?  border=thick: utility width vs scoped base', el: make('origam-btn origam--border-thick'), prop: 'border-top-width' },
                { label: 'WIN?  border=none: utility width vs scoped base', el: make('origam-btn origam-btn--border origam--border-none'), prop: 'border-top-width' },
                { label: 'BREAK? variant=flat bg vs .origam--bg-primary', el: make('origam-btn origam-btn--variant-flat origam--bg-primary'), prop: 'background-color' },
                { label: 'BREAK? variant=text bg vs .origam--bg-primary', el: make('origam-btn origam-btn--variant-text origam--bg-primary'), prop: 'background-color' },
                { label: 'BREAK? variant=outlined bg vs .origam--bg-primary', el: make('origam-btn origam-btn--variant-outlined origam--bg-primary'), prop: 'background-color' },
                { label: 'BREAK? variant=flat fg vs .origam--color-primary', el: make('origam-btn origam-btn--variant-flat origam--color-primary'), prop: 'color' },
                { label: 'BREAK? rounded: scoped radius vs .origam--rounded-full', el: make('origam-btn origam-btn--rounded origam--rounded-full'), prop: 'border-radius' },
                { label: 'BREAK? elevation: scoped shadow vs .origam--shadow-md', el: make('origam-btn origam--shadow-md'), prop: 'box-shadow' }
            ]

            const snap = () => probes.map((p) => win.getComputedStyle(p.el).getPropertyValue(p.prop).trim())

            const before = snap()

            // ---- apply the @layer route -------------------------------
            // Every Vue-SCOPED rule (selector carrying `data-v-`) moves into
            // a named layer; everything else — utilities, token sheets —
            // stays unlayered. An unlayered rule beats any layered one at
            // ANY specificity, so this is exactly the cascade `@layer` would
            // give us. In a production build the CSS lives in <link> files,
            // not inline <style>, so walk `document.styleSheets`.
            const scopedChunks: Array<string> = []
            const plainChunks: Array<string> = []
            let scopedRules = 0

            const split = (rules: CSSRuleList, scoped: Array<string>, plain: Array<string>) => {
                for (const rule of Array.from(rules)) {
                    if (rule instanceof win.CSSStyleRule) {
                        if (rule.selectorText.includes('data-v-')) {
                            scoped.push(rule.cssText)
                            scopedRules++
                        } else {
                            plain.push(rule.cssText)
                        }
                    } else if (rule instanceof win.CSSMediaRule || rule instanceof win.CSSSupportsRule) {
                        const s: Array<string> = []
                        const p: Array<string> = []
                        split(rule.cssRules, s, p)
                        const cond = rule instanceof win.CSSMediaRule ? `@media ${rule.conditionText}` : `@supports ${rule.conditionText}`
                        if (s.length) scoped.push(`${cond} { ${s.join('\n')} }`)
                        if (p.length) plain.push(`${cond} { ${p.join('\n')} }`)
                    } else {
                        plain.push(rule.cssText)
                    }
                }
            }

            const sheets = Array.from(doc.styleSheets)
            let readable = 0

            for (const sheet of sheets) {
                let rules: CSSRuleList
                try {
                    rules = sheet.cssRules
                } catch {
                    continue
                }
                readable++
                split(rules, scopedChunks, plainChunks)
                if (sheet.ownerNode instanceof win.HTMLLinkElement || sheet.ownerNode instanceof win.HTMLStyleElement) {
                    sheet.disabled = true
                }
            }

            const layeredEl = doc.createElement('style')
            layeredEl.textContent = `@layer origam.components {\n${scopedChunks.join('\n')}\n}`
            doc.head.appendChild(layeredEl)

            const plainEl = doc.createElement('style')
            plainEl.textContent = plainChunks.join('\n')
            doc.head.appendChild(plainEl)

            const after = snap()

            const rows = probes.map((p, i) => ({
                label: p.label,
                before: before[i],
                after: after[i],
                flipped: before[i] !== after[i]
            }))

            host.remove()

            return { dataV, layeredSheets: scopedRules, totalSheets: readable, rows }
        })

         
        console.log('\n=== @layer cascade probe ===')
         
        console.log(`scoped hash: ${result.dataV} | scoped rules layered: ${result.layeredSheets} from ${result.totalSheets} readable sheets\n`)
        for (const r of result.rows as Array<TProbeRow>) {
             
            console.log(`${r.flipped ? 'FLIPPED' : '  same '} | ${r.label}\n          before=${r.before}\n          after =${r.after}`)
        }

        // The probe must have actually done something, otherwise every
        // "same" below is meaningless.
        expect(result.layeredSheets, 'probe must have layered at least one scoped rule').toBeGreaterThan(0)
    })
})

/**
 * CATALOGUE SWEEP — the same layering, applied across every component story,
 * to size the blast radius instead of guessing it. Opt-in (it loads ~200
 * pages, minutes not seconds):
 *
 *   LAYER_PROBE_SWEEP=1 E2E_STATIC=1 E2E_HISTOIRE_PORT=6018 \
 *     pnpm exec playwright test btn-cascade-layer-probe --project=chromium
 *
 * For each story's first variant it snapshots the themed channels on every
 * rendered element that carries a `.origam--*` utility class — the only
 * elements where the utility-vs-scoped fight can even happen — layers the
 * scoped rules, and re-snapshots. A flip is a pixel that would visibly move
 * if the DS adopted `@layer`.
 */
test.describe('#391 — @layer blast radius across the catalogue', () => {
    test.skip(!process.env.LAYER_PROBE_SWEEP, 'opt-in: set LAYER_PROBE_SWEEP=1')
    test.setTimeout(30 * 60 * 1000)

    test('counts every declaration that would flip under @layer', async ({ page }) => {
        const CHANNELS = ['color', 'background-color', 'border-top-width', 'border-radius', 'box-shadow']

        const catalogueFile = resolve(dirname(fileURLToPath(import.meta.url)), '../../marketing/public/stories/histoire.json')
        const catalogue = JSON.parse(readFileSync(catalogueFile, 'utf8')) as { stories: Array<{ id: string, title: string }> }
        const stories = catalogue.stories.filter((s) => s.id.startsWith('components-'))

        const perChannel: Record<string, number> = Object.fromEntries(CHANNELS.map((c) => [c, 0]))
        const hitComponents = new Set<string>()
        let scanned = 0
        let elementsWithUtility = 0

        for (const story of stories) {
            await page.goto(`/stories/story/${story.id}?variantId=${story.id}-0`, { waitUntil: 'domcontentloaded' })

            const body = page.frameLocator('iframe[src*="__sandbox"]').locator('body')

            let res
            try {
                await body.waitFor({ state: 'attached', timeout: 8000 })
                res = await body.evaluate((bodyEl, { channels }) => {
                    const doc = bodyEl.ownerDocument
                    const win = doc.defaultView!

                    const targets = Array.from(doc.querySelectorAll('[class*="origam--"]'))
                    if (!targets.length) return { utility: 0, flips: {} as Record<string, number> }

                    const snap = () => targets.map((el) => channels.map((c) => win.getComputedStyle(el).getPropertyValue(c).trim()))
                    const before = snap()

                    const scoped: Array<string> = []
                    const plain: Array<string> = []

                    const split = (rules: CSSRuleList, s: Array<string>, p: Array<string>) => {
                        for (const rule of Array.from(rules)) {
                            if (rule instanceof win.CSSStyleRule) {
                                (rule.selectorText.includes('data-v-') ? s : p).push(rule.cssText)
                            } else if (rule instanceof win.CSSMediaRule || rule instanceof win.CSSSupportsRule) {
                                const ss: Array<string> = []
                                const pp: Array<string> = []
                                split(rule.cssRules, ss, pp)
                                const cond = rule instanceof win.CSSMediaRule ? `@media ${rule.conditionText}` : `@supports ${rule.conditionText}`
                                if (ss.length) s.push(`${cond} { ${ss.join('\n')} }`)
                                if (pp.length) p.push(`${cond} { ${pp.join('\n')} }`)
                            } else {
                                p.push(rule.cssText)
                            }
                        }
                    }

                    for (const sheet of Array.from(doc.styleSheets)) {
                        try {
                            split(sheet.cssRules, scoped, plain)
                        } catch {
                            continue
                        }
                        if (sheet.ownerNode instanceof win.HTMLLinkElement || sheet.ownerNode instanceof win.HTMLStyleElement) sheet.disabled = true
                    }

                    const a = doc.createElement('style')
                    a.textContent = `@layer origam.components {\n${scoped.join('\n')}\n}`
                    doc.head.appendChild(a)
                    const b = doc.createElement('style')
                    b.textContent = plain.join('\n')
                    doc.head.appendChild(b)

                    const after = snap()
                    const flips: Record<string, number> = {}
                    before.forEach((row, i) => row.forEach((v, j) => {
                        if (v !== after[i][j]) flips[channels[j]] = (flips[channels[j]] ?? 0) + 1
                    }))

                    return { utility: targets.length, flips }
                }, { channels: CHANNELS })
            } catch {
                continue
            }

            scanned++
            elementsWithUtility += res.utility
            for (const [ch, n] of Object.entries(res.flips)) {
                perChannel[ch] += n
                hitComponents.add(story.title)
            }
        }

         
        console.log('\n=== @layer blast radius (variant 0 of every component story) ===')
         
        console.log(`stories scanned: ${scanned}/${stories.length} | elements carrying a utility class: ${elementsWithUtility}`)
         
        console.log(`components with >=1 flipped declaration: ${hitComponents.size}`)
        for (const [ch, n] of Object.entries(perChannel)) {
             
            console.log(`  ${ch.padEnd(18)} ${n} flipped declaration(s)`)
        }
         
        console.log(`\ncomponents affected: ${Array.from(hitComponents).sort().join(', ')}`)

        expect(scanned, 'sweep must have scanned stories').toBeGreaterThan(0)
    })
})
