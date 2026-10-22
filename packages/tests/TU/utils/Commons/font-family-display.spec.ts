// #1212 — slot de police `display` : enum, jeton primitif (repli sur sans),
// grammaire de theme `typo.family.display`, emission par useTypography.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FONT_FAMILY } from '@origam/enums/Commons/font-family.enum'
import { themeVarsToVars } from '@origam/utils/Commons/apply-theme.util'
import { useTypography } from '@origam/composables/Commons/typography.composable'

const SHEETS = ['css/tokens/primitive.css', 'scss/tokens/_primitive.scss']

describe('#1212 — slot de police display', () => {
    it('FONT_FAMILY expose DISPLAY', () => {
        expect(FONT_FAMILY.DISPLAY).toBe('display')
    })

    it.each(SHEETS)('%s declare display avec repli sur sans', (sheet) => {
        const text = readFileSync(resolve(__dirname, '../../../../ds/src/assets', sheet), 'utf8')
        expect(text).toContain('--origam-font__family---display: var(--origam-font__family---sans);')
    })

    it('typo.family.display emet --origam-font__family---display', () => {
        const vars = themeVarsToVars({ typo: { family: { display: "'Bagel Fat One', cursive" } } })
        expect(vars['--origam-font__family---display']).toBe("'Bagel Fat One', cursive")
    })

    it('fontFamily="display" emet le jeton display', () => {
        const { typographyStyles } = useTypography({ fontFamily: 'display' }, 'title')
        expect(typographyStyles.value!['--origam-title---font-family']).toBe('var(--origam-font__family---display)')
    })
})
