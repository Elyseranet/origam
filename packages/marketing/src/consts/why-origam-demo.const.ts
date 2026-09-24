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
 * `[data-theme="…"]` token block in the running app. `sobre` is deliberately
 * ABSENT — it appears in `THEME_CHIPS` (home page) but no `IOrigamTheme`
 * carries that name, so `[data-theme="sobre"]` matches only 5 declarations
 * (a `.home-themes__chip` hack in HomeThemes.vue) and the sub-tree silently
 * falls back to the root tokens. Listing it would show the visitor the same
 * rendering twice and call it two identities.
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
