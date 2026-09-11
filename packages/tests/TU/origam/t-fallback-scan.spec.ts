// Fixtures for the t-fallback guard (#502).
//
// The guard's whole difficulty is that it must NOT judge on the argument's
// shape. `t(key, 'literal')` is wrong when the message carries no
// interpolation token, and RIGHT when it does. Getting that backwards would
// have condemned 11 correct calls in this repo — Carousel, DatePicker,
// OtpInputField, TextField, QrCode…
//
// So precision and recall are pinned separately, against a fixture
// catalogue rather than the live one, so these tests keep their meaning
// when en.json changes.

import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { scanTFallbacks } from '../../../ds/scripts/guards/lib/t-fallback-scan.mjs'

/** A throwaway source tree + catalogue, so the fixtures never drift with en.json. */
function fixture (source: string, messages: Record<string, unknown>) {
    const dir = mkdtempSync(join(tmpdir(), 'origam-t-fallback-'))
    const src = join(dir, 'src')

    mkdirSync(src, { recursive: true })
    writeFileSync(join(src, 'Component.vue'), source)

    const locale = join(dir, 'en.json')
    writeFileSync(locale, JSON.stringify(messages))

    return { src, locale }
}

const CATALOGUE = {
    origam: {
        code: { copy: 'Copy' },
        validation: { max_length: 'Maximum {0} characters' },
        qr_code: { aria_label: 'QR code for {value}' }
    }
}

describe('t-fallback guard — RECALL (it catches the real defect)', () => {
    it('flags a literal passed to a message with no interpolation token', () => {
        const { src, locale } = fixture(
            `const a = t('origam.code.copy', 'Copy')`,
            CATALOGUE
        )
        const found = scanTFallbacks(src, locale)

        expect(found).toHaveLength(1)
        expect(found[0]).toMatchObject({ key: 'origam.code.copy', reason: 'inert-argument' })
    })

    it('flags several offenders in one file', () => {
        const { src, locale } = fixture(
            `t('origam.code.copy', 'Copy')\nt('origam.code.copy', "Copier")`,
            CATALOGUE
        )

        expect(scanTFallbacks(src, locale)).toHaveLength(2)
    })

    it('reports an unknown key separately rather than staying silent', () => {
        const { src, locale } = fixture(
            `t('origam.does.not.exist', 'Whatever')`,
            CATALOGUE
        )
        const found = scanTFallbacks(src, locale)

        expect(found).toHaveLength(1)
        expect(found[0].reason).toBe('unknown-key')
    })
})

describe('t-fallback guard — PRECISION (it spares legitimate interpolation)', () => {
    /*********************************************************
     * The cases that make shape-based detection wrong.
     *
     * @description
     * A literal IS a valid parameter when the message interpolates. Both
     * positional `{0}` and named `{value}` forms occur in this DS, and both
     * must survive the guard.
     ********************************************************/
    it('spares a literal when the message carries a positional token', () => {
        const { src, locale } = fixture(
            `t('origam.validation.max_length', '10')`,
            CATALOGUE
        )

        expect(scanTFallbacks(src, locale)).toHaveLength(0)
    })

    it('spares a literal when the message carries a named token', () => {
        const { src, locale } = fixture(
            `t('origam.qr_code.aria_label', 'https://example.com')`,
            CATALOGUE
        )

        expect(scanTFallbacks(src, locale)).toHaveLength(0)
    })

    it('ignores a single-argument call', () => {
        const { src, locale } = fixture(`t('origam.code.copy')`, CATALOGUE)

        expect(scanTFallbacks(src, locale)).toHaveLength(0)
    })

    it('ignores a NON-literal second argument, whatever the message', () => {
        // `limit` may be a legitimate parameter; the guard only judges
        // literals, because a variable's value is not knowable statically.
        const { src, locale } = fixture(
            `t('origam.code.copy', limit)`,
            CATALOGUE
        )

        expect(scanTFallbacks(src, locale)).toHaveLength(0)
    })
})

describe('t-fallback guard — the live DS tree stays clean', () => {
    it('reports no inert argument across packages/ds/src', () => {
        expect(scanTFallbacks()).toEqual([])
    })
})
