// Regression for #386 — Style Dictionary emitted `OrigamBreadcrumbItem` /
// `OrigamBreadcrumbDivider` tokens as BEM children of the parent component
// (`--origam-breadcrumb__item---*` / `__divider---*`), but both are
// separate, independently-shipped `Origam*.vue` files (per the project's own
// naming convention, each gets its own component-level namespace) that read
// `--origam-breadcrumb-item---*` / `-divider---*`. The names never matched —
// the token was emitted, the component read a different name, only the
// hardcoded local fallback ever applied.
//
// Fix: moved `item` / `divider` out of the nested `breadcrumb` DTCG block
// into their own top-level `tokens/component/breadcrumb-item.json` /
// `breadcrumb-divider.json` files.
//
// This spec proves the wiring at the level TU *can* prove: the generated
// theme stylesheets now emit the names the components read, and the old
// BEM-child names are gone. It cannot prove the full CSS cascade resolves
// end-to-end in the browser — jsdom does not resolve `var(...)` at all
// (verified with an isolated probe while fixing #387: `getComputedStyle`
// returns the literal unresolved string regardless of how the declaration
// reaches the element). That proof lives in
// packages/tests/e2e/breadcrumb-token-namespace.spec.ts (Playwright, real
// browser).
//
// SCOPE CAVEAT — measured, not assumed: of the ~13 properties per component,
// only TWO are genuinely reachable via this rename — `padding-inline`
// (divider) and `opacity-disabled` (item). The rest (`color`, `background`,
// `border-*`, `box-shadow`, `transition-*`, `font-size`, `character`,
// `hover-color`, `active-color`) are shadowed by a SEPARATE, deeper bug:
// the component's own scoped SCSS redeclares the same custom-property name
// locally (a hardcoded literal, or a read of a *different* name), and that
// local declaration always wins the cascade regardless of the token
// pipeline's naming (higher specificity than `:root`). That is tracked in
// its own ticket — this PR does not claim to fix it.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const DS_ROOT = path.resolve(__dirname, '../../../../ds')
const TOKENS_CSS_DIR = path.join(DS_ROOT, 'src/assets/css/tokens')

function readCss (file: string): string {
    return readFileSync(path.join(TOKENS_CSS_DIR, file), 'utf-8')
}

describe('OrigamBreadcrumbItem/Divider — token namespace matches the component (#386)', () => {
    it.each(['light.css', 'dark.css'])('%s emits --origam-breadcrumb-divider---* (not the old __divider--- BEM-child name)', (file) => {
        const css = readCss(file)
        expect(css).toContain('--origam-breadcrumb-divider---padding-inline:')
        expect(css).not.toContain('--origam-breadcrumb__divider---')
    })

    it.each(['light.css', 'dark.css'])('%s emits --origam-breadcrumb-item---* (not the old __item--- BEM-child name)', (file) => {
        const css = readCss(file)
        expect(css).toContain('--origam-breadcrumb-item---opacity-disabled:')
        expect(css).not.toContain('--origam-breadcrumb__item---')
    })

    it('OrigamBreadcrumbDivider.vue reads --origam-breadcrumb-divider---padding-inline (the exact name now emitted)', () => {
        const src = readFileSync(path.join(DS_ROOT, 'src/components/Breadcrumb/OrigamBreadcrumbDivider.vue'), 'utf-8')
        expect(src).toContain('var(--origam-breadcrumb-divider---padding-inline,')
    })

    it('OrigamBreadcrumbItem.vue reads --origam-breadcrumb-item---opacity-disabled (the exact name now emitted)', () => {
        const src = readFileSync(path.join(DS_ROOT, 'src/components/Breadcrumb/OrigamBreadcrumbItem.vue'), 'utf-8')
        expect(src).toContain('var(--origam-breadcrumb-item---opacity-disabled,')
    })
})
