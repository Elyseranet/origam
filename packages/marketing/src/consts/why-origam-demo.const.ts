import type { IOrigamTheme } from 'origam/interfaces'

import { appleThemes } from '~/themes/apple.theme'
import { cartoonThemes } from '~/themes/cartoon.theme'
import { ecomThemes } from '~/themes/ecom.theme'
import { editorialThemes } from '~/themes/editorial.theme'
import { geekThemes } from '~/themes/geek.theme'
import { glassThemes } from '~/themes/glass.theme'
import { materialThemes } from '~/themes/material.theme'
import { origamThemes } from '~/themes/origam.theme'

/**
 * Brand identities the live demo cycles through.
 *
 * ⛔ MEASURED, not assumed: these are the theme NAMES that actually emit a
 * `[data-theme="…"]` token block in the running app. The legacy `sobre` name
 * is gone (#245): the `THEME_CHIPS` chip is now `origam`, the baseline
 * identity listed first below.
 */
export const WHY_DEMO_THEMES: ReadonlyArray<{ key: string, themes: IOrigamTheme[] }> = [
    { key: 'origam', themes: origamThemes },
    { key: 'apple', themes: appleThemes },
    { key: 'cartoon', themes: cartoonThemes },
    { key: 'ecom', themes: ecomThemes },
    { key: 'editorial', themes: editorialThemes },
    { key: 'geek', themes: geekThemes },
    { key: 'glass', themes: glassThemes },
    { key: 'material', themes: materialThemes }
]

/**
 * The components actually standing on the demo stage. The code panel is
 * filtered to exactly this list so the visitor can match every line of the
 * extract to something visible on the left — no unverifiable claims.
 */
export const WHY_DEMO_COMPONENT_KEYS: ReadonlyArray<string> = [
    'origam-card',
    'origam-btn',
    'origam-chip',
    'origam-avatar',
    'origam-switch',
    'origam-text-field'
]
