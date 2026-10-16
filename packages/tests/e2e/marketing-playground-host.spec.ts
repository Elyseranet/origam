// Lot E (#1145, closes #1056) — the marketing site as a HOST of the
// playground engine, measured in a real browser against the Nuxt dev server.
//
// What this pins, each on what the page RENDERS rather than on its markup:
//
//   /components/{slug}
//   1. The full `Playground` mounts in the Playground section and renders the
//      documented component from its default snippet; the Code panel shows it.
//   2. An inspector edit reaches the rendered instance AND the generated code.
//   3. The toolbar's brand theme reaches the preview: a computed longhand of
//      the instance differs between two identities, and the theme / mode are
//      re-read on the playground root INSIDE the same evaluate (CLAUDE.md:
//      a probe must prove which identity it measured).
//   4. A sub-part renders where it lives — `window-item` inside the Window
//      snippet, `data-table-footer` inside the DataTable its parent renders —
//      and an overlay (`dialog`) renders IN the preview, not under <body>.
//   5. A component that cannot render on its own says why (`spacer`).
//   6. The hero band's curated variants render through the engine.
//
//   /theming
//   7. The preview goes through the engine: components the former 23-slug
//      allowlist never previewed (`data-table`, `chart-axis`) now render.
//   8. A prop the theme sets reaches the preview through the defaults
//      provider — the channel the exported theme takes in an app.
//
//   #1173 — embedded chrome: no title; single-component mode (one root, no
//   child) hides Scene / Catalog / "Select in preview"; Light / Dark / Auto
//   group; no sideways overflow at 390 / 768 / 1024 / 1440 px.
//
// A/B: against the parent commit (`7c3f0b1fb`, the former
// `ComponentLivePreview` / `<component :is>` previews) every test fails at
// its first engine locator — measured, see the PR body.

import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const ENGINE = '[data-cy="component-playground-engine"]'
const INSTANCE = '[data-cy="playground-preview-instance"]'

const openFiche = async (page: Page, slug: string) => {
    await page.goto(`/components/${slug}`, { waitUntil: 'load' })
    await expect(page.locator(ENGINE)).toBeVisible({ timeout: 30_000 })
}

const chooseOption = async (page: Page, field: Locator, label: string) => {
    await field.click()
    await page.getByRole('option', { name: label, exact: true }).click()
}

test.describe('/components/{slug} — playground engine (#1145)', () => {
    test('btn: the engine renders the button and its code', async ({ page }) => {
        await openFiche(page, 'btn')

        const instance = page.locator(`${ENGINE} .pg-preview__stage ${INSTANCE}`).first()
        await expect(instance).toBeVisible()
        await expect(instance).toHaveClass(/origam-btn/)

        await page.locator(`${ENGINE} [data-cy="playground-dock-handle"]`).click()
        await expect(page.locator(`${ENGINE} [data-cy="playground-code"] code`)).toContainText('<origam-btn')
    })

    test('btn: an inspector edit reaches the instance and the code', async ({ page }) => {
        await openFiche(page, 'btn')

        const instance = page.locator(`${ENGINE} .pg-preview__stage ${INSTANCE}`).first()
        await expect(instance).not.toHaveClass(/origam-btn--variant-tonal/)

        await chooseOption(page, page.locator(`${ENGINE} [data-cy="playground-control-input-variant"]`), 'tonal')
        await expect(instance).toHaveClass(/origam-btn--variant-tonal/)

        await page.locator(`${ENGINE} [data-cy="playground-dock-handle"]`).click()
        await expect(page.locator(`${ENGINE} [data-cy="playground-code"] code`)).toContainText('variant="tonal"')
    })

    test('btn: the toolbar theme reaches the preview, light and dark', async ({ page }) => {
        await openFiche(page, 'btn')

        const read = () => page.evaluate(({ engine, instance }) => {
            const root = document.querySelector(engine) as HTMLElement
            const el = root.querySelector(`.pg-preview__stage ${instance}`) as HTMLElement
            const style = getComputedStyle(el)

            return {
                theme: root.getAttribute('data-theme'),
                mode: root.getAttribute('data-mode'),
                look: [style.backgroundColor, style.borderTopWidth, style.borderTopLeftRadius, style.boxShadow, style.fontFamily].join(' | ')
            }
        }, { engine: ENGINE, instance: INSTANCE })

        const themeField = page.locator('[data-cy="component-playground-theme"]')

        await chooseOption(page, themeField, 'Origam')
        await expect.poll(async () => (await read()).theme).toBe('origam')
        const origam = await read()

        await chooseOption(page, themeField, 'Cartoon')
        await expect.poll(async () => (await read()).theme).toBe('cartoon')
        const cartoon = await read()

        expect(cartoon.mode).toBe(origam.mode)
        expect(cartoon.look).not.toBe(origam.look)

        /* #1173 — Light / Dark / Auto group; Auto pins no `data-mode` (follows the site). */
        expect(cartoon.mode).toBeNull()

        await page.locator('[data-cy="component-playground-mode-dark"]').click()
        await expect.poll(async () => (await read()).mode).toBe('dark')
        const dark = await read()
        expect(dark.theme).toBe('cartoon')

        await page.locator('[data-cy="component-playground-mode-light"]').click()
        await expect.poll(async () => (await read()).mode).toBe('light')
        const light = await read()
        expect(light.theme).toBe('cartoon')
        expect(light.look).not.toBe(dark.look)

        await page.locator('[data-cy="component-playground-mode-auto"]').click()
        await expect.poll(async () => (await read()).mode).toBeNull()
    })

    test('window-item renders inside the Window snippet', async ({ page }) => {
        await openFiche(page, 'window-item')

        const stage = page.locator(`${ENGINE} .pg-preview__stage`)
        await expect(stage.locator('.origam-window')).toBeVisible()
        await expect(stage.locator('.origam-window-item').first()).toBeAttached()
        await expect(page.locator('[data-cy="preview-reason-window-item"]')).toHaveCount(0)
    })

    test('data-table-footer renders inside the DataTable that renders it, and says so', async ({ page }) => {
        await openFiche(page, 'data-table-footer')

        const stage = page.locator(`${ENGINE} .pg-preview__stage`)
        await expect(stage.locator('.origam-data-table').first()).toBeVisible()
        await expect(stage.locator('.origam-data-table-footer').first()).toBeVisible()
        await expect(page.locator('[data-cy="preview-reason-data-table-footer"]')).toContainText('DataTable')
    })

    test('dialog renders IN the preview, not under <body>', async ({ page }) => {
        await openFiche(page, 'dialog')

        const stage = page.locator(`${ENGINE} .pg-preview__stage`)
        await expect(stage.locator('.origam-dialog').first()).toBeVisible()

        const inside = await stage.evaluate(el => {
            const box = el.getBoundingClientRect()
            const content = el.querySelector('.origam-dialog') as HTMLElement
            const rect = content.getBoundingClientRect()

            return el.contains(content) && rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1
        })
        expect(inside).toBe(true)
    })

    test('spacer cannot render on its own and says why', async ({ page }) => {
        await openFiche(page, 'spacer')

        await expect(page.locator('[data-cy="preview-reason-spacer"]')).toBeVisible()
    })

    test('the hero variants render through the engine', async ({ page }) => {
        await openFiche(page, 'btn')

        const hero = page.locator(`[data-cy="component-preview-stage"] ${INSTANCE}`)
        await expect(hero.first()).toBeVisible()
        expect(await hero.count()).toBeGreaterThan(1)
    })
})

test.describe('/components/{slug} — embedded chrome (#1173)', () => {
    const cy = (page: Page, name: string) => page.locator(`${ENGINE} [data-cy="${name}"]`)

    test('btn (one root, no child): no title, no Catalog, no Scene, no "Select in preview", no counter', async ({ page }) => {
        await openFiche(page, 'btn')

        await expect(cy(page, 'playground-inspector')).toBeVisible()
        await expect(cy(page, 'playground-title')).toHaveCount(0)
        await expect(cy(page, 'playground-catalog-open')).toHaveCount(0)
        await expect(cy(page, 'playground-scene-tree')).toHaveCount(0)
        await expect(cy(page, 'playground-select-mode-toggle')).toHaveCount(0)
        await expect(cy(page, 'playground-prop-tally')).toHaveCount(0)
    })

    test('btn: the theme select stays, the mode is a Light / Dark / Auto group', async ({ page }) => {
        await openFiche(page, 'btn')

        await expect(page.locator('[data-cy="component-playground-theme"]')).toBeVisible()
        const group = page.locator('[data-cy="component-playground-mode"]')
        await expect(group).toHaveClass(/origam-btn-toggle/)
        for (const mode of ['light', 'dark', 'auto']) await expect(page.locator(`[data-cy="component-playground-mode-${mode}"]`)).toBeVisible()
    })

    test('btn-group (children): the Scene, the Catalog and "Select in preview" are back', async ({ page }) => {
        await openFiche(page, 'btn-group')

        await expect(cy(page, 'playground-scene-tree')).toBeVisible()
        await expect(cy(page, 'playground-catalog-open')).toBeVisible()
        await expect(cy(page, 'playground-select-mode-toggle')).toBeVisible()
        await expect(cy(page, 'playground-title')).toHaveCount(0)
    })

    for (const width of [390, 768, 1024, 1440]) {
        test(`${width} px: the page never scrolls sideways and the toolbar stays inside the playground`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 })
            await openFiche(page, 'btn-group')

            const result = await page.evaluate(engine => {
                const root = document.querySelector(engine) as HTMLElement
                const rect = root.getBoundingClientRect()
                const outside = [...root.querySelectorAll<HTMLElement>('.pg-topbar *')].filter(element => {
                    const own = element.getBoundingClientRect()

                    return own.width > 0 && (own.right > rect.right + 1 || own.left < rect.left - 1)
                }).length

                return { scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth, outside }
            }, ENGINE)

            expect(result).toEqual({ scrollX: 0, outside: 0 })
        })
    }
})

test.describe('/theming — previews on the engine (#1145, #1056)', () => {
    /*
     * Filter the nav, open every category still collapsed (the filter does not
     * expand them — measured, 5/5 « element is not visible »), then click.
     */
    const select = async (page: Page, slug: string, name: string) => {
        await page.locator('[data-cy="theming-nav-search"] input').fill(name)
        const toggles = page.locator('[data-cy^="theming-nav-cat-toggle-"][aria-expanded="false"]')
        while (await toggles.count() > 0) await toggles.first().click()
        await page.locator(`[data-cy="theming-nav-item-${slug}"]`).click()
    }

    test.beforeEach(async ({ page }) => {
        await page.goto('/theming', { waitUntil: 'load' })
        await page.locator('[data-cy="theming-nav-item-btn"]').waitFor({ state: 'attached', timeout: 30_000 })
        /* A click before hydration lands on a button Vue has not wired yet. */
        await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as unknown as { __vue_app__?: unknown } | null)?.__vue_app__))
    })

    test('components outside the former 23-slug allowlist now preview', async ({ page }) => {
        for (const [slug, name] of [['data-table', 'DataTable'], ['chart-axis', 'ChartAxis'], ['tabs', 'Tabs'], ['window-item', 'WindowItem']]) {
            await select(page, slug!, name!)
            await expect(page.locator(`[data-cy="theming-live-${slug}-light"]`).first(), slug).toBeVisible({ timeout: 15_000 })
            await expect(page.locator('[data-cy="theming-unavailable-light"]'), slug).toHaveCount(0)
        }
    })

    test('a prop the theme sets reaches the preview through the defaults provider', async ({ page }) => {
        await select(page, 'btn', 'Btn')

        const live = page.locator('[data-cy="theming-live-btn-light"]')
        await expect(live).toBeVisible()
        await expect(live).not.toHaveClass(/origam-btn--variant-tonal/)

        const row = page.locator('[data-cy="theming-prop-variant"]').first()
        if (!(await row.isVisible())) await row.locator('xpath=ancestor::details[1]/summary').click()
        await chooseOption(page, row.locator('.origam-select').first(), 'tonal')
        await expect(live).toHaveClass(/origam-btn--variant-tonal/)
    })
})
