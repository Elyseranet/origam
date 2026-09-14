/**
 * QR Code error-correction level (Reed-Solomon redundancy budget),
 * as defined by ISO/IEC 18004. See `TQrCodeErrorCorrectionLevel` for
 * the recovery-rate / use-case table.
 */
export enum QR_CODE_ERROR_CORRECTION_LEVEL {
    L = 'L',
    M = 'M',
    Q = 'Q',
    H = 'H'
}
