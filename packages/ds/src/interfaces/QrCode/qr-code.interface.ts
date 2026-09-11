import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps,
    ISrcObject,
    ITagProps
} from '../../interfaces'

import type {
    TIcon,
    TQrCodeErrorCorrectionLevel
} from '../../types'

/**
 * Per-matrix overrides — applied INSIDE the SVG (modules + quiet
 * zone) independently of the wrapper-level same-name props. Pass via
 * the `qrCodeProps` slot on `<OrigamQrCode>`:
 *
 *   - `qrCodeProps.color`   → modules colour (overrides the wrapper
 *                             `color` for the matrix paint only).
 *   - `qrCodeProps.bgColor` → fill of the SVG's quiet-zone rect.
 *   - `qrCodeProps.rounded` → per-module corner radius (mapped to
 *                             [0, 0.5] module units via
 *                             `resolveQrCornerRadius`).
 *
 * The DS-shape values (intents, hex, `currentColor`, named rungs)
 * are transformed by `resolveQrColor` / `resolveQrCornerRadius` in
 * `src/utils/QrCode/qr-code-adapters.util.ts` — consumers always pass
 * canonical DS values, the component handles the SVG-side translation.
 */
export interface IQrCodeOptions extends IRoundedProps, IBgColorProps, IColorProps {}

/**
 * Props for `<OrigamQrCode>` — SVG QR code renderer.
 *
 * The component owns no state: every prop change rebuilds the
 * underlying matrix through `qrcode-generator` and re-emits the SVG.
 * The renderer is SSR-safe — no `window` / `document` / `canvas` API
 * is touched.
 *
 * DS transverse props (all applied to the WRAPPER element, the
 * standard chrome you get on every Origam component):
 *
 *   - `color`     (`IColorProps`)     — wrapper `color:` (text colour).
 *                                       The SVG modules inherit this via
 *                                       `fill="currentColor"` unless
 *                                       `qrCodeProps.color` overrides.
 *   - `bgColor`   (`IBgColorProps`)   — wrapper `background-color:`.
 *   - `rounded`   (`IRoundedProps`)   — wrapper `border-radius`.
 *   - `border`    (`IBorderProps`)    — wrapper `border`.
 *   - `size`      (`ISizeProps`)      — wrapper width/height.
 *   - `padding`   (`IPaddingProps`)   — wrapper inner spacing.
 *   - `margin`    (`IMarginProps`)    — wrapper outer spacing.
 *   - `elevation` (`IElevationProps`) — wrapper `box-shadow`.
 *
 * QR-internal props (apply to the SVG itself, NOT the wrapper):
 *
 *   - `qrCodeProps.color` / `.bgColor` / `.rounded` — see
 *     `IQrCodeOptions` above for the full mapping.
 */
export interface IQrCodeProps
    extends ICommonsComponentProps,
        ITagProps,
        IColorProps,
        IBgColorProps,
        IRoundedProps,
        IBorderProps,
        IElevationProps,
        ISizeProps,
        IPaddingProps,
        IMarginProps {
    /**
     * Text or URL encoded into the QR matrix. UTF-8 is supported via
     * the underlying `qrcode-generator` Byte mode.
     */
    value: string
    /**
     * Optional heading rendered above the QR matrix inside the
     * wrapper. Useful when the QR is presented alongside meta
     * (campaign name, recipient, …) — no manual extra markup needed.
     */
    title?: string
    /**
     * Per-matrix overrides — see `IQrCodeOptions`. When omitted, the
     * SVG inherits the wrapper-level `color` / `bgColor` / and
     * defaults to square modules.
     */
    qrCodeProps?: IQrCodeOptions
    /**
     * Reed-Solomon redundancy level. Higher levels reserve more matrix
     * cells for correction codewords (and therefore tolerate more
     * damage / overlay). See `TQrCodeErrorCorrectionLevel` for the
     * tradeoff matrix.
     *
     * @default 'M'
     */
    errorCorrectionLevel?: TQrCodeErrorCorrectionLevel
    /**
     * Number of modules reserved as quiet-zone padding around the
     * matrix. The ISO spec mandates ≥4 — anything smaller risks
     * scanner failures, anything larger is purely aesthetic.
     *
     * @default 4
     */
    quietZone?: number
    /**
     * Optional centred icon overlay — rendered via `<OrigamIcon>` on
     * top of the matrix. Coexists with `image`; the `#center` slot
     * overrides both when provided.
     */
    icon?: TIcon
    /**
     * Optional centred image overlay. Accepts a raw URL (string) or
     * the standard `ISrcObject` shape (src / srcset / lazySrc /
     * aspectRatio / alt). Rendered as an `<OrigamAvatar>` overlay.
     */
    image?: string | ISrcObject
    /**
     * Accessible label used as `aria-label`. When omitted, the
     * component falls back to `"QR code for {value}"`.
     */
    ariaLabel?: string
}

/**
 * Options accepted by `useQrCode`. Lower-level than `IQrCodeProps`:
 * the composable does not speak the canonical DS contracts. It only
 * owns the raw SVG string — the wrapper component is responsible for
 * mapping `color` / `bgColor` / `rounded` (wrapper or qrCodeProps)
 * down to the primitive `foreground` / `background` / `cornerRadius`
 * keys here.
 */
export interface IUseQrCodeOptions {
    /** Reed-Solomon level — same semantics as `IQrCodeProps`. */
    errorCorrectionLevel?: TQrCodeErrorCorrectionLevel
    /** Raw CSS colour painted on dark modules. */
    foreground?: string
    /** Raw CSS colour painted behind the matrix (quiet zone). */
    background?: string
    /** Quiet-zone padding in module units. */
    margin?: number
    /**
     * Per-module corner radius in module units (0 → square,
     * 0.5 → circle). The component layer derives this from the
     * public `qrCodeProps.rounded` prop via `resolveQrCornerRadius`.
     */
    cornerRadius?: number
    /**
     * Optional logo overlay rendered inside the SVG via `<image>`.
     * Public consumers should use the `image` prop on
     * `<OrigamQrCode>`; this lower-level shape stays here for direct
     * `useQrCode` consumers.
     */
    logo?: {
        src: string
        size?: number
        padding?: number
        background?: string
    }
}

/**
 * Slot signatures for `<OrigamQrCode>`.
 *
 * - `center` — replaces the default `icon` / `image` overlay.
 *   Receives the resolved size of the central reserved square (in
 *   matrix module units) so the consumer can paint a custom SVG /
 *   icon without re-deriving the geometry. When this slot is
 *   provided, both `icon` and `image` props are ignored.
 */
export interface IQrCodeSlots {
    center?: (bindings: { size: number }) => any
}
