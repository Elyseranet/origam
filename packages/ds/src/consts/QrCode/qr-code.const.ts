import type { TQrCodeErrorCorrectionLevel } from '../../types'

/**
 * Default error-correction redundancy budget (~15%). Good balance
 * between matrix density and damage tolerance for clean digital /
 * print mediums without a logo overlay.
 */
export const QR_CODE_DEFAULT_ECC: TQrCodeErrorCorrectionLevel = 'M'

/**
 * ISO/IEC 18004-recommended quiet zone (in modules) surrounding the
 * QR matrix. Smaller values significantly hurt scanner reliability.
 */
export const QR_CODE_DEFAULT_MARGIN = 4

/**
 * Maximum sensible overlay size. Above ~30% even `errorCorrectionLevel
 * 'H'` cannot reconstruct the obscured codewords — the scan starts to
 * fail. The composable warns (instead of clamping) so the consumer
 * keeps control over the artistic decision.
 */
export const QR_CODE_OVERLAY_MAX_RATIO = 0.3

/**
 * Default logo overlay sizing — 20% of the QR width, 6 px of padding.
 */
export const QR_CODE_DEFAULT_LOGO_SIZE = 0.2
export const QR_CODE_DEFAULT_LOGO_PADDING = 6

/**
 * Module-level LRU keyed on the serialised payload + options.
 *
 * Reusing the matrix across renders is the cheap path — encoding cost
 * dominates the SVG-string build. Sixteen entries is enough for a
 * realistic storybook (one or two values × four ECC levels × small
 * tweaks).
 */
export const QR_CODE_LRU_CAPACITY = 16
