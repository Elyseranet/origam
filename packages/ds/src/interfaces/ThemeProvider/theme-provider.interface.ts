import type { ITagProps } from '../Commons/commons.interface'
import type {
    TMode,
    TTheme
} from '../../types/Commons/theme.type'

/** Props for `<OrigamThemeProvider>` — the sub-tree theme/mode override wrapper. */
export interface IThemeProviderProps extends ITagProps {
    /**
     * Theme (brand) to apply to this sub-tree. Children that read CSS vars
     * resolve them against this `data-theme` instead of the document root.
     *
     * Use `'auto'` to defer to the closest ancestor (no `data-theme`
     * attribute is rendered).
     */
    theme?: TTheme
    /**
     * Color mode to force on this sub-tree, applied as `data-mode`.
     * Orthogonal to `theme`: a branded sub-tree can be pinned to light
     * or dark independently of the document mode.
     *
     * Use `'auto'` to defer to the closest ancestor (no `data-mode`
     * attribute is rendered).
     */
    mode?: TMode
    /**
     * HTML tag for the wrapper. Default `div`. Use `section`/`article`/etc.
     * when the wrapper carries semantic meaning.
     */
    tag?: string
}

/*********************************************************
 * IThemeProviderEmits
 *
 * @description
 * `<OrigamThemeProvider>` declares NO own emit, and the SFC itself never
 * calls `emit(...)` nor uses a composable that would (no `useVModel`,
 * no `useGroupItem`).
 * @description
 * The component sets `inheritAttrs: false` and re-applies `$attrs` (minus
 * `class`, merged explicitly into the root's class list) via
 * `v-bind="restAttrs"` — see issue #492. A consumer's `@click` / `@update:x`
 * listener therefore lands on the root as a native DOM event listener, not
 * as a component emit; this component still declares none of its own.
 ********************************************************/
export interface IThemeProviderEmits {}

/** Slot signatures for `<OrigamThemeProvider>`. */
export interface IThemeProviderSlots {
    default?: () => any
}
