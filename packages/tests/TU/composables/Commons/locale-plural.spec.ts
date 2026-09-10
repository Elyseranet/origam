// Plural support in the built-in i18n adapter — `Intl.PluralRules`.
//
// Why this exists: the Chart family builds sentences it announces to screen
// readers ("Box plot with 3 categories."). Those were hardcoded English
// template literals. Translating them needs plurals, and the built-in
// adapter had none — its own header documented the gap ("pas de pluriels").
//
// The rejected shortcut was `count === 1 ? key_one : key_other` chosen in
// each component. That hardcodes the ENGLISH plural rule into a library
// published on npm and translated by people whose language we don't know.
// Russian needs three forms for the same sentence, Japanese one, Polish
// four — and none of them split at "=== 1".
//
// `Intl.PluralRules(locale).select(n)` returns a CLDR category (zero / one /
// two / few / many / other). The adapter appends it to the key and falls
// back to `_other` when the locale file does not carry that category. That
// fallback is the load-bearing part: en/fr ship two forms while a Russian
// translator ships three, WITHOUT any component changing.

import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { createBuiltinAdapter } from '@origam/utils/Commons/locale.util'
import type { ILocaleMessages } from '@origam/interfaces/Commons/locale.interface'

const MESSAGES = {
    en: {
        box: {
            desc_one: 'Box plot with {count} category.',
            desc_other: 'Box plot with {count} categories.',
            positional_one: 'One item: {0}.',
            positional_other: 'Several items: {0}.'
        },
        rich: {
            desc_one: '{type} chart with {count} point, from {min} to {max}.',
            desc_other: '{type} chart with {count} points, from {min} to {max}.'
        },
        plain: 'Just a string',
        collide: 'Direct hit',
        collide_one: 'Should never win',
        collide_other: 'Should never win either'
    },
    // Russian splits 1 / 2-4 / 5+ — `select(3)` is `few`, `select(5)` is
    // `many`. This locale deliberately ships only `one` and `other`, which
    // is what a partially-translated file looks like in practice.
    ru: {
        box: {
            desc_one: 'RU one {count}',
            desc_other: 'RU other {count}'
        }
    },
    zz: {}
} as unknown as ILocaleMessages

// Same `ru` LOCALE TAG — the tag must stay valid BCP-47, or `Intl` throws
// and the adapter defaults to `other`, which would silently pass this test
// for the wrong reason. Only the message set differs: this one DOES carry
// the `few` form.
const MESSAGES_RU_FULL = {
    ru: {
        box: {
            desc_one: 'RU one {count}',
            desc_few: 'RU few {count}',
            desc_other: 'RU other {count}'
        }
    }
} as unknown as ILocaleMessages

function adapter (locale: string, fallback = 'en', messages: ILocaleMessages = MESSAGES) {
    return createBuiltinAdapter({
        current: ref(locale),
        fallback: ref(fallback),
        messages: computed(() => messages)
    })
}

describe('createBuiltinAdapter — Intl.PluralRules key selection', () => {
    it('selects the `one` form for a count of 1', () => {
        const { t } = adapter('en')

        expect(t('box.desc', 1)).toBe('Box plot with 1 category.')
    })

    it('selects the `other` form for a count of 3', () => {
        const { t } = adapter('en')

        expect(t('box.desc', 3)).toBe('Box plot with 3 categories.')
    })

    it('selects the `other` form for a count of 0 in English', () => {
        const { t } = adapter('en')

        // English CLDR: select(0) === 'other'. Pinned as an absolute value
        // because "0 categories" is the empty-chart sentence users hear.
        expect(t('box.desc', 0)).toBe('Box plot with 0 categories.')
    })

    it('falls back to `other` when the locale lacks the selected category', () => {
        const { t } = adapter('ru')

        // Intl.PluralRules('ru').select(3) === 'few', which `ru` does not
        // ship. Without the fallback this returns the raw key.
        expect(new Intl.PluralRules('ru').select(3)).toBe('few')
        expect(t('box.desc', 3)).toBe('RU other 3')
    })

    it('uses the specific category when the locale does ship it', () => {
        const { t } = adapter('ru', 'ru', MESSAGES_RU_FULL)

        expect(t('box.desc', 3)).toBe('RU few 3')
        expect(t('box.desc', 1)).toBe('RU one 1')
    })

    it('defaults to `other` when the locale tag is malformed', () => {
        // Measured, not assumed: `Intl.PluralRules` throws RangeError only
        // on a STRUCTURALLY invalid tag ('!!!', 'ru_full' — underscores are
        // not BCP-47). A merely unknown-but-well-formed tag like
        // 'not-a-locale' resolves normally, so it would NOT exercise the
        // catch. An untranslatable label must never break a render.
        expect(() => new Intl.PluralRules('!!!')).toThrow(RangeError)

        const { t } = adapter('!!!', 'en')

        expect(t('box.desc', 1)).toBe('Box plot with 1 categories.')
    })

    it('exposes the count positionally as well as by name', () => {
        const { t } = adapter('en')

        expect(t('box.positional', 1)).toBe('One item: 1.')
        expect(t('box.positional', 4)).toBe('Several items: 4.')
    })

    it('names the other variables through a trailing object', () => {
        const { t } = adapter('en')

        // A sentence with five variables is unreadable as {1}..{4} for the
        // person translating it. `count` stays reserved and cannot be
        // overridden by the object.
        expect(t('rich.desc', 2, {type: 'bar', min: 0, max: 9}))
            .toBe('bar chart with 2 points, from 0 to 9.')
        expect(t('rich.desc', 1, {type: 'line', min: 3, max: 3, count: 999}))
            .toBe('line chart with 1 point, from 3 to 3.')
    })

    it('never shadows a key that resolves directly', () => {
        const { t } = adapter('en')

        // Backward compatibility: every pre-existing call site resolves its
        // key directly and must keep doing so, count argument or not.
        expect(t('collide', 2)).toBe('Direct hit')
        expect(t('plain')).toBe('Just a string')
    })

    it('still returns the key when neither the direct nor the plural form exists', () => {
        const { t } = adapter('en')

        // A missing translation must stay VISIBLE, not silently blank.
        expect(t('box.nothing', 2)).toBe('box.nothing')
    })

    it('ignores a non-numeric first parameter', () => {
        const { t } = adapter('en')

        expect(t('box.desc', 'not a number')).toBe('box.desc')
    })
})
