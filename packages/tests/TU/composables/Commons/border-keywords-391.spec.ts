/**
 * #391 — the width keywords ('none' | 'thin' | 'thick') and the direction
 * keywords ('top' | 'right' | 'bottom' | 'left') must resolve to a real
 * WIDTH on the inline channel, not merely to a utility class.
 *
 * These assert on the STRINGS `useBorder` returns, which is what Vitest can
 * measure honestly here: `getComputedStyle` under jsdom never resolves
 * `var()`, so the browser-side proof lives in
 * `packages/tests/e2e/btn-border.spec.ts` and in the catalogue sweep of
 * `packages/tests/e2e/btn-cascade-layer-probe.spec.ts`.
 */

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IBorderProps } from '@origam/interfaces'

import { useBorder } from '@origam/composables/Commons/border.composable'

function mountWith (initial: IBorderProps['border']) {
    const props = reactive<IBorderProps>({ border: initial })
    let api!: ReturnType<typeof useBorder>

    const Host = defineComponent({
        name: 'OrigamBorderKeywordHost',
        setup () {
            api = useBorder(props)

            return () => h('div')
        }
    })

    mount(Host)

    return api
}

const widthOf = (styles: Array<string>, prop: string) =>
    styles.find((s) => s.startsWith(`${prop}:`))?.split(':')[1].trim()

describe('useBorder — #391 width keywords', () => {
    it.each([
        ['none', 'var(--origam-border__width---0)'],
        ['thin', 'var(--origam-border__width---thin)'],
        ['thick', 'var(--origam-border__width---2)']
    ])('border="%s" emits an inline width of %s', (kw, expected) => {
        const styles = mountWith(kw).borderStyles.value

        expect(widthOf(styles, 'border-width')).toBe(expected)
        expect(styles).toContain('border-style: solid')
    })

    it('thin and thick resolve to DIFFERENT widths', () => {
        const thin = mountWith('thin').borderStyles.value
        const thick = mountWith('thick').borderStyles.value

        expect(widthOf(thin, 'border-width')).not.toBe(widthOf(thick, 'border-width'))
    })

    it('keeps emitting the global utility class alongside', () => {
        expect(mountWith('thick').borderClasses.value).toContain('origam--border-thick')
    })
})

describe('useBorder — #391 direction keywords', () => {
    it.each(['top', 'right', 'bottom', 'left'])('border="%s" paints only that edge', (side) => {
        const styles = mountWith(side).borderStyles.value
        const others = ['top', 'right', 'bottom', 'left'].filter((s) => s !== side)

        expect(widthOf(styles, `border-${side}-width`)).toBe('var(--origam-border__width---thin)')

        for (const other of others) {
            expect(widthOf(styles, `border-${other}-width`), `${side} must zero ${other}`).toBe('var(--origam-border__width---0)')
        }
    })
})

describe('useBorder — #391 regressions guarded', () => {
    it('never parses a channel keyword as a colour', () => {
        for (const value of ['thick', 'none', 'top']) {
            const styles = mountWith(value).borderStyles.value

            expect(styles.join(' '), `${value} leaked into border-color`).not.toMatch(/border-color:\s*(thick|none|top)\b/)
        }
    })

    it('emits no empty width declaration', () => {
        for (const value of ['thick', 'none', 'top']) {
            const styles = mountWith(value).borderStyles.value

            for (const decl of styles) {
                expect(decl.trim(), `empty declaration from "${value}"`).not.toMatch(/:\s*$/)
            }
        }
    })

    it('still honours a free-form string and a numeric width', () => {
        expect(mountWith('2px dashed').borderStyles.value).toContain('border-width: 2px')
        expect(mountWith(4).borderStyles.value).toContain('border-width: 4px')
    })
})
