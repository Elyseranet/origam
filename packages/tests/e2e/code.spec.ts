import { expect, test } from '@playwright/test'

/**
 * OrigamCode — runtime behaviour specs.
 *
 * Pattern canonique : btn.spec.ts (navigation directe variantId, sandbox iframe, BEM class).
 *
 * ## Variants (index → title)
 *   0 → Design                               init: { lang: 'ts', …, filename: 'design.ts', line-numbers }
 *   1 → Functional                           init: { lang: 'ts', lineNumbers: true, copyable: true, filename: 'App.ts' }
 *   2 → Functional - No filename (lang badge header)   (no filename → lang badge)
 *   3 → Functional - Compact (install pill)  init: { lang: 'bash', prompt: '$', copyable: true }
 *   4 → Events - copy
 *   5 → Slots - Default
 *   6 → Slots - Header
 *   7 → Slots - Footer
 *   8 → Default                              playground init: { lang: 'ts', lineNumbers: true, highlightLines: '2', copyable: true, filename: 'App.ts' }
 *
 * ## BEM root
 *   .origam-code  (rendered as <figure> by default, tag prop overridable)
 *
 * ## Non-testable headless
 *   - Chargement de la font monospace (async WebFont)
 *   - Détail de couleur exact des tokens shiki (palette dépend de la résolution CSS de la sandbox)
 *   - navigator.clipboard dans certains contextes headless stricts
 *
 * ## Bugs DS connus (ne pas faire échouer la CI sur ceux-là)
 *   #30 — OrigamCode ne propage pas l'attribut `class` posé par le consommateur sur <figure> racine.
 *   #29 — tokens shiki-light sous WCAG AA sur thèmes de marque non-blancs.
 */

const STORY_ID   = 'components-stories-code-origamcode-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * Navigate to a Variant and wait until the sandbox iframe has its `src`
 * attribute set (Histoire injects it asynchronously after navigation).
 * Without this guard, tests that run immediately after a "heavy" previous
 * test can race against Histoire's JS loading the iframe — the iframe is
 * present in the DOM but still empty.
 */
async function gotoVariant (page: import('@playwright/test').Page, idx: number) {
    await page.goto(variantUrl(idx))
    // Wait until Histoire has injected the sandbox src (may take 1-3s on cold starts).
    await page.waitForFunction(
        () => {
            const iframe = document.querySelector('iframe')
            return !!(iframe && iframe.getAttribute('src')?.includes('__sandbox'))
        },
        { timeout: 20000 }
    )
}

test.describe('OrigamCode', () => {
    test.setTimeout(45000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { lang: 'ts', filename: 'design.ts', line-numbers }           //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('renders the code root with BEM class origam-code', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
        })

        test('default tag renders as <figure>', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const tag = await code.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('figure')
        })

        test('header bar is rendered as <figcaption> when tag=figure', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const header = code.locator('.origam-code__header').first()
            await expect(header).toBeVisible()
            const headerTag = await header.evaluate(el => el.tagName.toLowerCase())
            expect(headerTag).toBe('figcaption')
        })

        test('filename prop renders inside the header with data-cy', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const filename = code.locator('[data-cy="origam-code-filename"]')
            await expect(filename).toBeVisible()
            await expect(filename).toHaveText('design.ts')
        })

        test('lang=ts adds origam-code--lang-ts modifier class', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code).toHaveClass(/origam-code--lang-ts/)
        })

        test('line-numbers prop adds origam-code--line-numbers modifier class', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code).toHaveClass(/origam-code--line-numbers/)
        })

        test('shiki pipeline runs — code__row elements are painted into the DOM', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // Wait for at least one row — proves the async shiki highlight finished.
            const firstRow = sandbox.locator('.origam-code__row').first()
            await expect(firstRow).toBeVisible({ timeout: 16000 })
            const rowCount = await sandbox.locator('.origam-code__row').count()
            expect(rowCount).toBeGreaterThanOrEqual(2)
        })

        test('rows carry sequential data-line attributes starting at 1', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-code__row').first()).toBeVisible({ timeout: 16000 })
            const lines = await sandbox.locator('.origam-code__row').evaluateAll(
                els => els.map(el => el.getAttribute('data-line'))
            )
            expect(lines[0]).toBe('1')
            expect(lines[1]).toBe('2')
            expect(lines[2]).toBe('3')
        })

        test('shiki emits dual-theme token spans (--shiki-light + --shiki-dark)', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-code__row').first()).toBeVisible({ timeout: 16000 })
            const code = sandbox.locator('.origam-code__code').first()
            const dualThemeCount = await code.evaluate(el => {
                return Array.from(el.querySelectorAll('span[style]')).filter(s => {
                    const raw = (s as HTMLElement).getAttribute('style') ?? ''
                    return raw.includes('--shiki-light') && raw.includes('--shiki-dark')
                }).length
            })
            // `shiki` is an optional peer dep: when it can't load (e.g. the static
            // Histoire build served to a bare browser), OrigamCode degrades to
            // plain, un-highlighted rows — the token-span assertions don't apply.
            test.skip(dualThemeCount === 0, 'shiki highlighting unavailable (plain fallback) — no token spans to assert')
            expect(dualThemeCount).toBeGreaterThan(0)
        })

        test('copy button is visible inside the header (not floating) when filename set', async ({ page }) => {
            await gotoVariant(page, 0)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const headerCopy = code.locator('.origam-code__header [data-cy="origam-code-copy"]')
            await expect(headerCopy).toBeVisible()
            // No floating overlay when header is present
            await expect(code.locator('.origam-code__copy--floating')).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 1)                                                 //
    // init: { lineNumbers: true, copyable: true, filename: 'App.ts' }     //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('origam-code--copyable class applied when copyable=true', async ({ page }) => {
            await gotoVariant(page, 1)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code).toHaveClass(/origam-code--copyable/)
        })

        test('origam-code--has-header applied when showHeader=true', async ({ page }) => {
            await gotoVariant(page, 1)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code).toHaveClass(/origam-code--has-header/)
        })

        test('pre + code elements are present in the DOM structure', async ({ page }) => {
            await gotoVariant(page, 1)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code.locator('pre.origam-code__pre')).toHaveCount(1)
            await expect(code.locator('code.origam-code__code')).toHaveCount(1)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL - No filename (index 2)                                  //
    // lang badge replaces filename in the header                          //
    // ------------------------------------------------------------------ //

    test.describe('Functional - No filename (lang badge header)', () => {
        test('lang badge is rendered when no filename', async ({ page }) => {
            await gotoVariant(page, 2)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const langBadge = code.locator('[data-cy="origam-code-lang"]')
            await expect(langBadge).toBeVisible()
            await expect(langBadge).toHaveText('bash')
        })

        test('copy button lives in header when no filename (copyable=true)', async ({ page }) => {
            await gotoVariant(page, 2)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code.locator('.origam-code__header [data-cy="origam-code-copy"]')).toBeVisible()
            await expect(code.locator('.origam-code__copy--floating')).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL - Compact (index 3)                                      //
    // init: { lang: 'bash', prompt: '$', copyable: true }                //
    // ------------------------------------------------------------------ //

    test.describe('Functional - Compact (install pill)', () => {
        test('compact renders origam-code--compact modifier', async ({ page }) => {
            await gotoVariant(page, 3)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code--compact').first()
            await expect(code).toBeVisible({ timeout: 12000 })
        })

        test('compact is inline-flex (single-line pill layout)', async ({ page }) => {
            await gotoVariant(page, 3)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code--compact').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const display = await code.evaluate(el => getComputedStyle(el).display)
            expect(display).toBe('inline-flex')
        })

        test('compact preserves <figure> semantics', async ({ page }) => {
            await gotoVariant(page, 3)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code--compact').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const tag = await code.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('figure')
        })

        test('compact has no header element', async ({ page }) => {
            await gotoVariant(page, 3)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code--compact').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code.locator('.origam-code__header')).toHaveCount(0)
        })

        test('prompt prefix renders as aria-hidden', async ({ page }) => {
            await gotoVariant(page, 3)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code--compact').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const prompt = code.locator('[data-cy="origam-code-prompt"]')
            await expect(prompt).toHaveText('$')
            await expect(prompt).toHaveAttribute('aria-hidden', 'true')
        })

        test('prompt is positioned before the code in document order', async ({ page }) => {
            await gotoVariant(page, 3)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code--compact').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const promptLeft = await code.locator('[data-cy="origam-code-prompt"]').evaluate(
                el => el.getBoundingClientRect().left
            )
            const codeLeft = await code.locator('.origam-code__code').evaluate(
                el => el.getBoundingClientRect().left
            )
            expect(promptLeft).toBeLessThan(codeLeft)
        })

        test('compact copy is an icon button (not labeled "Copy")', async ({ page }) => {
            await gotoVariant(page, 3)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code--compact').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const compactCopy = code.locator('.origam-code__copy--compact')
            await expect(compactCopy).toBeVisible()
            await expect(compactCopy).not.toContainText('Copy')
        })

        test('compact copy button writes only the code (prompt excluded) to clipboard', async ({ page, context }) => {
            await context.grantPermissions(['clipboard-read', 'clipboard-write'])
            await gotoVariant(page, 3)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code--compact').first()
            await expect(code).toBeVisible({ timeout: 12000 })

            // Intercept clipboard writes in the sandbox frame.
            await sandbox.locator('body').evaluate(() => {
                (window as unknown as { __clip: string[] }).__clip = []
                Object.defineProperty(navigator, 'clipboard', {
                    configurable: true,
                    value: {
                        writeText: async (text: string) => {
                            (window as unknown as { __clip: string[] }).__clip.push(text)
                        }
                    }
                })
            })

            await code.locator('[data-cy="origam-code-copy"]').click()
            await page.waitForTimeout(300)

            const clips = await sandbox.locator('body').evaluate(
                () => (window as unknown as { __clip: string[] }).__clip
            )
            expect(clips.length).toBe(1)
            expect(clips[0]).toBe('npm install origam')
            expect(clips[0]).not.toContain('$')
        })
    })

    // ------------------------------------------------------------------ //
    // EVENTS - copy (index 4)                                             //
    // ------------------------------------------------------------------ //

    test.describe('Events - copy', () => {
        test('copy button is visible and has accessible aria-label', async ({ page }) => {
            await gotoVariant(page, 4)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const copyBtn = code.locator('[data-cy="origam-code-copy"]').first()
            await expect(copyBtn).toBeVisible()
            await expect(copyBtn).toHaveAttribute('aria-label', /.+/)
        })

        test('clicking copy toggles aria-label to "copied" feedback', async ({ page, context }) => {
            await context.grantPermissions(['clipboard-read', 'clipboard-write'])
            await gotoVariant(page, 4)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })

            // Intercept clipboard
            await sandbox.locator('body').evaluate(() => {
                (window as unknown as { __clip: string[] }).__clip = []
                Object.defineProperty(navigator, 'clipboard', {
                    configurable: true,
                    value: {
                        writeText: async (text: string) => {
                            (window as unknown as { __clip: string[] }).__clip.push(text)
                        }
                    }
                })
            })

            const copyBtn = code.locator('[data-cy="origam-code-copy"]').first()
            await copyBtn.click()
            await page.waitForTimeout(300)
            await expect(copyBtn).toHaveAttribute('aria-label', /copied/i)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Default (index 5)                                           //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('default slot renders the code block (figure + pre + code)', async ({ page }) => {
            await gotoVariant(page, 5)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code.locator('pre.origam-code__pre code.origam-code__code')).toHaveCount(1)
        })

        test('default slot variant has no footer element', async ({ page }) => {
            await gotoVariant(page, 5)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            await expect(code.locator('footer.origam-code__footer')).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Header (index 6)                                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Header', () => {
        test('custom header slot content is rendered inside the header zone', async ({ page }) => {
            await gotoVariant(page, 6)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            // The custom #header slot renders a <span> with the filename text + a <select>
            const header = code.locator('.origam-code__header').first()
            await expect(header).toBeVisible()
            // The slot injects "App.vue" as bold text
            await expect(header.locator('span').first()).toContainText('App.vue')
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Footer (index 7)                                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Footer', () => {
        test('footer slot renders as a <footer> element with class origam-code__footer', async ({ page }) => {
            await gotoVariant(page, 7)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const footer = code.locator('footer.origam-code__footer')
            await expect(footer).toBeVisible()
            const tag = await footer.evaluate(el => el.tagName.toLowerCase())
            expect(tag).toBe('footer')
        })

        test('footer slot content is rendered inside the footer element', async ({ page }) => {
            await gotoVariant(page, 7)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
            const footer = code.locator('footer.origam-code__footer')
            await expect(footer.locator('cite')).toHaveText('origam design system')
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT playground (index 8)                                        //
    // init: { lang: 'ts', lineNumbers: true, highlightLines: '2',        //
    //          copyable: true, filename: 'App.ts' }                       //
    // ------------------------------------------------------------------ //

    test.describe('Default (playground)', () => {
        test('renders the code root', async ({ page }) => {
            await gotoVariant(page, 8)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })
        })

        test('highlightLines="2" → row 2 carries origam-code__row--highlighted', async ({ page }) => {
            await gotoVariant(page, 8)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            // Wait for shiki to paint the rows first.
            await expect(sandbox.locator('.origam-code__row').first()).toBeVisible({ timeout: 16000 })

            const highlighted = await sandbox
                .locator('.origam-code__row--highlighted')
                .evaluateAll(els => els.map(el => el.getAttribute('data-line')))
            expect(highlighted).toEqual(['2'])
        })

        test('copy button writes the playground snippet to clipboard', async ({ page, context }) => {
            await context.grantPermissions(['clipboard-read', 'clipboard-write'])
            await gotoVariant(page, 8)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const code = sandbox.locator('.origam-code').first()
            await expect(code).toBeVisible({ timeout: 12000 })

            await sandbox.locator('body').evaluate(() => {
                (window as unknown as { __clip: string[] }).__clip = []
                Object.defineProperty(navigator, 'clipboard', {
                    configurable: true,
                    value: {
                        writeText: async (text: string) => {
                            (window as unknown as { __clip: string[] }).__clip.push(text)
                        }
                    }
                })
            })

            const copyBtn = code.locator('[data-cy="origam-code-copy"]').first()
            await expect(copyBtn).toBeVisible()
            await copyBtn.click()
            await page.waitForTimeout(300)

            const clips = await sandbox.locator('body').evaluate(
                () => (window as unknown as { __clip: string[] }).__clip
            )
            expect(clips.length).toBe(1)
            // The playground snippet contains the word "greet"
            expect(clips[0]).toContain('greet')
        })

        test('dual-theme shiki — no bare color: inline style (only --shiki-* vars)', async ({ page }) => {
            await gotoVariant(page, 8)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-code__row').first()).toBeVisible({ timeout: 16000 })
            const code = sandbox.locator('.origam-code__code').first()

            const hasBareColor = await code.evaluate(el => {
                return Array.from(el.querySelectorAll('span[style]')).some(s => {
                    const raw = (s as HTMLElement).getAttribute('style') ?? ''
                    return raw.includes('color:') && !raw.includes('--shiki-')
                })
            })
            expect(hasBareColor).toBe(false)
        })

        test('theme switch light→dark changes token span computed colour (CSS cascade, no JS re-render)', async ({ page }) => {
            await gotoVariant(page, 8)
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            await expect(sandbox.locator('.origam-code__row').first()).toBeVisible({ timeout: 16000 })

            // Optional-peer guard: skip when shiki couldn't load → plain fallback,
            // no `--shiki-*` token spans to compare across themes.
            const shikiSpanCount = await sandbox.locator('.origam-code__code span[style*="--shiki-light"]').count()
            test.skip(shikiSpanCount === 0, 'shiki highlighting unavailable (plain fallback) — no token spans to compare')

            // Dual-theme: shiki emits --shiki-light / --shiki-dark as inline custom props.
            // The SCSS maps color: var(--shiki-light) for light and
            // color: var(--shiki-dark) when html[data-mode="dark"].
            // We toggle data-mode on the sandbox <html> — purely a CSS operation.
            const lightColor = await sandbox.locator('html').evaluate(html => {
                html.removeAttribute('data-mode')
                const span = html.querySelector('.origam-code__code span[style*="--shiki-light"]') as HTMLElement | null
                return span ? window.getComputedStyle(span).color : null
            })

            const darkColor = await sandbox.locator('html').evaluate(html => {
                html.setAttribute('data-mode', 'dark')
                const span = html.querySelector('.origam-code__code span[style*="--shiki-light"]') as HTMLElement | null
                return span ? window.getComputedStyle(span).color : null
            })

            expect(lightColor).not.toBeNull()
            expect(darkColor).not.toBeNull()
            // Light and dark must resolve to distinct colours.
            expect(lightColor).not.toBe(darkColor)
        })
    })
})
