import type {
    ICommonsComponentProps,
    IGradient,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type {
    TBlockquoteAlign,
    TTextMaskAnimation
} from '../../types'

/**
 * Props for `<OrigamTextMask>` — typographic "window" component.
 *
 * Paints arbitrary text (or rich slot content) as a transparent fill
 * over an animated background, leveraging `background-clip: text`. The
 * background can be:
 *
 *   - a structured {@link IGradient} object (intent-aware, theme-aware),
 *   - a raw CSS gradient string (`linear-gradient(...)`, `radial-gradient(...)`,
 *     `conic-gradient(...)`),
 *   - a preset name (`gradient-sunset`, `gradient-ocean`, …) resolved to
 *     `var(--origam-gradient---{slug})`,
 *   - an `url(...)` value pointing at an image, video poster or data-URL.
 *
 * The text content is preserved in the DOM (visible to screen readers
 * and search engines) — the visual transform is purely CSS.
 *
 * Typography is handled via the shared {@link ITypographyProps} surface:
 * pass token keys (`fontSize="5xl"`, `fontWeight="black"`, …) to override
 * the component's default values; when a prop is unset the SCSS fallback
 * token (`--origam-text-mask---font-size-default`, …) stays in control.
 */
export interface ITextMaskProps extends ICommonsComponentProps, ITagProps, ITypographyProps {
    /**
     * Text to mask. Ignored when the `default` slot is provided.
     *
     * Rich markup (e.g. multi-line headlines, inline `<span>` overrides)
     * should go through the slot instead.
     */
    text?: string
    /**
     * Background painted behind the text glyphs. REQUIRED.
     *
     * Accepts:
     *   - A structured {@link IGradient} object — resolved via
     *     `resolveGradient()` and emitted as a `linear|radial|conic-gradient`
     *     CSS function call. Stops can reference intents (`primary`,
     *     `success`, …) — the resolver swaps them for token-driven CSS
     *     variables, so the gradient re-tints automatically when the
     *     theme changes.
     *   - A raw CSS gradient string (`linear-gradient(...)`, …) — emitted
     *     verbatim.
     *   - A preset name (`gradient-sunset`, etc.) — resolves to the
     *     matching `--origam-gradient---{slug}` CSS variable.
     *   - Any other string — used as a raw `background-image` value
     *     (typical: `url(/hero.jpg)` for an image, `url(data:...)` for an
     *     inline asset).
     */
    background: string | IGradient
    /**
     * Animate the background. Combined with `animationType` to pick a
     * keyframe set.
     *
     * @default false
     */
    animated?: boolean
    /**
     * Duration of one animation cycle. Accepts any CSS `<time>` value
     * (`'3s'`, `'750ms'`, …). Forwarded to `animation-duration`.
     *
     * @default '3s'
     */
    animationDuration?: string
    /**
     * Animation strategy. See {@link TTextMaskAnimation}.
     *
     * @default 'pan'
     */
    animationType?: TTextMaskAnimation
    /**
     * `text-align` of the masked content.
     *
     * @default 'left'
     */
    align?: TBlockquoteAlign
}

/**
 * Slot signatures for `<OrigamTextMask>`. The `default` slot wins over
 * the `text` prop and accepts arbitrary markup (multiple lines, nested
 * `<h1>` / `<span>` / `<em>` …).
 */
export interface ITextMaskSlots {
    default?: () => any
}
