import type { Ref } from 'vue'
import type { IDimensionProps } from '../../interfaces'

import type { TAnchor, TLocationStrategy, TLocationStrategyFn } from '../../types'

export interface ILocationProps {
    location?: TAnchor
}

export interface ILocationStrategyProps extends IDimensionProps {
    locationStrategy?: TLocationStrategy | TLocationStrategyFn
    location?: TAnchor
    origin?: TAnchor | 'auto' | 'overlap'
    offset?: number | string | Array<number>
    /**
     * Pixels of breathing room enforced between the floating content and
     * each viewport edge by the connected location strategy. Defaults to
     * `12` so dropdowns / menus / tooltips never touch the browser chrome.
     *
     * Components where the activator legitimately spans the full viewport
     * (e.g. an `<origam-select>` taking the full row width) should pass
     * `0` — otherwise the guard's inward shift produces a visible offset
     * between the activator's left edge and the dropdown's left edge.
     */
    viewportMargin?: number
}

export interface ILocationStrategyData {
    contentEl: Ref<HTMLElement | undefined>
    target: Ref<HTMLElement | [x: number, y: number] | undefined>
    isActive: Ref<boolean>
}
