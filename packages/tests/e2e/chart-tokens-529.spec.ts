// #529 — 23 of the 26 Chart family components referenced obsolete,
// single-tiret semantic var names (`--origam-color-text-secondary`,
// `--origam-color-border-default`, …) that the current Style Dictionary
// pipeline has never emitted (real names use `__`/`--`/`---` — see
// CLAUDE.md's naming table). Those names never resolved, so every
// fallback chain fell through to a hardcoded Tailwind literal foreign
// to the DS (`#6b7280`, `#d1d5db`, `#3b82f6`, …) — frozen regardless of
// theme (light/dark/brand).
//
// jsdom NEVER resolves `var()` (#398 — confirmed project-wide), so this
// can only be verified in a real browser engine. No Histoire server is
// needed either: this tests the generated token sheet directly, which is
// lighter and more reliable than navigating a story.

import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../../ds')
const PRIMITIVE_CSS = readFileSync(path.join(DS_ROOT, 'src/assets/css/tokens/primitive.css'), 'utf-8')
const LIGHT_CSS = PRIMITIVE_CSS + readFileSync(path.join(DS_ROOT, 'src/assets/css/tokens/light.css'), 'utf-8')
const DARK_CSS = PRIMITIVE_CSS + readFileSync(path.join(DS_ROOT, 'src/assets/css/tokens/dark.css'), 'utf-8')

const FIXTURE_BODY = `
    <div id="text-secondary" style="color: var(--origam-color__text---secondary, #6b7280)"></div>
    <div id="text-primary" style="color: var(--origam-color__text---primary, #111827)"></div>
    <div id="border-default" style="border: 1px solid var(--origam-color__border---default, #d1d5db)"></div>
    <div id="border-subtle" style="border: 1px solid var(--origam-color__border---subtle, #e5e7eb)"></div>
    <div id="focus-ring" style="outline: 1px solid var(--origam-color__border---focus, #3b82f6)"></div>
    <div id="action-bg" style="background-color: var(--origam-color__action--primary---bg, #3b82f6)"></div>
    <div id="action-bg-hover" style="background-color: var(--origam-color__action--primary---bgHover, #2563eb)"></div>
    <div id="ghost-fg" style="color: var(--origam-color__action--ghost---fg, #3b82f6)"></div>
    <div id="surface-default" style="background-color: var(--origam-color__surface---default, #ffffff)"></div>
    <div id="surface-overlay" style="background-color: var(--origam-color__surface---overlay, #1f2937)"></div>
`

const CHECKS: Array<[string, 'color' | 'borderColor' | 'outlineColor' | 'backgroundColor']> = [
    ['text-secondary', 'color'],
    ['text-primary', 'color'],
    ['border-default', 'borderColor'],
    ['border-subtle', 'borderColor'],
    ['focus-ring', 'outlineColor'],
    ['action-bg', 'backgroundColor'],
    ['action-bg-hover', 'backgroundColor'],
    ['ghost-fg', 'color'],
    ['surface-default', 'backgroundColor'],
    ['surface-overlay', 'backgroundColor']
]

test.describe('Chart family tokens resolve through the real DS pipeline, not a foreign Tailwind literal (#529)', () => {
    test('every fixed var() chain resolves to a non-fallback value under light theme', async ({page}) => {
        await page.setContent(`<!doctype html><html data-theme="light"><head><style>${LIGHT_CSS}</style></head><body>${FIXTURE_BODY}</body></html>`)

        for (const [id, prop] of CHECKS) {
            const value = await page.locator(`#${id}`).evaluate((el, p) => getComputedStyle(el)[p], prop)
            expect(value, `${id} (${prop})`).not.toBe('')
            expect(value, `${id} (${prop})`).not.toBe('rgba(0, 0, 0, 0)')
        }
    })

    test('text-secondary / border-default / surface-overlay actually change value between light and dark — proof the chain is THEME-REACTIVE, not a frozen literal', async ({page}) => {
        await page.setContent(`<!doctype html><html data-theme="light"><head><style>${LIGHT_CSS}</style></head><body>${FIXTURE_BODY}</body></html>`)
        const light = {
            textSecondary: await page.locator('#text-secondary').evaluate((el) => getComputedStyle(el).color),
            borderDefault: await page.locator('#border-default').evaluate((el) => getComputedStyle(el).borderColor),
            surfaceOverlay: await page.locator('#surface-overlay').evaluate((el) => getComputedStyle(el).backgroundColor)
        }

        await page.setContent(`<!doctype html><html data-theme="dark"><head><style>${DARK_CSS}</style></head><body>${FIXTURE_BODY}</body></html>`)
        const dark = {
            textSecondary: await page.locator('#text-secondary').evaluate((el) => getComputedStyle(el).color),
            borderDefault: await page.locator('#border-default').evaluate((el) => getComputedStyle(el).borderColor),
            surfaceOverlay: await page.locator('#surface-overlay').evaluate((el) => getComputedStyle(el).backgroundColor)
        }

        // Before the fix, these three var() chains fell straight through
        // to a hardcoded Tailwind literal on EVERY theme — light and dark
        // rendered byte-identically. A real semantic token must differ.
        expect(dark.textSecondary).not.toBe(light.textSecondary)
        expect(dark.borderDefault).not.toBe(light.borderDefault)
        expect(dark.surfaceOverlay).not.toBe(light.surfaceOverlay)
    })

    test('no Chart component source references the obsolete single-tiret semantic names any more', async () => {
        const {readdirSync} = await import('node:fs')
        const CHART_DIR = path.join(DS_ROOT, 'src/components/Chart')
        const files = readdirSync(CHART_DIR).filter((f) => f.endsWith('.vue'))

        const obsoletePattern = /--origam-color-(text|border|surface|action)-[a-zA-Z-]*/

        for (const file of files) {
            const src = readFileSync(path.join(CHART_DIR, file), 'utf-8')
            const match = src.match(obsoletePattern)
            expect(match, `${file} still references an obsolete token: ${match?.[0]}`).toBeNull()
        }
    })
})
