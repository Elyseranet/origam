/**
 * QR Code error-correction level (Reed-Solomon redundancy budget).
 * The higher the level, the more of the matrix is reserved for
 * correction codewords — which means:
 *
 *   - more dense / larger matrices for the same payload
 *   - more tolerance for damage, occlusion, or a logo overlay
 *
 * The four levels are defined by ISO/IEC 18004:
 *
 * | Level | Recovery | Use case                                                  |
 * |-------|----------|-----------------------------------------------------------|
 * | `L`   | ~7%      | Clean printing surface, no overlay, dense data.           |
 * | `M`   | ~15%     | Default — good balance for digital / print without logo.  |
 * | `Q`   | ~25%     | Mild damage / dirt / scuff risk, small logo overlay.      |
 * | `H`   | ~30%     | Marketing-style codes with centred logo (up to ~25–30%).  |
 *
 * A logo overlay obscures payload bits — pick `Q` for ≤20% logo, `H`
 * for ≥20%. Below `Q`, the redundancy budget is too thin for any
 * meaningful overlay.
 */
export type TQrCodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
