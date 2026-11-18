// #1181 — the Nuxt module's `locale` option reaches createOrigam (both plugins
// call `nuxtLocaleOptions`) and produces the supplied strings.
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import { createOrigam } from '@origam/origam'
import { useLocale } from '@origam/composables'
import { nuxtLocaleOptions } from '@origam/utils'

import type { ILocaleOptions } from '@origam/interfaces'

const ja = { origam: { code: { copy: 'コピー' } } }

function tOf (key: string, locale?: ILocaleOptions): string {
    let out = ''
    const C = defineComponent({
        setup () {
            out = useLocale().t(key)
            return () => h('i')
        }
    })
    mount(C, { global: { plugins: [createOrigam({ ...nuxtLocaleOptions({ locale }) })] } })
    return out
}

describe('nuxtLocaleOptions', () => {
    it('is empty without locale, forwards the object otherwise', () => {
        expect(nuxtLocaleOptions({})).toEqual({})
        expect(nuxtLocaleOptions({ locale: { locale: 'ja' } })).toEqual({ locale: { locale: 'ja' } })
    })
})

describe('Nuxt locale option -> t()', () => {
    it('defaults to English', () => {
        expect(tOf('origam.code.copy')).toBe('Copy')
    })
    it('returns the supplied ja string', () => {
        expect(tOf('origam.code.copy', { locale: 'ja', fallbackLocale: 'en', messages: { ja } })).toBe('コピー')
    })
    it('falls back to en for a key missing from ja', () => {
        expect(tOf('origam.code.copy_aria_label', { locale: 'ja', fallbackLocale: 'en', messages: { ja } }))
            .toBe('Copy code to clipboard')
    })
    it('overrides a few fr keys, keeping the other built-in fr ones', () => {
        const o = { locale: 'fr', messages: { fr: { origam: { code: { copy: 'Dupliquer' } } } } }
        expect(tOf('origam.code.copy', o)).toBe('Dupliquer')
        expect(tOf('origam.code.copy_aria_label', o)).not.toBe('Copy code to clipboard')
    })
})

import clientSrc from '../../../ds/src/nuxt/plugin.client.ts?raw'
import serverSrc from '../../../ds/src/nuxt/plugin.server.ts?raw'

describe('both Nuxt plugins feed the locale to createOrigam', () => {
    // The plugins import `#app`, unavailable under vitest: assert the wiring on source.
    for (const [side, src] of [['client', clientSrc], ['server', serverSrc]]) {
        it(`plugin.${side}.ts passes nuxtLocaleOptions(config) to createOrigam`, () => {
            expect(src).toMatch(/createOrigam\(\{[^}]*\.\.\.nuxtLocaleOptions\(config\)[^}]*\}\)/)
        })
    }
})
