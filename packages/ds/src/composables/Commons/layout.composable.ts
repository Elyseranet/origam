import { inject } from 'vue'
import { ORIGAM_LAYOUT_KEY } from '../../consts/Commons/layout.const'

/*********************************************************
 * useLayout
 *
 * @description
 * Reads the nearest `ORIGAM_LAYOUT_KEY` injection provided by
 * `useCreateLayout` and exposes its main-area rect/styles.
 * Throws when no layout provider is found in the tree — unlike
 * `useLayoutItem`, a bare consumer of the main area has no sensible
 * standalone fallback.
 * Independent from `useLayoutItem` / `useCreateLayout` at the call
 * level (no direct function dependency) — the three only share the
 * `ORIGAM_LAYOUT_KEY` provide/inject contract.
 ********************************************************/
export function useLayout () {
    const layout = inject(ORIGAM_LAYOUT_KEY)

    if (!layout) {
        throw new Error('[Origam] Could not find injected layout')
    }

    return {
        getLayoutItem: layout.getLayoutItem,
        mainRect: layout.mainRect,
        mainStyles: layout.mainStyles,
        mainId: layout.layoutId
    }
}
