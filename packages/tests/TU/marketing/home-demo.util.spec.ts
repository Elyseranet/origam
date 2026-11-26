// #1517 lot 4B — le code de la démo d'accueil sérialise EXACTEMENT les props passées aux OrigamBtn rendus.
import { describe, expect, it } from 'vitest'

import { HOME_DEMO_BUTTONS, HOME_DEMO_SNIPPET_MAX_LINE } from '~/consts/playground.const'
import { buildHomeDemoSnippet } from '~/utils/home-demo.util'

describe('buildHomeDemoSnippet', () => {
    const labels = { primary: 'Primaire', secondary: 'Secondaire', ghost: 'Fantôme' }
    const snippet = buildHomeDemoSnippet(HOME_DEMO_BUTTONS, labels)

    it('wraps one OrigamBtn per button in a <template>', () => {
        expect(snippet.startsWith('<template>\n')).toBe(true)
        expect(snippet.trimEnd().endsWith('</template>')).toBe(true)
        expect(snippet.match(/<OrigamBtn[\s>]/g)).toHaveLength(HOME_DEMO_BUTTONS.length)
        expect(snippet.match(/<\/OrigamBtn>/g)).toHaveLength(HOME_DEMO_BUTTONS.length)
    })

    it('prints every prop of every button, a boolean as a bare attribute', () => {
        for (const { props } of HOME_DEMO_BUTTONS) {
            for (const [name, value] of Object.entries(props)) {
                expect(snippet).toMatch(value === true ? new RegExp(`[ \\n]${name}[ \\n>]`) : new RegExp(`${name}="${value.toString().replace(/[()]/g, '\\$&')}"`))
            }
        }
    })

    it('prints the translated labels', () => {
        for (const label of Object.values(labels)) expect(snippet).toContain(label)
    })

    it('keeps a short button on one line and breaks a long one attribute per line', () => {
        const short = buildHomeDemoSnippet([{ key: 'a', labelKey: '', labelFallback: '', props: { variant: 'flat' } }], { a: 'A' })
        expect(short).toContain('  <OrigamBtn variant="flat">A</OrigamBtn>\n')

        const long = buildHomeDemoSnippet([{ key: 'a', labelKey: '', labelFallback: '', props: { variant: 'flat', border: true, 'bg-color': 'x'.repeat(HOME_DEMO_SNIPPET_MAX_LINE) } }], { a: 'A' })
        expect(long).toContain('  <OrigamBtn\n    variant="flat"\n    border\n    bg-color="')
        expect(long).toContain('\n  >\n    A\n  </OrigamBtn>')
        for (const line of short.split('\n')) expect(line.length).toBeLessThanOrEqual(HOME_DEMO_SNIPPET_MAX_LINE)
    })
})
