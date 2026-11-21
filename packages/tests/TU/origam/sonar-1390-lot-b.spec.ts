// #1390 lot B — refactors Sonar a comportement constant. Ces cas epinglent les
// trois changements dont l'equivalence n'est pas evidente a la lecture.
import { describe, expect, it } from 'vitest'

import { BORDER_REGEX } from '@origam/consts/Commons/border.const'
import { ALIGN } from '@origam/enums/Commons/align.enum'
import { BORDER_STYLE } from '@origam/enums/Commons/border.enum'
import { BOTTOM_NAV_POSITION } from '@origam/enums/BottomNav/bottom-nav.enum'
import { TOKEN_GROUP_CHILD, TOKEN_GROUP_STATE, tokenPathToCssVarName } from '@origam/utils/Commons/token-name.util'
import { tokenPathToCssVarName as coreName } from '../../../ds/scripts/token-name.mjs'

describe('BORDER_REGEX — groupe couleur decoupe en sous-constantes', () => {
    it('garde exactement la source d\'origine', () => {
        const styles = Object.values(BORDER_STYLE).join('|')
        const colorGroup = '(?<color>(?: ?(?:(?:(?:#)(?:[a-f0-9]{3}|[a-f0-9]{6}))|(?:var\\(--[^)]+\\))|(?:(?:rgb|hsl|rgba)a?\\(.*\\))|(?:[A-Za-z]+))){0,4})'
        const original = '^'
            + `(?<width>(?: ?var\\(--[^)]+\\)(?= +(?:${styles}))| ?(?:[0-9]+)(?:px|pt|PC|in|cm|mm|em|rem|%|ex|ch|fr)?){0,4})`
            + ' {0,1}'
            + `(?<style>(?:(?: ?(?:${styles}))+){0,4})`
            + ' ?'
            + colorGroup
            + '$'

        expect(BORDER_REGEX.source).toBe(new RegExp(original).source)
    })

    it('capture toujours largeur / style / couleur', () => {
        const groups = BORDER_REGEX.exec('2px solid #ff0000')?.groups
        expect(groups?.width).toBe('2px')
        expect(groups?.style?.trim()).toBe('solid')
        expect(groups?.color?.trim()).toBe('#ff0000')
    })
})

describe('BOTTOM_NAV_POSITION — valeurs litterales alignees sur ALIGN', () => {
    it.each([['START', ALIGN.START], ['CENTER', ALIGN.CENTER], ['END', ALIGN.END]] as const)('%s', (key, align) => {
        expect(BOTTOM_NAV_POSITION[key]).toBe(align)
    })
})

describe('markedComponentVarName — marqueur final sans valeur', () => {
    it.each([TOKEN_GROUP_CHILD, TOKEN_GROUP_STATE])('%s en derniere position reste une propriete (parite build-time)', (marker) => {
        const path = ['table', 'header', marker]
        expect(tokenPathToCssVarName(path, true)).toBe(coreName(path, true))
        expect(tokenPathToCssVarName(path, true)).toBe(`origam-table---header-${marker}`)
    })
})
