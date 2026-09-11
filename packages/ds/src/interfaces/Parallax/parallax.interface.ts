import type {
    IAudioProps,
    IBorderProps,
    IBox,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    IParallaxLayerRegistry,
    IUseAudioProps
} from '../../interfaces'

import type { TParallaxDirection, TParallaxEasing, TParallaxEvent, TPoint } from '../../types'

import type { Ref } from 'vue'

// `IColorProps` exposes `color` / `bgColor` hooks. The Parallax SCSS
// already reads `var(--origam-parallax---background-color)` and
// `--color` from the design tokens (added in 2931d43); declaring the
// props here lets the consumer override them per-instance via inline
// styles, matching every other coloured component.
export interface IParallaxProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IDimensionProps, IAudioProps, IUseAudioProps {
    /**
     * @deprecated Use `duration` instead. `animationDuration` is kept as a
     * silent alias for backwards-compat and will be removed in v3.0.0.
     * When both are passed, `animationDuration` wins so existing consumers
     * relying on the old prop name keep their behaviour, but a one-shot
     * console warning is emitted at runtime to flag the migration.
     */
    animationDuration?: number
    /**
     * Easing curve. Accepts either:
     *  - a TParallaxEasing keyword (`'linear' | 'ease-out' | 'spring'`),
     *    routed through the scroll-driven multi-layer code path,
     *  - or any raw CSS timing-function string (legacy mouse / scroll
     *    transition path, e.g. `'cubic-bezier(...)'`).
     *
     * The keyword form is preferred for new code; the raw string form is
     * kept for backwards compatibility with v2.x.
     */
    easing?: TParallaxEasing | string
    perspective?: number
    event?: TParallaxEvent
    active?: boolean
    duration?: number

    // Phase 4 — multi-layer parallax.

    /**
     * Direction of the parallax effect.
     *  - `'vertical'` (default) → translateY based on vertical scroll progress.
     *  - `'horizontal'`         → translateX based on vertical scroll progress.
     *  - `'both'`               → translate on both axes; on `event="move"`
     *                            this maps to a 2D mouse ratio.
     */
    direction?: TParallaxDirection

    /**
     * Global parallax speed multiplier when no `<OrigamParallaxLayer>` is
     * provided (single-layer mode). Equivalent to wrapping the slot in a
     * single layer with this speed. Default `0.5`.
     */
    speed?: number

    /**
     * Force the parallax effect OFF (translate stays at 0 regardless of
     * scroll / events). Distinct from `active` which only freezes the
     * mouse-driven mode. Useful for SSR, snapshot tests, or `prefers-
     * reduced-motion` integrations.
     */
    disabled?: boolean

    /**
     * Proportion (0 → 1) of the host that must enter the viewport before
     * the parallax effect activates. `0` (default) starts the effect the
     * moment the host's top edge crosses the bottom of the viewport;
     * `0.3` waits until 30% of the host is visible.
     */
    threshold?: number
}

export interface IParallaxProvide {
    audioData: Ref<any>
    eventData: Ref<TPoint>
    movement: Ref<{ x: number, y: number, target?: IBox | DOMRect }>
    isMoving: Ref<boolean>
    event: Ref<TParallaxEvent>
    duration: Ref<number>
    easing: Ref<string>
    shape: Ref<IBox | null>
}

/**
 * Provide context exposed by the enriched OrigamParallax to its
 * `<OrigamParallaxLayer>` children. Distinct from the legacy
 * `IParallaxProvide` consumed by `<OrigamParallaxElement>` (kept
 * separate to avoid coupling the two APIs).
 */
export interface IParallaxLayerProvide {
    direction: Ref<TParallaxDirection>
    easing: Ref<TParallaxEasing | string>
    disabled: Ref<boolean>
    /**
     * Live scroll progress, normalised to `[0, 1]`. `0` = host just entered
     * the viewport, `1` = host just left.
     */
    progress: Ref<number>
    /**
     * Live mouse-ratio for `direction="both"` on `event="move"` —
     * `{ x: 0..1, y: 0..1 }`. Falls back to `{ x: 0.5, y: 0.5 }` when no
     * mouse data is available.
     */
    mouseRatio: Ref<{ x: number, y: number }>
    /**
     * Whether the runtime is using the CSS scroll-driven path (true) or the
     * JS rAF fallback (false). Layers may opt out of the JS work when the
     * CSS path is active.
     */
    cssScrollDriven: Ref<boolean>
    /**
     * Whether `prefers-reduced-motion: reduce` is honoured — layers MUST
     * stay at offset 0 when this is true.
     */
    reducedMotion: Ref<boolean>
    /**
     * Register / unregister a layer with the parent. The parent reads the
     * registry to compute and apply per-layer transforms each frame.
     */
    register: (layer: IParallaxLayerRegistry) => void
    unregister: (id: symbol) => void
}
