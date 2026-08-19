import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { TColor, TIntent } from '../../types'
// Explicit `.ts` extension: a stale sibling `color.util.js` lingers in
// the source tree (legacy build artefact) and the module resolver picks
// it up first when no extension is given — that older file lacks the
// recently-added intent helpers, so they resolve to `undefined` at
// runtime. Forcing `.ts` here pins the import to the canonical source.
// The 295 orphan `.js` files across `src/` should be cleaned up in a
// dedicated pass.
import {
    getForeground,
    isCssColor,
    isIntent,
    isParsableColor,
    isUtilityIntent,
    parseColor,
    tokenForegroundForIntent,
    tokenStylesForIntent,
} from '../../utils/Commons/color.util'
import { isGradient, resolveGradient } from '../../utils/Commons/gradient.util'

/*********************************************************
 * useColor
 *
 * @description
 * Legacy bg/text colour resolver (kept for backward compat — used by
 * ~49 components).
 * Base hook of the color family: useBothColor / useTextColor /
 * useBackgroundColor all delegate to this one to avoid duplicating the
 * intent / gradient / legacy-CSS-color resolution logic.
 * `useColorEffect` (hover/active-aware) lives in its own file and does
 * NOT depend on this hook — its role/state derivation is a different
 * algorithm, not a variant of this one.
 ********************************************************/
export function useColor (colors: ComputedRef<{ background?: TColor, text?: TColor }>) {
    // Classes-first companion: when bg/text values resolve to a utility
    // intent, expose the matching `.origam--bg-*` / `.origam--color-*`
    // class so consumers can opt into the global utility layer in their
    // `:class` binding. The matching `*Styles` stays populated during
    // the Phase 2 → Phase 3 transition to guarantee zero visual
    // regression for components that haven't migrated yet.
    const colorClasses = computed<string[]>(() => {
        const classes: string[] = []
        // Gradients live exclusively on the inline-style channel — no
        // utility class matches a gradient definition, and the resolved
        // value carries its own intent token references already.
        if (
            colors.value.background &&
            !isGradient(colors.value.background) &&
            isUtilityIntent(colors.value.background as string)
        ) {
            classes.push(`origam--bg-${colors.value.background as string}`)
        }
        if (
            colors.value.text &&
            !isGradient(colors.value.text) &&
            isUtilityIntent(colors.value.text as string)
        ) {
            classes.push(`origam--color-${colors.value.text as string}`)
        }
        return classes
    })

    const colorStyles = computed(() => {
        const styles: string[] = []

        // Track the intent's matching foreground when the background is an
        // intent — lets `bgColor="primary"` alone auto-pair the right text
        // colour without forcing the consumer to specify both.
        let bgIntentFg: string | null = null
        let bgDecl: string | null = null
        // Tracks whether the background channel resolved to a gradient —
        // foreground auto-contrast skips when a gradient owns the surface
        // (we can't WCAG-pair against a multi-stop fill).
        let bgIsGradient = false

        /*********************************************************
         * Background resolution
         ********************************************************/
        if (colors.value.background) {
            // Gradient detection runs FIRST. A value like
            // `linear-gradient(...)` would otherwise fail `isIntent` and
            // tumble down into `isCssColor` which (deliberately) returns
            // false → the consumer's gradient would silently vanish.
            if (isGradient(colors.value.background)) {
                const grad = resolveGradient(colors.value.background)
                if (grad) {
                    // Transparent base + `background-image` lets multiple
                    // gradients stack with shorthand declarations later.
                    bgDecl = `background-image: ${grad}`
                    bgIsGradient = true
                }
            } else if (isIntent(colors.value.background as string)) {
                const m = tokenStylesForIntent(colors.value.background as TIntent, 'default')
                bgDecl = `background-color: ${m['background-color']}`
                bgIntentFg = m.color
            } else if (colors.value.background === 'transparent') {
                bgDecl = `background-color: ${colors.value.background as string}`
            } else if (typeof colors.value.background === 'string' && isCssColor(colors.value.background)) {
                bgDecl = `background-color: ${colors.value.background}`
            }
        }

        /*********************************************************
         * Foreground resolution
         ********************************************************/
        // `color` is foreground-only by design: setting `color="primary"`
        // changes the text colour, NOT the surface. The text resolves to
        // the intent's *own* colour (via `fgSubtle` — designed for coloured
        // text on a light surface), NOT the white-on-bg pair returned by
        // `tokenStylesForIntent`. Surface ownership lives on `bgColor`
        // (auto-contrast pairs the matching white-fg below).
        // For intent-aware surfaces (Btn), use `useColorEffect`, not this
        // legacy composable — that's where the bg auto-pair-on-fg lives.
        let fgDecl: string | null = null
        if (colors.value.text) {
            if (isGradient(colors.value.text)) {
                // Foreground gradient → `background-clip: text` triad:
                //   1. paint the gradient on the element's background-image
                //   2. clip the painted area to the rendered glyphs
                //   3. hide the original text colour so the gradient shows
                // We push three declarations at the END (after the bg
                // path) so a co-located `bgColor` still owns the actual
                // surface — the text gradient is layered on top via
                // `background-clip: text` and only paints the glyphs.
                const grad = resolveGradient(colors.value.text)
                if (grad) {
                    fgDecl = 'color: transparent'
                    styles.push(`background-image: ${grad}`)
                    styles.push('background-clip: text')
                    styles.push('-webkit-background-clip: text')
                }
            } else if (isIntent(colors.value.text as string)) {
                // ── Color-clash auto-contrast (cross-component rule) ────
                // When `text` and `background` resolve to the SAME intent
                // (e.g. `color="primary" bgColor="primary"`), painting the
                // fg with `tokenForegroundForIntent` returns a same-hue
                // shade (primary.fgSubtle = primary.700) — that's hue-on-
                // hue, unreadable. Swap to the bg's paired contrast token
                // (white on a saturated brand surface, dark on a soft
                // surface) so the text is always legible without forcing
                // the consumer to spell out both values.
                if (
                    bgIntentFg &&
                    isIntent(colors.value.background as string) &&
                    colors.value.text === colors.value.background
                ) {
                    fgDecl = `color: ${bgIntentFg}`
                } else {
                    fgDecl = `color: ${tokenForegroundForIntent(colors.value.text as TIntent)}`
                }
            } else if (typeof colors.value.text === 'string' && isCssColor(colors.value.text)) {
                fgDecl = `color: ${colors.value.text}`
            }
        } else if (bgIntentFg && !bgIsGradient) {
            // bg was an intent and consumer didn't provide an explicit text
            // colour → pair the intent's matching fg token (theme-aware
            // auto-contrast, no `getForeground` heuristic needed).
            fgDecl = `color: ${bgIntentFg}`
        } else if (bgDecl && !bgIsGradient && colors.value.background && typeof colors.value.background === 'string'
                   && colors.value.background !== 'transparent'
                   && isParsableColor(colors.value.background)) {
            // Legacy auto-contrast for raw CSS colors (WCAG-aware
            // foreground from `getForeground`). Skipped for translucent
            // bgs since contrast can't be reliably computed.
            const parsed = parseColor(colors.value.background)
            if (parsed.a == null || parsed.a === 1) {
                fgDecl = `color: ${getForeground(parsed)}`
            }
        }

        if (bgDecl) styles.push(bgDecl)
        if (fgDecl) styles.push(fgDecl)
        return styles
    })

    return {colorClasses, colorStyles}
}
