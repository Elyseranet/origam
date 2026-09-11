import { inject } from 'vue'

import { ORIGAM_THEMES_KEY } from '../../consts'

import type { TInstalledThemes } from '../../types'

/**
 * `useInstalledThemes()` returns the list of brand themes installed via
 * `createOrigam({ themes })` — one entry per distinct brand `name`, each
 * listing the concrete modes it was installed for.
 *
 * Consumers (e.g. a theme switcher) map over this list instead of hard-coding
 * the available brands, so the UI stays in sync with whatever the app
 * installed. Returns an empty array when no themes were installed (or when
 * called outside an app that ran `createOrigam`), so callers never need a
 * null-guard.
 *
 * The list is static (snapshot at install time); pair it with `useTheme()` to
 * read / switch the active brand and mode.
 */

/*********************************************************
 * useInstalledThemes
 ********************************************************/
export function useInstalledThemes (): TInstalledThemes {
    return inject(ORIGAM_THEMES_KEY, [])
}
