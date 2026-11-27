// #1517 lot 4B — la fenêtre de code de l'accueil montre le seul Primaire, sérialisé EXACTEMENT depuis les props rendues.
import { describe, expect, it } from 'vitest'

import { HOME_DEMO_CODE_BUTTON } from '~/consts/playground.const'
import { buildHomeDemoSnippet } from '~/utils/home-demo.util'

describe('buildHomeDemoSnippet', () => {
    it('shows the Primary button only, one prop per line, from its rendered props', () => {
        expect(HOME_DEMO_CODE_BUTTON.key).toBe('primary')
        expect(buildHomeDemoSnippet(HOME_DEMO_CODE_BUTTON, 'Primaire'))
            .toBe('<OrigamBtn\n  variant="flat"\n  bg-color="primary"\n  size="x-large"\n>Primaire</OrigamBtn>\n')
    })

    it('prints a boolean prop as a bare attribute', () => {
        expect(buildHomeDemoSnippet({ key: 'a', labelKey: '', labelFallback: '', props: { border: true, variant: 'flat' } }, 'A'))
            .toBe('<OrigamBtn\n  border\n  variant="flat"\n>A</OrigamBtn>\n')
    })
})
