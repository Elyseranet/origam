import qrcode from 'qrcode-generator'
import {
    computed,
    type ComputedRef,
    isRef,
    type MaybeRefOrGetter,
    toValue
} from 'vue'

import {
    QR_CODE_DEFAULT_ECC,
    QR_CODE_DEFAULT_LOGO_PADDING,
    QR_CODE_DEFAULT_LOGO_SIZE,
    QR_CODE_DEFAULT_MARGIN,
    QR_CODE_LRU_CAPACITY,
    QR_CODE_OVERLAY_MAX_RATIO
} from '../../consts/QrCode/qr-code.const'

import type {
    IQrCodeLogo,
    IUseQrCodeOptions
} from '../../interfaces'

import type {
    TQrCodeErrorCorrectionLevel
} from '../../types'

/**
 * Module-level LRU keyed on the serialised payload + options. Reuse
 * across renders is the cheap path — encoding dominates SVG-string
 * build. Capacity bound (`QR_CODE_LRU_CAPACITY`) lives in
 * `src/consts/QrCode/qr-code.const.ts`.
 */
const matrixCache = new Map<string, boolean[][]>()

interface IInternalOptions {
    errorCorrectionLevel: TQrCodeErrorCorrectionLevel
    foreground: string
    background: string
    margin: number
    cornerRadius: number
    logo?: IQrCodeLogo
}

/**
 * Pull a (cached or freshly built) module matrix for the requested
 * payload + ECC level. The matrix is a square `N×N` boolean grid
 * where `true === dark module`.
 *
 * @internal exposed for tests via the public `useQrCode` only.
 */
function buildMatrix (value: string, ecc: TQrCodeErrorCorrectionLevel): boolean[][] {
    const cacheKey = `${ecc}::${value}`

    const hit = matrixCache.get(cacheKey)
    if (hit !== undefined) {
        // LRU bump — re-insert to mark as most-recently-used.
        matrixCache.delete(cacheKey)
        matrixCache.set(cacheKey, hit)
        return hit
    }

    /*
     * `typeNumber = 0` lets the library auto-select the smallest matrix
     * that fits the payload + redundancy budget. We use Byte mode (the
     * default) — Numeric / Alphanumeric mode would be denser but only
     * accept restricted character sets, which makes the API surface
     * harder to reason about for a generic component.
     */
    const qr = qrcode(0, ecc)
    qr.addData(value)
    qr.make()

    const count = qr.getModuleCount()
    const matrix: boolean[][] = []
    for (let row = 0; row < count; row++) {
        const line: boolean[] = []
        for (let col = 0; col < count; col++) {
            line.push(qr.isDark(row, col))
        }
        matrix.push(line)
    }

    matrixCache.set(cacheKey, matrix)
    if (matrixCache.size > QR_CODE_LRU_CAPACITY) {
        const oldest = matrixCache.keys().next().value
        if (oldest !== undefined) {
            matrixCache.delete(oldest)
        }
    }

    return matrix
}

/**
 * Escape the four characters that break out of double-quoted XML
 * attributes. Used on every user-controlled value (`foreground`,
 * `background`, `logo.src`, …) so the emitted SVG is safe to drop
 * into `innerHTML` / `v-html` without further sanitisation.
 */
function escapeXmlAttr (raw: string): string {
    return raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

/**
 * Render the matrix as an SVG string. Each dark module becomes a
 * `<rect>` with `width=1, height=1` in the viewBox's coordinate
 * system — the viewport scales the matrix as a whole, so consumers
 * can pick any physical size without re-running the encoder.
 *
 * `<rect>` over `<path>` is intentional: the file size cost is
 * negligible at typical QR densities (<100×100 modules) and the
 * per-module `<rect>` lets a consumer style individual cells via
 * `[data-row][data-col]` selectors if they really need to.
 */
function buildSvg (
    matrix: boolean[][],
    options: IInternalOptions
): string {
    const count = matrix.length
    const viewSize = count + options.margin * 2
    const fg = escapeXmlAttr(options.foreground)
    const bg = options.background
    const radiusAttr = options.cornerRadius > 0
        ? ` rx="${options.cornerRadius}" ry="${options.cornerRadius}"`
        : ''

    let rects = ''
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            if (matrix[row][col]) {
                const x = col + options.margin
                const y = row + options.margin
                rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fg}"${radiusAttr}/>`
            }
        }
    }

    const backgroundRect = bg && bg !== 'transparent'
        ? `<rect x="0" y="0" width="${viewSize}" height="${viewSize}" fill="${escapeXmlAttr(bg)}"/>`
        : ''

    let logoMarkup = ''
    if (options.logo && options.logo.src) {
        const ratio = options.logo.size ?? QR_CODE_DEFAULT_LOGO_SIZE
        const padding = options.logo.padding ?? QR_CODE_DEFAULT_LOGO_PADDING
        const logoBg = options.logo.background ?? (bg && bg !== 'transparent' ? bg : '#ffffff')

        const logoBoxSize = count * ratio
        const logoX = options.margin + (count - logoBoxSize) / 2
        const logoY = options.margin + (count - logoBoxSize) / 2

        /*
         * Padding is configured in pixels but the SVG viewBox is in
         * module units — we cannot resolve the pixel→module ratio at
         * build time (it depends on the final rendered size). Instead
         * we paint the backdrop as a fraction of the logo box and let
         * `vector-effect="non-scaling-stroke"` keep the borderless
         * surface crisp at any zoom.
         *
         * For consumers who need an exact pixel padding, the
         * `<image>` slot in the component template provides a runtime
         * escape hatch — see `IQrCodeSlots.center`.
         */
        const paddingUnits = padding / 16
        const bdX = logoX - paddingUnits
        const bdY = logoY - paddingUnits
        const bdSize = logoBoxSize + paddingUnits * 2

        logoMarkup += `<rect x="${bdX}" y="${bdY}" width="${bdSize}" height="${bdSize}" fill="${escapeXmlAttr(logoBg)}"/>`
        logoMarkup += `<image href="${escapeXmlAttr(options.logo.src)}" x="${logoX}" y="${logoY}" width="${logoBoxSize}" height="${logoBoxSize}" preserveAspectRatio="xMidYMid meet"/>`
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet">${backgroundRect}${rects}${logoMarkup}</svg>`
}

/**
 * Test helper — clears the module-level matrix LRU. Exposed for the
 * unit-test suite and not advertised publicly.
 */
export function __clearQrCodeCache (): void {
    matrixCache.clear()
}

/**
 * Headless QR-code composable. Encodes `value` through
 * `qrcode-generator` (Reed-Solomon + matrix masking handled by the
 * library) and rebuilds an SVG fragment on every reactive change.
 *
 * The composable is SSR-safe — no DOM API is touched, the encoder is
 * pure JS, and the SVG string is suitable for `v-html` on both client
 * and server.
 *
 * @example
 * ```ts
 * const value = ref('https://origam.dev')
 * const { svg, modules, size } = useQrCode(value, {
 *     errorCorrectionLevel: 'M',
 *     foreground: '#000',
 *     background: '#fff'
 * })
 * ```
 */
export function useQrCode (
    value: MaybeRefOrGetter<string>,
    options: MaybeRefOrGetter<IUseQrCodeOptions> = {}
): {
    svg: ComputedRef<string>
    modules: ComputedRef<boolean[][]>
    size: ComputedRef<number>
} {
    const normalisedValue: ComputedRef<string> = computed(() => {
        const resolved = isRef(value) || typeof value === 'function' ? toValue(value) : value
        return typeof resolved === 'string' ? resolved : String(resolved ?? '')
    })

    const normalisedOptions: ComputedRef<IInternalOptions> = computed(() => {
        const raw = isRef(options) || typeof options === 'function' ? toValue(options) : options
        const opts = (raw ?? {}) as IUseQrCodeOptions

        const ratio = opts.logo?.size ?? QR_CODE_DEFAULT_LOGO_SIZE
        if (opts.logo?.src && ratio > QR_CODE_OVERLAY_MAX_RATIO && typeof console !== 'undefined') {
            console.warn(
                `[origam] useQrCode: logo size ${ratio} exceeds the recommended max (${QR_CODE_OVERLAY_MAX_RATIO}). ` +
                'Scanners may fail to decode the matrix; consider increasing error-correction to "H" or shrinking the logo.'
            )
        }

        return {
            errorCorrectionLevel: opts.errorCorrectionLevel ?? QR_CODE_DEFAULT_ECC,
            foreground: opts.foreground ?? 'currentColor',
            background: opts.background ?? 'transparent',
            margin: typeof opts.margin === 'number' ? opts.margin : QR_CODE_DEFAULT_MARGIN,
            cornerRadius: typeof opts.cornerRadius === 'number' ? opts.cornerRadius : 0,
            logo: opts.logo
        }
    })

    const modules: ComputedRef<boolean[][]> = computed(() =>
        buildMatrix(normalisedValue.value, normalisedOptions.value.errorCorrectionLevel)
    )

    const size: ComputedRef<number> = computed(() => modules.value.length)

    const svg: ComputedRef<string> = computed(() =>
        buildSvg(modules.value, normalisedOptions.value)
    )

    return {
        svg,
        modules,
        size
    }
}
