// TU — dom.util.ts
// Exports: attachedRoot, escapeCssIdent
//
// jsdom provides a real document — we can test the main branch.
// Shadow DOM (getRootNode) is partially supported in jsdom — the composed
// path check may not behave identically to a real browser. We test
// the deterministic paths: attached node, detached node, and the
// fallback path when getRootNode is absent.

import { describe, expect, it } from 'vitest'
import { attachedRoot, escapeCssIdent } from '@origam/utils/Commons/dom.util'

describe('attachedRoot', () => {
    it('returns document for a node attached to the DOM', () => {
        const el = document.createElement('div')
        document.body.appendChild(el)

        const root = attachedRoot(el)
        // jsdom: getRootNode() on an attached node returns document
        expect(root).toBe(document)

        document.body.removeChild(el)
    })

    it('returns null for a detached node', () => {
        const el = document.createElement('div')
        // Not appended anywhere — detached node
        const root = attachedRoot(el)
        expect(root).toBeNull()
    })

    it('returns null for a node in a detached sub-tree', () => {
        const parent = document.createElement('div')
        const child = document.createElement('span')
        parent.appendChild(child)
        // Neither parent nor child is attached to document
        expect(attachedRoot(child)).toBeNull()
    })

    it.skip('fallback path when getRootNode is not a function (IE11 compat)', () => {
        // jsdom always has getRootNode — can only be tested by deleting the
        // method from the prototype, which would break other tests in this run.
        // Candidate: manual test or separate isolated jsdom context.
    })
})

// ---------------------------------------------------------------------------
// escapeCssIdent
//
// `useStyle()` interpolates an element id straight into a real stylesheet rule
// (`#<id> { … }`), and that id can come from the CONSUMER (the `id` prop), so
// the interpolation has to be escaped. Two distinct failure modes:
//   1. ids that are legal in HTML but illegal as a CSS ident (leading digit,
//      dot, colon — very common with template-generated ids); unescaped they
//      make the rule match nothing, silently;
//   2. an id crafted to close the selector and append arbitrary rules to the
//      document.
//
// jsdom exposes no `CSS` global, so these exercise the manual fallback branch,
// not the native `CSS.escape` delegation.
// ---------------------------------------------------------------------------

describe('escapeCssIdent', () => {
    it('leaves a plain ident untouched', () => {
        expect(escapeCssIdent('probe-btn')).toBe('probe-btn')
        expect(escapeCssIdent('origam-title-12')).toBe('origam-title-12')
        expect(escapeCssIdent('a_B-9')).toBe('a_B-9')
    })

    it('escapes a leading digit', () => {
        expect(escapeCssIdent('1abc')).toBe('\\31 abc')
    })

    it('escapes a digit following a leading hyphen', () => {
        expect(escapeCssIdent('-1abc')).toBe('-\\31 abc')
    })

    it('escapes a lone hyphen', () => {
        expect(escapeCssIdent('-')).toBe('\\-')
    })

    it('escapes dots and colons', () => {
        expect(escapeCssIdent('form.field:1')).toBe('form\\.field\\:1')
    })

    it('neutralises an id that would otherwise close the selector and inject rules', () => {
        const escaped = escapeCssIdent('a { } body { display: none }')

        // Not "contains no brace" — an escaped brace is still the two
        // characters `\{`. What must hold is that no brace is UNESCAPED, i.e.
        // none is reachable by the CSS parser as a block delimiter.
        expect(escaped).not.toMatch(/(?<!\\)[{}]/)
        expect(escaped).toContain('\\{')
        expect(escaped).toContain('\\}')

        // Same for the declaration separators an injected rule would need.
        expect(escaped).not.toMatch(/(?<!\\)[:;]/)
    })

    it('escapes control characters using the hex form', () => {
        expect(escapeCssIdent('a\u0001b')).toBe('a\\1 b')
    })

    it('replaces NULL with the replacement character', () => {
        expect(escapeCssIdent('a\u0000b')).toBe('a�b')
    })

    it('leaves non-ASCII through — legal in a CSS ident', () => {
        expect(escapeCssIdent('héro')).toBe('héro')
    })
})
