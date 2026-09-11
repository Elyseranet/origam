import type { ICommonsComponentProps, ITagProps } from '../../interfaces'

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

    /**
     * Optional `z-index` override. By default layers stack in document order.
     */
    zIndex?: number
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
    target: HTMLElement
}
