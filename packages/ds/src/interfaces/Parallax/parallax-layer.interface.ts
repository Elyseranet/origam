import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'

export interface IParallaxLayerProps extends ICommonsComponentProps, ITagProps {
    /**
     * Parallax speed multiplier for this layer.
     *  - `0`   → fixed (no movement, sticks to host)
     *  - `0.5` → half the scroll speed (background — far)
     *  - `1`   → moves with the scroll (neutral)
     *  - `>1`  → faster than the scroll (foreground — near)
     *
     * Negative values reverse the direction.
     */
    speed?: number

    /**
     * Static X-axis offset (px) applied on top of the parallax translation.
     * Useful to nudge a layer without changing its speed.
     */
    offsetX?: number

    /**
     * Static Y-axis offset (px) applied on top of the parallax translation.
     */
    offsetY?: number

    /*********************************************************
     * mouseX / mouseY
     *
     * @description
     * Pointer amplitude (px) per axis: how far the layer slides when the
     * pointer goes from the host centre to its edge. Independent from
     * `speed`, which only drives the scroll.
     * @description
     * Only active with a fine pointer (`(hover: hover) and (pointer: fine)`)
     * and without `prefers-reduced-motion: reduce`.
     * @description
     * `mouseX` unset keeps the legacy rule (`direction="both"`: host width
     * x 0.5 x speed; otherwise ignored). `mouseY` unset = no vertical move.
     ********************************************************/
    mouseX?: number
    mouseY?: number

    /**
     * Optional `z-index` override. By default layers stack in document order.
     */
    zIndex?: number
}

/*********************************************************
 * IParallaxLayerEmits
 *
 * @description
 * `<OrigamParallaxLayer>` emits nothing of its own — it registers into
 * the parent `<OrigamParallax>` registry (via `provide`/`inject`) and
 * is mutated directly by the host's rAF loop, outside Vue emit wiring.
 ********************************************************/
export interface IParallaxLayerEmits {}

/** Slot signatures for `<OrigamParallaxLayer>`. */
export interface IParallaxLayerSlots {
    default?: () => any
}

export interface IParallaxLayerRegistry {
    /**
     * Internal layer descriptor as registered into the parent OrigamParallax
     * via `provide` / `inject`. The parent reads `speed`, `offsetX`,
     * `offsetY` to compute the per-frame transform, then applies it via the
     * shared `target` HTMLElement.
     */
    id: symbol
    speed: number
    offsetX: number
    offsetY: number
    mouseX?: number
    mouseY?: number
    target: HTMLElement
}
