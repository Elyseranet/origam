import type { Directive, DirectiveBinding } from 'vue'

import type { IContrastOptions } from '../../interfaces'

/**
 * Module-level contrast config, set once by `createOrigam({ contrast })`.
 * The directive reads it synchronously (directives run outside `setup`, so
 * they can't `inject`). Defaults to enabled at the WCAG AA 4.5:1 ratio.
 */
let config: Required<IContrastOptions> = {
    enabled: true,
    threshold: 4.5
}

export function setContrastConfig (value: boolean | IContrastOptions | undefined): void {
    if (value === undefined) return
    if (typeof value === 'boolean') {
        config = { enabled: value, threshold: config.threshold }
        return
    }
    config = {
        enabled: value.enabled ?? true,
        threshold: value.threshold ?? 4.5
    }
}

let normCtx: CanvasRenderingContext2D | null | undefined

/**
 * Convert the modern `color(srgb r g b [/ a])` function (0–1 channels) to a
 * legacy `rgb()/rgba()` string. Chromium keeps `color(srgb …)` verbatim even
 * through a canvas round-trip, and `getContrast`/`parseColor` can't read it —
 * design tokens resolve to exactly this form in several themes.
 */
function srgbToRgb (color: string): string | null {
    const m = color.match(/color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i)
    if (!m) return null
    const ch = (v: string) => Math.round(Math.min(1, Math.max(0, parseFloat(v))) * 255)
    const r = ch(m[1]), g = ch(m[2]), b = ch(m[3])
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`
}

/**
 * Normalise any CSS colour string — `color(srgb …)`, `color-mix(…)`, named
 * colours, hsl(), etc. — to a plain `rgb()/#hex` the WCAG maths can parse.
 */
function toRgb (color: string | null | undefined): string | null {
    if (!color) return null

    const direct = srgbToRgb(color)
    if (direct) return direct

    if (typeof document === 'undefined') return color
    if (normCtx === undefined) normCtx = document.createElement('canvas').getContext('2d')
    if (!normCtx) return color

    // Canvas resolves named / hsl / color-mix; it may still emit color(srgb …)
    // for wide-gamut inputs, so feed the result back through srgbToRgb.
    normCtx.fillStyle = '#000'
    normCtx.fillStyle = color
    const onBlack = normCtx.fillStyle
    normCtx.fillStyle = '#fff'
    normCtx.fillStyle = color
    const onWhite = normCtx.fillStyle

    if (onBlack !== onWhite) return null
    return srgbToRgb(onBlack) ?? onBlack
}

type TRgba = { r: number; g: number; b: number; a: number }

function rgbaParts (rgb: string | null): TRgba | null {
    if (!rgb) return null
    const m = rgb.match(/rgba?\(([^)]+)\)/i)
    if (!m) return null
    const p = m[1].split(',').map(s => parseFloat(s.trim()))
    if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) return null
    return { r: p[0], g: p[1], b: p[2], a: p[3] == null || Number.isNaN(p[3]) ? 1 : p[3] }
}

/** Alpha-composite `top` over an opaque `bottom` (source-over). */
function over (top: TRgba, bottom: TRgba): TRgba {
    const a = top.a
    return {
        r: top.r * a + bottom.r * (1 - a),
        g: top.g * a + bottom.g * (1 - a),
        b: top.b * a + bottom.b * (1 - a),
        a: 1
    }
}

/**
 * Resolve the EFFECTIVE background a text element sits on. Walks up
 * collecting every painted layer (skipping fully transparent ones) until
 * it reaches an opaque base, then alpha-composites the translucent layers
 * back down. This makes a translucent state tint (e.g. a hover / selected
 * overlay at 8 % alpha) measure against the real surface beneath it instead
 * of being mistaken for an opaque colour — the bug that forced white text
 * onto a light fill. Returns a normalised opaque rgb string.
 */
function resolvePaintedBackground (el: HTMLElement): string | null {
    const layers: TRgba[] = []
    let node: HTMLElement | null = el

    while (node) {
        const parts = rgbaParts(toRgb(getComputedStyle(node).backgroundColor))
        if (parts && parts.a > 0) {
            layers.push(parts)
            if (parts.a >= 1) break
        }
        node = node.parentElement
    }

    if (!layers.length) return null

    const deepest = layers[layers.length - 1]
    let acc: TRgba = deepest.a >= 1 ? layers.pop()! : { r: 255, g: 255, b: 255, a: 1 }

    for (let i = layers.length - 1; i >= 0; i -= 1) {
        acc = over(layers[i], acc)
    }

    return `rgb(${Math.round(acc.r)}, ${Math.round(acc.g)}, ${Math.round(acc.b)})`
}

function channelsOf (rgb: string | null): [number, number, number] | null {
    if (!rgb) return null
    const p = (rgb.match(/[\d.]+/g) ?? []).map(Number)
    return p.length >= 3 && p.slice(0, 3).every(n => !Number.isNaN(n)) ? [p[0], p[1], p[2]] : null
}

/**
 * Gamma-corrected sRGB relative luminance (WCAG 2.x). The project's
 * `getLuma` is APCA-flavoured and over-rates mid-tones, which made the
 * directive force WHITE onto light intents (danger / warning / success)
 * where it still failed AA — so the maths lives here, exact to the spec.
 */
function relativeLuminance ([r, g, b]: [number, number, number]): number {
    const channel = (c: number): number => {
        const s = c / 255

        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function wcagRatio (a: [number, number, number], b: [number, number, number]): number {
    const la = relativeLuminance(a)
    const lb = relativeLuminance(b)

    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const WHITE: [number, number, number] = [255, 255, 255]
const BLACK: [number, number, number] = [0, 0, 0]

function enforceContrast (el: HTMLElement, enabled: boolean): void {
    // The directive's own per-binding override flag prevents the `updated`
    // hook from re-processing the colour we just forced.
    delete el.dataset.origamContrastFixed

    if (!enabled || typeof window === 'undefined') return

    // The consumer EXPLICITLY chose a foreground colour (`color="danger"`,
    // etc.) — respect it. Auto-contrast must never override an intentional
    // colour, only fix legibility when no colour was asked for. Components
    // with a controllable `color` prop set `data-origam-color-locked` when it
    // is provided.
    if (el.dataset.origamColorLocked === 'true') return

    // NOTE: we do NOT clear our previous override here. Vue re-applies the
    // consumer's colour via `el.style.color = …` on every patch (which strips
    // our `!important`), so by the time this runs in rAF the element already
    // reflects the real, current colour — we just re-measure and re-fix.

    const bg = channelsOf(resolvePaintedBackground(el))
    if (!bg) return

    const fg = channelsOf(toRgb(getComputedStyle(el).color))
    if (!fg) return

    const ratio = wcagRatio(fg, bg)
    if (ratio >= config.threshold) return

    // Force the black / white that maximises the WCAG ratio against the
    // surface — white only wins on dark fills, black wins on light ones.
    const better = wcagRatio(WHITE, bg) >= wcagRatio(BLACK, bg) ? '#fff' : '#000'
    el.style.setProperty('color', better, 'important')
    el.dataset.origamContrastFixed = 'true'


    console.warn(
        `[origam] Low text contrast (${ratio.toFixed(2)}:1 < ${config.threshold}:1): ` +
        `text rgb(${fg.join(', ')}) on background rgb(${bg.join(', ')}). ` +
        `Overriding text colour to ${better} for legibility. ` +
        `Disable with createOrigam({ contrast: false }).`,
        el
    )
}

/**
 * `v-contrast` — guards an element's text legibility at runtime.
 *
 * After the browser has resolved the design-token CSS variables, it measures
 * the element's text colour against its painted background. When the WCAG
 * ratio falls below the configured threshold it forces the better of
 * black / white text and logs a one-line warning explaining the swap. Toggle
 * globally via `createOrigam({ contrast: false })`, or per-element with
 * `v-contrast="false"`.
 */
/*
 * Measure twice: once on the next animation frame (covers the common
 * case where colour / background apply instantly), and once after a
 * short settle delay. The second pass is essential — components animate
 * their surface (`transition: background-color …`), so an rAF-only read
 * sees the mid-transition frame, measures a transient high contrast and
 * wrongly bails, leaving the settled (low-contrast) state unfixed. The
 * delay clears any typical token transition (≤ 200 ms).
 */
const SETTLE_MS = 250

function schedule (el: HTMLElement, enabled: boolean): void {
    if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => enforceContrast(el, enabled))
    }
    if (typeof setTimeout !== 'undefined') {
        setTimeout(() => enforceContrast(el, enabled), SETTLE_MS)
    }
}

const vContrast: Directive<HTMLElement, boolean | undefined> = {
    mounted (el: HTMLElement, binding: DirectiveBinding<boolean | undefined>) {
        schedule(el, config.enabled && binding.value !== false)
    },
    updated (el: HTMLElement, binding: DirectiveBinding<boolean | undefined>) {
        schedule(el, config.enabled && binding.value !== false)
    }
}

export default vContrast
