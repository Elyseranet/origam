import { describe, expect, it } from 'vitest'

import {
    THEME_BUILDER_COLOR_TYPE_HINTS,
    THEME_BUILDER_SKIP_TYPE_HINTS
} from '~/consts/theme-builder-groups.const'
import { isThemeBuilderColorType, isThemeBuilderSkippableType } from '~/utils/theme-builder-type.util'

describe('theme-builder-type.util (#1054)', () => {
    it.each(['TIntent', 'TIcon', 'TVariant', 'TColor'])('keeps %s themable', (label) => {
        expect(isThemeBuilderSkippableType(label)).toBe(false)
    })
    it.each(['IBtnProps', 'IChartSeries[]', 'Array<IFoo>', '(e: Event) => void'])('skips %s', (label) => {
        expect(isThemeBuilderSkippableType(label)).toBe(true)
    })
    it('no colour hint is also skipped', () => {
        for (const hint of THEME_BUILDER_COLOR_TYPE_HINTS) {
            expect(isThemeBuilderSkippableType(hint)).toBe(false)
            expect(isThemeBuilderColorType(hint)).toBe(true)
        }
        expect((THEME_BUILDER_SKIP_TYPE_HINTS as readonly string[]).includes('I')).toBe(false)
    })
})
