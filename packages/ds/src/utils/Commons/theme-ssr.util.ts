import type { IOrigamTheme, IRenderThemeCssOptions } from '../../interfaces'
import { themeToCss, themeToUnpinnedCss } from './apply-theme.util'

/*********************************************************
 * renderThemeCss (#1386)
 *
 * @description
 * Server-side theme CSS for ONE page: only the active brand, and only the
 * active mode when it is pinned, never every installed theme. Same selection
 * as the Nuxt server plugin (which now calls this function), so a plain Vue /
 * Nitro host gets the identical no-flash first paint without importing
 * `apply-theme.util` by its internal path.
 * @description
 * Mode pinned (`light` | `dark`): the blocks of that mode and the
 * mode-agnostic ones. Not pinned: agnostic blocks, then light, then dark, the
 * last two under `@media (prefers-color-scheme)` so dark wins (#1103).
 * Put the result in a `<style>` in `<head>`.
 ********************************************************/
export function renderThemeCss (themes: readonly IOrigamTheme[], options: IRenderThemeCssOptions = {}): string {
    const brand = options.theme && options.theme !== 'auto' ? options.theme : ''
    const pinned = options.mode === 'light' || options.mode === 'dark' ? options.mode : null

    const active = themes.filter((theme) => {
        const brandMatches = brand ? theme.name === brand : !theme.name
        const modeMatches = !pinned || theme.mode === undefined || theme.mode === 'auto' || theme.mode === pinned
        return brandMatches && modeMatches
    })

    if (pinned) {
        return active.map(themeToCss).join('\n')
    }

    return [
        ...active.filter(t => t.mode !== 'light' && t.mode !== 'dark').map(themeToCss),
        ...active.filter(t => t.mode === 'light').map(themeToUnpinnedCss),
        ...active.filter(t => t.mode === 'dark').map(themeToUnpinnedCss)
    ].join('\n')
}
