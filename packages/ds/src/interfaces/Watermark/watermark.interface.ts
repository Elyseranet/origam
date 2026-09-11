import type {
    ICommonsComponentProps,
    ITagProps
} from '../../interfaces'

/**
 * Props for `<OrigamWatermark>` — repeating diagonal overlay used
 * to mark a sub-tree as `CONFIDENTIAL` / `DRAFT` / personalised by
 * recipient.
 *
 * The component renders an absolutely-positioned `__layer` over its
 * `#default` slot, with a `background-image` set to a `data:image/svg+xml`
 * data-URL. The SVG contains a single `<text>` (or `<image>`) glyph
 * rotated by `angle` and centred inside a tile of size
 * `(gap + fontSize) × (gap + fontSize)`; CSS `background-repeat: repeat`
 * tiles the glyph across the wrapped area.
 *
 * `pointer-events: none` on the layer (default) keeps the wrapped
 * content fully interactive — buttons, links and form controls inside
 * the slot continue to receive clicks through the overlay.
 *
 * The watermark is purely visual. It is **not** a security feature —
 * a determined user can always remove the overlay via DevTools or by
 * disabling JS. The optional `antiTamper` flag installs a
 * `MutationObserver` that re-injects the layer when it is removed or
 * its style is mutated; this is dissuasion, not protection.
 */
export interface IWatermarkProps extends ICommonsComponentProps, ITagProps {
    /**
     * Text glyph repeated across the tile. Required unless `image` is
     * passed. UTF-8 is supported (emoji, accents, …) and the SVG
     * `<text>` element renders with the browser's font stack, so the
     * rendered glyph inherits anti-aliasing from the platform.
     */
    text?: string
    /**
     * URL / data-URL of an image used as the repeated glyph. Wins over
     * `text` when both are passed. Pair with a transparent PNG or SVG
     * for the cleanest result on dark surfaces.
     */
    image?: string
    /**
     * Opacity of the rendered glyph, between `0` and `1`. The value is
     * applied at the SVG level (not as a CSS `opacity` on the layer)
     * so the wrapped content stays at full opacity beneath.
     *
     * @default 0.1
     */
    opacity?: number
    /**
     * Rotation in degrees applied to each tile. Negative values rotate
     * counter-clockwise — `-30` produces the classic top-left to
     * bottom-right diagonal common to confidential-document watermarks.
     *
     * @default -30
     */
    angle?: number
    /**
     * Distance (in CSS pixels) between two adjacent tiles, measured
     * along both axes. Drives the density of the watermark: smaller
     * `gap` = tighter pattern.
     *
     * @default 120
     */
    gap?: number
    /**
     * Font size (in CSS pixels) of the text glyph. Ignored when the
     * `image` prop is used.
     *
     * @default 16
     */
    fontSize?: number
    /**
     * CSS `font-family` of the text glyph. `'inherit'` resolves to the
     * SVG element's own default (Helvetica / Arial sans-serif on most
     * platforms) since the SVG is loaded as a data-URL — it cannot
     * inherit from the surrounding document.
     *
     * @default 'inherit'
     */
    fontFamily?: string
    /**
     * Colour of the text glyph. Any CSS colour string. `'currentColor'`
     * does NOT work here because the SVG is loaded as a data-URL and
     * therefore detached from the document's cascade — pass an explicit
     * colour for non-default values.
     *
     * @default 'currentColor'
     */
    color?: string
    /**
     * CSS `font-weight` of the text glyph. Accepts the standard CSS
     * values (`100`–`900`, `'normal'`, `'bold'`, …).
     *
     * @default 400
     */
    fontWeight?: number | string
    /**
     * `z-index` of the overlay layer. Use a value above the wrapped
     * content but below any floating UI you want to keep clickable
     * (menus, tooltips, modals). Defaults to `1` so the watermark sits
     * just above the slot.
     *
     * @default 1
     */
    zIndex?: number
    /**
     * Installs a `MutationObserver` that re-injects the layer when it
     * is removed from the DOM or when its inline style hides it (e.g.
     * `display: none`, `opacity: 0`). The observer is scoped to the
     * component's own DOM subtree and is disconnected on unmount.
     *
     * This is a **dissuasive** measure, not a security feature — a
     * user with DevTools can always disable JS or block the script.
     *
     * @default false
     */
    antiTamper?: boolean
    /**
     * Whether the overlay intercepts pointer events. `'none'` (the
     * default) lets clicks pass through to the wrapped content;
     * `'auto'` blocks interaction (useful when the watermark itself is
     * meant to be selectable for copy-paste, e.g. a public licence
     * notice).
     *
     * @default 'none'
     */
    pointerEvents?: 'none' | 'auto'
}

/**
 * Slot signatures for `<OrigamWatermark>`.
 */
export interface IWatermarkSlots {
    /** Wrapped content rendered beneath the diagonal overlay. */
    default?: () => any
}

/**
 * Options accepted by `useWatermark`. Mirror the public props of
 * `<OrigamWatermark>` minus the wrapper concerns (`tag`, `class`,
 * `style`).
 */
export interface IUseWatermarkOptions {
    /** Same semantics as `IWatermarkProps.text`. */
    text?: string
    /** Same semantics as `IWatermarkProps.image`. */
    image?: string
    /** Same semantics as `IWatermarkProps.opacity`. */
    opacity?: number
    /** Same semantics as `IWatermarkProps.angle`. */
    angle?: number
    /** Same semantics as `IWatermarkProps.gap`. */
    gap?: number
    /** Same semantics as `IWatermarkProps.fontSize`. */
    fontSize?: number
    /** Same semantics as `IWatermarkProps.fontFamily`. */
    fontFamily?: string
    /** Same semantics as `IWatermarkProps.color`. */
    color?: string
    /** Same semantics as `IWatermarkProps.fontWeight`. */
    fontWeight?: number | string
    /** Same semantics as `IWatermarkProps.antiTamper`. */
    antiTamper?: boolean
    /** Same semantics as `IWatermarkProps.pointerEvents`. */
    pointerEvents?: 'none' | 'auto'
    /** Same semantics as `IWatermarkProps.zIndex`. */
    zIndex?: number
}
