import type { Directive, DirectiveBinding } from 'vue'

import type { IContrastOptions, IContrastScheduled } from '../../interfaces/Commons/commons.interface'

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

/*********************************************************
 * hexToRgb
 *
 * @description
 * Convert a `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` hex string to
 * `rgb()/rgba()`. Chromium's canvas `fillStyle` GETTER re-serialises any
 * OPAQUE colour it is fed to `#rrggbb` — this is the counterpart to
 * `srgbToRgb` that turns that hex back into a form `channelsOf`/`rgbaParts`
 * (which only understand `rgba?\(…\)`) can read. See #869.
 ********************************************************/
function hexToRgb (hex: string): string | null {
    const m = hex.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
    if (!m) return null
    const h = m[1].length <= 4 ? [...m[1]].map(c => c + c).join('') : m[1]
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    if (h.length === 8) {
        const a = parseInt(h.slice(6, 8), 16) / 255
        return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`
    }
    return `rgb(${r}, ${g}, ${b})`
}

/*********************************************************
 * toRgb
 *
 * @description
 * Normalise any CSS colour string — `color(srgb …)`, `color-mix(…)`, named
 * colours, hsl(), etc. — to a plain `rgb()/rgba()` string the WCAG maths
 * (`rgbaParts`, `channelsOf`) can parse. NEVER returns hex: see #869.
 ********************************************************/
function toRgb (color: string | null | undefined): string | null {
    if (!color) return null

    const direct = srgbToRgb(color)
    if (direct) return direct

    /*********************************************************
     * Skip the canvas round-trip when already exploitable (#869)
     *
     * @description
     * `getComputedStyle` already resolves the vast majority of colours to
     * `rgb()/rgba()` — the form every call site here needs. Chromium's
     * `fillStyle` GETTER re-serialises any OPAQUE colour to `#rrggbb`, which
     * turned an already exploitable value into a dead one for no reason.
     * This was the FIRST of two independent ruptures that made
     * `v-contrast` silently inert whenever fg AND bg were both opaque —
     * the DS's default look on every one of the 30 components wiring it.
     ********************************************************/
    if (/^rgba?\(/i.test(color)) return color

    if (typeof document === 'undefined') return color
    if (normCtx === undefined) normCtx = document.createElement('canvas').getContext('2d')
    if (!normCtx) return color

    /*********************************************************
     * Canvas fallback (named colours, hsl(), color-mix(), …)
     *
     * @description
     * Canvas resolves named / hsl / color-mix; it may still emit
     * `color(srgb …)` for wide-gamut inputs, so feed the result back
     * through `srgbToRgb`. It also re-serialises any OPAQUE result to hex,
     * so feed that through `hexToRgb` too (#869 — the SECOND rupture:
     * `channelsOf`'s digit-only regex cannot read hex). Only a shape
     * neither recognises falls through as-is.
     ********************************************************/
    normCtx.fillStyle = '#000'
    normCtx.fillStyle = color
    const onBlack = normCtx.fillStyle
    normCtx.fillStyle = '#fff'
    normCtx.fillStyle = color
    const onWhite = normCtx.fillStyle

    if (onBlack !== onWhite) return null
    return srgbToRgb(onBlack) ?? hexToRgb(onBlack) ?? onBlack
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


    /*********************************************************
     * Dev-only diagnostic (#1092)
     *
     * @description
     * The CORRECTION above stays active in production. The log is for the
     * developer who should fix the token pair; a visitor gains nothing from it
     * and it filled the console of every production page.
     *
     * @description
     * The DEV flag is statically replaced by the consumer's bundler, so the
     * whole branch (message included) is dropped from a production build.
     ********************************************************/
    if (import.meta.env?.DEV) {
        console.warn(
            `[origam] Low text contrast (${ratio.toFixed(2)}:1 < ${config.threshold}:1): ` +
            `text rgb(${fg.join(', ')}) on background rgb(${bg.join(', ')}). ` +
            `Overriding text colour to ${better} for legibility. ` +
            `Disable with createOrigam({ contrast: false }).`,
            el
        )
    }
}

/*********************************************************
 * schedule — ONE measure, taken once the surface has stopped moving
 *
 * @description
 * Components animate their surface (`transition: background-color …`), so a
 * read taken while a transition runs sees a transient colour: it either bails
 * on a transient high contrast (the settled low-contrast state is then never
 * fixed) or "fixes" a transient low one. The previous implementation measured
 * twice, on the next frame and after a fixed 250 ms. 250 ms is not a property
 * of the page: the Btn transition is 280 ms, so the second read still landed
 * mid-transition (measured, #1092: two warnings per button, the second one
 * against `rgb(125, 60, 237)` on a fill that settles at `rgb(124, 58, 237)`).
 *
 * Now: wait for the next frame (the style change is applied then), force the
 * style recalculation that STARTS any transition, ask the browser which
 * colour transitions are really running on the element and its ancestors
 * (the painted background is resolved up the tree), and measure once they
 * have all settled. No duration is guessed: the Web Animations API reports
 * the transitions that actually exist, delay and interruption included.
 *
 * Browsers without `getAnimations` fall back to a timer DERIVED from the
 * computed `transition-duration` + `transition-delay` — still the real
 * duration, never a constant.
 *
 * @description
 * `declaredTransitionMs`: longest `duration + delay` (ms) declared along the
 * ancestor chain. `runningColorTransitions`: colour transitions currently
 * running on `el` or any ancestor.
 *
 * @description
 * In `settleThenEnforce`, reading `getComputedStyle(el).color` forces the
 * style recalculation that creates the transitions this frame's change
 * triggered — without it `getAnimations()` would still be empty. `allSettled`
 * is used because a transition cancelled by a retarget rejects its `finished`
 * promise; either way the next pass re-checks.
 ********************************************************/
const MAX_SETTLE_PASSES = 4
const COLOR_TRANSITION_PROPERTIES = new Set(['color', 'background-color'])

function declaredTransitionMs (el: HTMLElement): number {
    const toMs = (value: string): number => {
        const n = parseFloat(value)
        if (Number.isNaN(n)) return 0
        return value.trim().endsWith('ms') ? n : n * 1000
    }
    let longest = 0

    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
        const style = getComputedStyle(node)
        const durations = style.transitionDuration.split(',')
        const delays = style.transitionDelay.split(',')

        durations.forEach((duration, i) => {
            longest = Math.max(longest, toMs(duration) + toMs(delays[i % delays.length] ?? '0'))
        })
    }

    return longest
}

function runningColorTransitions (el: HTMLElement): Animation[] {
    const found: Animation[] = []

    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
        for (const animation of node.getAnimations()) {
            const property = (animation as Animation & { transitionProperty?: string }).transitionProperty
            if (property && COLOR_TRANSITION_PROPERTIES.has(property) && animation.playState !== 'finished') {
                found.push(animation)
            }
        }
    }

    return found
}

/*********************************************************
 * forceStyleRecalc
 *
 * @description
 * Reading a computed property makes the browser apply the pending style
 * change, which is what STARTS the transitions that change triggered —
 * without it `getAnimations()` would still be empty. The colour is returned
 * (and checked by the caller) rather than discarded: an empty value means the
 * element is detached or not rendered, so there is nothing to measure.
 ********************************************************/
function forceStyleRecalc (el: HTMLElement): string {
    return getComputedStyle(el).color
}

function settleThenEnforce (el: HTMLElement, enabled: boolean, pending: IContrastScheduled, pass = 0): void {
    if (pending.cancelled) return

    if (!forceStyleRecalc(el)) return

    if (typeof el.getAnimations === 'function') {
        const running = pass < MAX_SETTLE_PASSES ? runningColorTransitions(el) : []

        if (running.length) {
            Promise.allSettled(running.map((animation) => animation.finished))
                .then(() => settleThenEnforce(el, enabled, pending, pass + 1))
            return
        }

        enforceContrast(el, enabled)
        return
    }

    const wait = declaredTransitionMs(el)

    if (wait > 0 && pass === 0 && typeof setTimeout !== 'undefined') {
        pending.timeout = setTimeout(() => settleThenEnforce(el, enabled, pending, 1), wait) as unknown as number
        return
    }

    enforceContrast(el, enabled)
}

/*********************************************************
 * cancelScheduled
 *
 * @description
 * Cancel whatever `schedule()` previously queued for `el`, if anything.
 * Called both before scheduling a new one (so `updated` never accumulates
 * work) and from `unmounted` (so nothing survives the component's death).
 ********************************************************/
function cancelScheduled (el: HTMLElement): void {
    const pending = el._contrastTimers
    if (!pending) return

    pending.cancelled = true

    if (pending.raf !== undefined && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(pending.raf)
    }
    if (pending.timeout !== undefined && typeof clearTimeout !== 'undefined') {
        clearTimeout(pending.timeout)
    }

    delete el._contrastTimers
}

function schedule (el: HTMLElement, enabled: boolean): void {
    cancelScheduled(el)

    const pending: IContrastScheduled = {}

    if (typeof requestAnimationFrame !== 'undefined') {
        pending.raf = requestAnimationFrame(() => settleThenEnforce(el, enabled, pending))
    }

    el._contrastTimers = pending
}

/**
 * `v-contrast` — guards an element's text legibility at runtime.
 *
 * After the browser has resolved the design-token CSS variables, it measures
 * the element's text colour against its painted background. When the WCAG
 * ratio falls below the configured threshold it forces the better of
 * black / white text (in every build) and, in dev only, logs a one-line warning explaining the swap. Toggle
 * globally via `createOrigam({ contrast: false })`, or per-element with
 * `v-contrast="false"`.
 */
const vContrast: Directive<HTMLElement, boolean | undefined> = {
    mounted (el: HTMLElement, binding: DirectiveBinding<boolean | undefined>) {
        schedule(el, config.enabled && binding.value !== false)
    },
    updated (el: HTMLElement, binding: DirectiveBinding<boolean | undefined>) {
        schedule(el, config.enabled && binding.value !== false)
    },
    unmounted (el: HTMLElement) {
        cancelScheduled(el)
    }
}

export default vContrast
