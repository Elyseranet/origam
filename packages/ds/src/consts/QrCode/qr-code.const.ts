import { QR_CODE_ERROR_CORRECTION_LEVEL } from '../../enums'
import type { TQrCodeErrorCorrectionLevel } from '../../types/QrCode/qr-code.type'

/*********************************************************
 * QR_CODE_DEFAULT_ECC
 *
 * @description
 * Default error-correction redundancy budget (~15%). Good balance
 * between matrix density and damage tolerance for clean digital /
 * print mediums without a logo overlay.
 ********************************************************/
export const QR_CODE_DEFAULT_ECC: TQrCodeErrorCorrectionLevel = QR_CODE_ERROR_CORRECTION_LEVEL.M

/*********************************************************
 * QR_CODE_DEFAULT_MARGIN
 *
 * @description
 * ISO/IEC 18004-recommended quiet zone (in modules) surrounding the
 * QR matrix. Smaller values significantly hurt scanner reliability.
 ********************************************************/
export const QR_CODE_DEFAULT_MARGIN = 4

/*********************************************************
 * QR_CODE_OVERLAY_MAX_RATIO
 *
 * @description
 * Maximum sensible overlay size. Above ~30% even `errorCorrectionLevel
 * 'H'` cannot reconstruct the obscured codewords — the scan starts to
 * fail. The composable warns (instead of clamping) so the consumer
 * keeps control over the artistic decision.
 ********************************************************/
export const QR_CODE_OVERLAY_MAX_RATIO = 0.3

/*********************************************************
 * QR_CODE_DEFAULT_LOGO_SIZE / QR_CODE_DEFAULT_LOGO_PADDING
 *
 * @description
 * Default logo overlay sizing — 20% of the QR width, 6 px of padding.
 ********************************************************/
export const QR_CODE_DEFAULT_LOGO_SIZE = 0.2
export const QR_CODE_DEFAULT_LOGO_PADDING = 6

/*********************************************************
 * QR_CODE_DEFAULT_FOREGROUND / QR_CODE_DEFAULT_BACKGROUND
 *
 * @description
 * Default module / quiet-zone paint. `currentColor` lets the matrix
 * inherit the surrounding text colour (so it follows the theme without
 * a token lookup), and a transparent quiet zone lets the host surface
 * show through instead of punching a white rectangle into a dark theme.
 ********************************************************/
export const QR_CODE_DEFAULT_FOREGROUND = 'currentColor'
export const QR_CODE_DEFAULT_BACKGROUND = 'transparent'

/*********************************************************
 * QR_CODE_DEFAULT_CORNER_RADIUS
 *
 * @description
 * Square modules by default — `rx`/`ry` are omitted entirely at 0 so
 * the emitted SVG stays as small as possible.
 ********************************************************/
export const QR_CODE_DEFAULT_CORNER_RADIUS = 0

/*********************************************************
 * QR_CODE_DEFAULT_LOGO_BACKGROUND
 *
 * @description
 * Backdrop painted behind a logo overlay when neither `logo.background`
 * nor a solid `background` is supplied. Scanners need an opaque plate
 * under the overlay to keep the surrounding modules readable, so this
 * one cannot be a theme token: the value is embedded verbatim in the
 * generated SVG string, where `var(--origam-…)` would resolve against
 * whatever host the markup lands in — including none at all when the
 * SVG is exported or downloaded.
 ********************************************************/
export const QR_CODE_DEFAULT_LOGO_BACKGROUND = '#ffffff'

/*********************************************************
 * QR_CODE_LOGO_PADDING_PX_PER_MODULE
 *
 * @description
 * Pixels per module assumed when converting `logo.padding` (expressed
 * in px by the consumer) into the module units of the SVG viewBox. The
 * true ratio depends on the final rendered size, which is unknown at
 * build time — see the note in `buildSvg`.
 ********************************************************/
export const QR_CODE_LOGO_PADDING_PX_PER_MODULE = 16

/*********************************************************
 * QR_CODE_LRU_CAPACITY
 *
 * @description
 * Module-level LRU keyed on the serialised payload + options.
 *
 * @description
 * Reusing the matrix across renders is the cheap path — encoding cost
 * dominates the SVG-string build. Sixteen entries is enough for a
 * realistic storybook (one or two values × four ECC levels × small
 * tweaks).
 ********************************************************/
export const QR_CODE_LRU_CAPACITY = 16
