import {
    computed,
    type ComputedRef,
    getCurrentScope,
    isRef,
    type MaybeRefOrGetter,
    onScopeDispose,
    toValue
} from 'vue'

import {
    WATERMARK_DATA_ATTR,
    WATERMARK_DEFAULT_ANGLE_DEG,
    WATERMARK_DEFAULT_COLOR,
    WATERMARK_DEFAULT_FONT_FAMILY,
    WATERMARK_DEFAULT_FONT_SIZE_PX,
    WATERMARK_DEFAULT_FONT_WEIGHT,
    WATERMARK_DEFAULT_GAP_PX,
    WATERMARK_DEFAULT_OPACITY,
    WATERMARK_DEFAULT_POINTER_EVENTS,
    WATERMARK_DEFAULT_Z_INDEX
} from '../../consts/Watermark/watermark.const'

import type {
    IUseWatermarkOptions
} from '../../interfaces'

interface IResolvedOptions {
    text: string
    image: string
    opacity: number
    angle: number
    gap: number
    fontSize: number
    fontFamily: string
    color: string
    fontWeight: number | string
    pointerEvents: 'none' | 'auto'
    zIndex: number
}

/**
 * Escape the five XML metacharacters before embedding a user-controlled
 * value into a `data:image/svg+xml,…` URL. The watermark text is passed
 * verbatim by the consumer, so dropping it into a raw SVG without
 * escaping would let any consumer string break out of the
 * `<text>…</text>` body (and, in extreme cases, inject a `<script>`).
 */
function escapeXml (raw: string): string {
    return raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

/**
 * Build a `data:image/svg+xml,…` URL that paints a single rotated
 * glyph centred inside a `tile × tile` rectangle. The CSS
 * `background-repeat: repeat` rule on the consumer layer takes over
 * from there.
 *
 * The geometry is intentionally simple: the tile is square, the glyph
 * is centred on `(tile/2, tile/2)`, and the rotation pivots around the
 * same anchor. This makes the maths trivial and keeps the SVG payload
 * tiny — a few hundred bytes per pattern, well below any meaningful
 * data-URL limit.
 */
function buildPatternUrl (options: IResolvedOptions): string {
    const tile = options.gap + Math.max(options.fontSize, 1)
    const cx = tile / 2
    const cy = tile / 2
    const opacityAttr = `opacity="${options.opacity}"`

    let glyph: string
    if (options.image) {
        const safeHref = escapeXml(options.image)
        const imgSize = Math.max(options.fontSize, 16)
        glyph = `<image href="${safeHref}" x="${cx - imgSize / 2}" y="${cy - imgSize / 2}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid meet" ${opacityAttr}/>`
    } else {
        const safeText = escapeXml(options.text)
        const safeFamily = escapeXml(options.fontFamily)
        const safeColor = escapeXml(options.color)
        const safeWeight = escapeXml(String(options.fontWeight))
        glyph = (
            `<text x="${cx}" y="${cy}" ` +
            `text-anchor="middle" dominant-baseline="middle" ` +
            `fill="${safeColor}" ` +
            `font-size="${options.fontSize}" ` +
            `font-family="${safeFamily}" ` +
            `font-weight="${safeWeight}" ` +
            `${opacityAttr}>${safeText}</text>`
        )
    }

    const svg = (
        `<svg xmlns="http://www.w3.org/2000/svg" ` +
        `width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}">` +
        `<g transform="rotate(${options.angle} ${cx} ${cy})">${glyph}</g>` +
        `</svg>`
    )

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/**
 * Resolves a partial options bag into a fully-defaulted snapshot. The
 * resolution layer is the single point of truth for default values —
 * the component reads from the same getter so consumer omitted props
 * never have to be defaulted twice.
 */
function resolveOptions (raw: IUseWatermarkOptions | undefined): IResolvedOptions {
    const opts = raw ?? {}
    return {
        text: opts.text ?? '',
        image: opts.image ?? '',
        opacity: typeof opts.opacity === 'number' ? opts.opacity : WATERMARK_DEFAULT_OPACITY,
        angle: typeof opts.angle === 'number' ? opts.angle : WATERMARK_DEFAULT_ANGLE_DEG,
        gap: typeof opts.gap === 'number' ? opts.gap : WATERMARK_DEFAULT_GAP_PX,
        fontSize: typeof opts.fontSize === 'number' ? opts.fontSize : WATERMARK_DEFAULT_FONT_SIZE_PX,
        fontFamily: opts.fontFamily ?? WATERMARK_DEFAULT_FONT_FAMILY,
        color: opts.color ?? WATERMARK_DEFAULT_COLOR,
        fontWeight: opts.fontWeight ?? WATERMARK_DEFAULT_FONT_WEIGHT,
        pointerEvents: opts.pointerEvents ?? WATERMARK_DEFAULT_POINTER_EVENTS,
        zIndex: typeof opts.zIndex === 'number' ? opts.zIndex : WATERMARK_DEFAULT_Z_INDEX
    }
}

/**
 * Applies the resolved options as inline styles on the watermark layer.
 * Extracted so `install()` and the anti-tamper re-injection path share
 * the same styling code.
 */
function applyLayerStyles (layer: HTMLElement, options: IResolvedOptions, pattern: string): void {
    layer.style.position = 'absolute'
    layer.style.top = '0'
    layer.style.right = '0'
    layer.style.bottom = '0'
    layer.style.left = '0'
    layer.style.backgroundImage = pattern
    layer.style.backgroundRepeat = 'repeat'
    layer.style.pointerEvents = options.pointerEvents
    layer.style.zIndex = String(options.zIndex)
    layer.style.userSelect = 'none'
    layer.setAttribute('aria-hidden', 'true')
    layer.setAttribute(WATERMARK_DATA_ATTR, '')
}

/**
 * Headless watermark composable. Returns the data-URL pattern (for
 * consumers who want to bind it manually via `:style`) plus
 * `install()` / `uninstall()` helpers for programmatic use without
 * mounting `<OrigamWatermark>`.
 *
 * The composable is SSR-safe — pure-string SVG construction, no DOM
 * access. `install()` short-circuits when `document` is undefined.
 *
 * @example
 * ```ts
 * const { patternUrl, install, uninstall } = useWatermark({
 *     text: 'CONFIDENTIAL — john.doe@example.com',
 *     opacity: 0.08,
 *     angle: -30,
 *     gap: 120
 * })
 * onMounted(() => install(document.body))
 * onBeforeUnmount(() => uninstall())
 * ```
 */
export function useWatermark (
    options: MaybeRefOrGetter<IUseWatermarkOptions> = {}
): {
    patternUrl: ComputedRef<string>
    install: (target?: HTMLElement) => HTMLElement | null
    uninstall: () => void
} {
    const resolved: ComputedRef<IResolvedOptions> = computed(() => {
        const raw = isRef(options) || typeof options === 'function' ? toValue(options) : options
        return resolveOptions(raw)
    })

    const patternUrl: ComputedRef<string> = computed(() => buildPatternUrl(resolved.value))

    let layer: HTMLElement | null = null
    let host: HTMLElement | null = null
    let observer: MutationObserver | null = null
    let reinjectScheduled = false

    /**
     * Anti-tamper re-injection. Called from the MutationObserver
     * callback when our layer disappears or its inline style is
     * mutated. We rebuild the layer from scratch — cheaper than trying
     * to diff individual CSS properties, and immune to any creative
     * DOM-attribute tampering.
     */
    const reinject = () => {
        if (reinjectScheduled) return
        reinjectScheduled = true
        // Defer by one microtask so the DOM mutation that triggered us
        // settles before we touch the tree again — avoids ping-pong.
        Promise.resolve().then(() => {
            reinjectScheduled = false
            if (!host) return
            // If a previous layer is still attached but tampered with,
            // remove it before re-creating a clean one.
            if (layer && host.contains(layer)) {
                host.removeChild(layer)
            }
            layer = document.createElement('div')
            applyLayerStyles(layer, resolved.value, patternUrl.value)
            host.appendChild(layer)
        })
    }

    const ensureObserver = () => {
        if (observer || !host) return
        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    let removed = false
                    mutation.removedNodes.forEach((node) => {
                        if (node === layer) removed = true
                    })
                    if (removed) {
                        reinject()
                        return
                    }
                } else if (mutation.type === 'attributes' && mutation.target === layer) {
                    reinject()
                    return
                }
            }
        })
        observer.observe(host, {
            childList: true,
            attributes: true,
            attributeFilter: ['style', 'class', WATERMARK_DATA_ATTR],
            subtree: false
        })
    }

    const install = (target?: HTMLElement): HTMLElement | null => {
        if (typeof document === 'undefined') return null
        host = target ?? document.body
        if (!host) return null

        // Ensure the host is a positioning context — otherwise our
        // `position: absolute; inset: 0` layer escapes to the nearest
        // positioned ancestor and the pattern stretches unexpectedly.
        // `getComputedStyle` may return an empty string in jsdom for a
        // freshly-created element with no rules attached — treat that
        // case as equivalent to `static` (the CSS default).
        const computedPosition = getComputedStyle(host).position
        if (!computedPosition || computedPosition === 'static') {
            host.style.position = 'relative'
        }

        layer = document.createElement('div')
        applyLayerStyles(layer, resolved.value, patternUrl.value)
        host.appendChild(layer)

        if (resolved.value && (options as IUseWatermarkOptions)?.antiTamper) {
            ensureObserver()
        }

        return layer
    }

    const uninstall = (): void => {
        if (observer) {
            observer.disconnect()
            observer = null
        }
        if (layer && host && host.contains(layer)) {
            host.removeChild(layer)
        }
        layer = null
        host = null
    }

    if (getCurrentScope()) {
        onScopeDispose(uninstall)
    }

    return {
        patternUrl,
        install,
        uninstall
    }
}
