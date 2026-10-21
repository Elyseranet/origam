// #1228 — the Nuxt module's `icons` option reaches createOrigam (both plugins call `nuxtIconsOptions`).
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import { nuxtIconsOptions } from '@origam/utils'
import OrigamIcon from '../../../ds/src/components/Icon/OrigamIcon.vue'

import clientSrc from '../../../ds/src/nuxt/plugin.client.ts?raw'
import serverSrc from '../../../ds/src/nuxt/plugin.server.ts?raw'

function html (icons?: Parameters<typeof nuxtIconsOptions>[0]['icons']): string {
    return mount(OrigamIcon, {
        props: { icon: '$info' },
        global: { plugins: [createOrigam({ ...nuxtIconsOptions({ icons }) })] }
    }).html()
}

describe('nuxtIconsOptions', () => {
    it('is empty without icons, forwards the object otherwise', () => {
        expect(nuxtIconsOptions({})).toEqual({})
        const icons = { aliases: { info: 'mdi-information-outline' } }
        expect(nuxtIconsOptions({ icons })).toEqual({ icons })
    })
})

describe('Nuxt icons option -> <origam-icon icon="$info">', () => {
    it('renders the configured alias class', () => {
        expect(html({ aliases: { info: 'mdi-information-outline' } })).toContain('mdi-information-outline')
    })
    it('without the option, the alias is not the custom one (non-regression)', () => {
        expect(html()).not.toContain('mdi-information-outline')
    })
})

describe('both Nuxt plugins feed icons to createOrigam', () => {
    for (const [side, src] of [['client', clientSrc], ['server', serverSrc]]) {
        it(`plugin.${side}.ts passes nuxtIconsOptions(config) to createOrigam`, () => {
            expect(src).toMatch(/createOrigam\(\{[^}]*\.\.\.nuxtIconsOptions\(config\)[^}]*\}\)/)
        })
    }
})
