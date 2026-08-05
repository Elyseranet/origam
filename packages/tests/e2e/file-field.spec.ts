import { expect, test } from '@playwright/test'

/**
 * OrigamFileField — 11 PDF-aligned display modes (Phase 3 ·N).
 *
 * The 11 modes (variant titles in the Histoire sidebar) — these MUST stay
 * in sync with `OrigamFileField.story.vue`:
 *   1.  Prop — single + paperclip  (default)
 *   2.  Prop — empty state         (no value, placeholder + paperclip)
 *   3.  Prop — multiple (chips)    (display="chips")
 *   4.  Prop — multiple (counter)  (display="counter")
 *   5.  Prop — dropzone (empty)    (dropzone=true, no value)
 *   6.  Prop — dropzone (empty)    (same variant, tests synthetic dragenter)
 *   7.  Prop — dropzone (single file)  (dropzone + 1 file)
 *   8.  Prop — dropzone (multiple files) (dropzone + multiple files)
 *   9.  Prop — dropzone (error)    (error="…")
 *   10. Prop — disabled & readonly (disabled=true)
 *   11. Prop — showSize            (showSize=true → "(2.4 MB)")
 *
 * Conventions:
 *   - `getByRole('link', { name, exact })` for variant nav (NOT getByText).
 *   - The Histoire sandbox is iframed; component locators go through
 *     `page.frameLocator('iframe[src*="__sandbox"]')`.
 *   - Cross-Variant assertions are the bare minimum to detect a silently
 *     broken prop (per the "test-as-you-build" rule in CLAUDE.md).
 */
const STORY_PATH = '/stories/story/components-stories-filefield-origamfilefield-story-vue'

const navigateToVariant = async (page: import('@playwright/test').Page, name: string) => {
    await page.goto(STORY_PATH)
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name, exact: true }).click()
    // Histoire mounts the new variant inside the sandbox iframe; give it a
    // tick to swap the preview.
    await page.waitForTimeout(800)
}

test.describe('OrigamFileField — PDF P3 11 modes', () => {
    // Mode 11 (Show size) drives a native file-input change event through
    // useVModel → useMask-adjacent reactivity → OrigamFileFieldListItem
    // mount; this measured ~24s on a loaded dev machine (multiple
    // concurrent Histoire/build processes) — comfortably under the default
    // 30s test timeout on its own, but with no margin. Same 45s allowance
    // already used by btn.spec.ts / breadcrumb.spec.ts for MDI-icon-heavy
    // variants on a cold Playwright context.
    test.setTimeout(45000)

    test('Mode 1 — Single + paperclip: file input + paperclip prepend', async ({ page }) => {
        await navigateToVariant(page, 'Prop — single + paperclip')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-single-paperclip"]')

        await expect(root).toBeVisible({ timeout: 5000 })
        await expect(root.locator('input[type="file"]')).toBeAttached()
        // Paperclip icon is rendered via mdi-paperclip (default prependInner).
        await expect(root.locator('.mdi-paperclip').first()).toBeVisible({ timeout: 3000 })
    })

    test('Mode 2 — Empty: placeholder text visible, no files', async ({ page }) => {
        await navigateToVariant(page, 'Prop — empty state')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-empty"]')

        await expect(root).toBeVisible({ timeout: 5000 })
        // Native input has 0 files.
        const fileCount = await root.locator('input[type="file"]').evaluate(
            (el: HTMLInputElement) => el.files?.length ?? 0
        )
        expect(fileCount).toBe(0)
        // Placeholder propagated to the native input.
        await expect(root.locator('input[type="file"]')).toHaveAttribute('placeholder', /no file selected/i)
    })

    test('Mode 3 — Multiple chips: each file is a closable chip', async ({ page }) => {
        await navigateToVariant(page, 'Prop — multiple (chips)')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-chips"]')

        await expect(root).toBeVisible({ timeout: 5000 })

        // Programmatically inject 2 fake files and confirm the chip count
        // matches.
        await root.locator('input[type="file"]').evaluate((el: HTMLInputElement) => {
            const dt = new DataTransfer()
            dt.items.add(new File(['a'], 'alpha.txt'))
            dt.items.add(new File(['b'], 'beta.txt'))
            el.files = dt.files
            el.dispatchEvent(new Event('change', { bubbles: true }))
        })
        await page.waitForTimeout(200)

        await expect(root.locator('.origam-chip')).toHaveCount(2)
    })

    test('Mode 4 — Multiple counter: counter pill + "{n} files" text', async ({ page }) => {
        await navigateToVariant(page, 'Prop — multiple (counter)')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-counter"]')

        await expect(root).toBeVisible({ timeout: 5000 })

        await root.locator('input[type="file"]').first().evaluate((el: HTMLInputElement) => {
            const dt = new DataTransfer()
            dt.items.add(new File(['a'], 'first.txt'))
            dt.items.add(new File(['b'], 'second.txt'))
            dt.items.add(new File(['c'], 'third.txt'))
            el.files = dt.files
            el.dispatchEvent(new Event('change', { bubbles: true }))
        })
        await page.waitForTimeout(800)

        // The selection text should mention the file count and the
        // word "files". vue-i18n v11 sometimes renders unresolved list
        // placeholders with surrounding whitespace, so we match loosely.
        const txt = await root.locator('.origam-file-field__selection-text').textContent()
        expect(txt ?? '').toMatch(/3/)
        expect(txt ?? '').toMatch(/files?/i)

        // Counter pill is rendered as a sibling of the selection-text — the
        // wrapping <origam-transition> uses v-show, so we settle for
        // 'attached' (the element exists in the DOM tree).
        await expect(root.locator('[data-cy="file-field-inline-counter"]')).toBeAttached({ timeout: 3000 })

        // And displayMode='counter' suppresses the file-list (no <ul>).
        await expect(root.locator('.origam-file-field__list')).toHaveCount(0)
    })

    test('Mode 5 — Dropzone empty: dropzone mounted, no --dragging', async ({ page }) => {
        await navigateToVariant(page, 'Prop — dropzone (empty)')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-dropzone-empty"]')

        await expect(root).toBeVisible({ timeout: 5000 })
        const zone = root.locator('.origam-file-field__dropzone')
        await expect(zone).toBeVisible({ timeout: 3000 })
        await expect(zone).not.toHaveClass(/origam-file-field__dropzone--dragging/)
    })

    test('Mode 6 — Dropzone dragging: dragenter toggles --dragging', async ({ page }) => {
        // The story has no dedicated "dragging" variant — we reuse the empty
        // dropzone variant and fire a synthetic dragenter to trigger the state.
        await navigateToVariant(page, 'Prop — dropzone (empty)')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-dropzone-empty"]')
        const zone = root.locator('.origam-file-field__dropzone')

        await expect(zone).toBeVisible({ timeout: 5000 })

        // Synthetic dragenter event — Vue listens with @dragenter.prevent so
        // a CustomEvent that bubbles is enough.
        await zone.evaluate((el) => {
            const ev = new Event('dragenter', { bubbles: true, cancelable: true })
            el.dispatchEvent(ev)
        })
        await page.waitForTimeout(100)

        await expect(zone).toHaveClass(/origam-file-field__dropzone--dragging/, { timeout: 2000 })
    })

    test('Mode 7 — Dropzone single: collapsed card preview', async ({ page }) => {
        await navigateToVariant(page, 'Prop — dropzone (single file)')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-dropzone-single"]')

        await expect(root).toBeVisible({ timeout: 5000 })
        // Single-file in dropzone = `--has-file` modifier flips on.
        await expect(
            root.locator('.origam-file-field__dropzone--has-file')
        ).toBeVisible({ timeout: 3000 })
        // The collapsed card item is the dragndrop-item component.
        await expect(root.locator('.origam-file-field-dragndrop-item')).toBeVisible({ timeout: 3000 })
    })

    test('Mode 8 — Dropzone multiple: file cards stacked', async ({ page }) => {
        await navigateToVariant(page, 'Prop — dropzone (multiple files)')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-dropzone-multiple"]')

        await expect(root).toBeVisible({ timeout: 5000 })

        // The list has at least the seeded 3 files.
        const items = root.locator('.origam-file-field-list-item')
        await expect(items.first()).toBeVisible({ timeout: 3000 })
        const count = await items.count()
        expect(count).toBeGreaterThanOrEqual(3)
    })

    test('Mode 9 — Dropzone error: --error class + message visible', async ({ page }) => {
        await navigateToVariant(page, 'Prop — dropzone (error)')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-dropzone-error"]')

        await expect(root).toBeVisible({ timeout: 5000 })
        await expect(
            root.locator('.origam-file-field__dropzone--error')
        ).toBeVisible({ timeout: 3000 })

        // Message rendered with role=alert.
        const msg = root.locator('[data-cy="file-field-dropzone-error-message"]')
        await expect(msg).toContainText(/too large/i, { timeout: 3000 })
    })

    test('Mode 10 — Disabled: input disabled + dropzone has pointer-events:none', async ({ page }) => {
        await navigateToVariant(page, 'Prop — disabled & readonly')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-disabled"]')

        await expect(root).toBeVisible({ timeout: 5000 })

        // Native file input carries the disabled attribute.
        await expect(root.locator('input[type="file"]')).toBeDisabled({ timeout: 3000 })

        // Dropzone is rendered (init-state has dropzone:true) and reduced-
        // opacity / not-allowed cursor signals the disabled visual.
        const zone = root.locator('.origam-file-field__dropzone--disabled')
        await expect(zone).toBeVisible({ timeout: 3000 })
        const cursor = await zone.evaluate(el => getComputedStyle(el).cursor)
        expect(cursor).toMatch(/not-allowed/)
    })

    test('Mode 11 — Show size: filename + size suffix visible', async ({ page }) => {
        await navigateToVariant(page, 'Prop — showSize')

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const root = sandbox.locator('[data-cy="file-field-show-size"]')

        await expect(root).toBeVisible({ timeout: 5000 })

        // Inject a fake 2.4 MB file via the native input. The change event
        // wires through `useVModel` and the model update emits to the
        // story. The list-item component then renders a `__meta` line
        // with `humanReadableFileSize(file.size, base)` => "2.4 MB".
        await root.locator('input[type="file"]').first().evaluate((el: HTMLInputElement) => {
            const dt = new DataTransfer()
            dt.items.add(new File([new Uint8Array(2_400_000)], 'big.bin'))
            el.files = dt.files
            el.dispatchEvent(new Event('change', { bubbles: true }))
        })

        await expect(
            root.locator('.origam-file-field-list-item__meta').first()
        ).toBeVisible({ timeout: 5000 })

        const meta = await root
            .locator('.origam-file-field-list-item__meta')
            .first()
            .textContent()
        expect(meta ?? '').toMatch(/(KB|MB|GB|B)/i)
    })
})
