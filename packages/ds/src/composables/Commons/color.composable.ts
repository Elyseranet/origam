import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { TColor } from '../../types/Commons/color.type'
import type { TIntent } from '../../types/Commons/intent.type'
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

interface IColorBackground {
    bgDecl: string | null
    /** The intent's matching foreground when the background is an intent — lets `bgColor="primary"` alone auto-pair the right text colour. */
    bgIntentFg: string | null
    /** Foreground auto-contrast skips when a gradient owns the surface (no WCAG pairing against a multi-stop fill). */
    bgIsGradient: boolean
}

/*********************************************************
 * Background resolution
 ********************************************************/
function resolveBackground (background: TColor | undefined): IColorBackground {
    const none: IColorBackground = { bgDecl: null, bgIntentFg: null, bgIsGradient: false }
    if (!background) return none

    // Gradient detection runs FIRST. A value like
    // `linear-gradient(...)` would otherwise fail `isIntent` and
    // tumble down into `isCssColor` which (deliberately) returns
    // false → the consumer's gradient would silently vanish.
    if (isGradient(background)) {
        const grad = resolveGradient(background)
        // Transparent base + `background-image` lets multiple
        // gradients stack with shorthand declarations later.
        return grad ? { bgDecl: `background-image: ${grad}`, bgIntentFg: null, bgIsGradient: true } : none
    }
    if (isIntent(background as string)) {
        const m = tokenStylesForIntent(background as TIntent, 'default')
        return { bgDecl: `background-color: ${m['background-color']}`, bgIntentFg: m.color, bgIsGradient: false }
    }
    if (background === 'transparent') {
        return { bgDecl: `background-color: ${background as string}`, bgIntentFg: null, bgIsGradient: false }
    }
    if (typeof background === 'string' && isCssColor(background)) {
        return { bgDecl: `background-color: ${background}`, bgIntentFg: null, bgIsGradient: false }
    }
    return none
}

/** Foreground gradient → `background-clip: text` triad, with the original text colour hidden. */
function resolveTextGradient (text: TColor): { fgDecl: string | null, gradientStyles: string[] } {
    const grad = resolveGradient(text)
    if (!grad) return { fgDecl: null, gradientStyles: [] }
    return {
        fgDecl: 'color: transparent',
        gradientStyles: [`background-image: ${grad}`, 'background-clip: text', '-webkit-background-clip: text']
    }
}

/** Intent text colour, with the colour-clash auto-contrast swap. */
function resolveIntentText (colors: { background?: TColor, text?: TColor }, bgIntentFg: string | null): string {
    // When `text` and `background` resolve to the SAME intent
    // (e.g. `color="primary" bgColor="primary"`), painting the
    // fg with `tokenForegroundForIntent` returns a same-hue
    // shade (primary.fgSubtle = primary.700) — that's hue-on-
    // hue, unreadable. Swap to the bg's paired contrast token.
    if (
        bgIntentFg &&
        isIntent(colors.background as string) &&
        colors.text === colors.background
    ) {
        return `color: ${bgIntentFg}`
    }
    return `color: ${tokenForegroundForIntent(colors.text as TIntent)}`
}

/** Legacy auto-contrast for raw CSS colors (skipped for translucent bgs). */
function resolveAutoContrast (background: TColor | undefined): string | null {
    if (
        typeof background === 'string' &&
        background !== 'transparent' &&
        isParsableColor(background)
    ) {
        const parsed = parseColor(background)
        if (parsed.a == null || parsed.a === 1) return `color: ${getForeground(parsed)}`
    }
    return null
}

/*********************************************************
 * Foreground resolution
 *
 * `color` is foreground-only by design: setting `color="primary"`
 * changes the text colour, NOT the surface. The text resolves to
 * the intent's *own* colour (via `fgSubtle`), NOT the white-on-bg pair
 * returned by `tokenStylesForIntent`. For intent-aware surfaces (Btn),
 * use `useColorEffect`, not this legacy composable.
 ********************************************************/
function resolveForeground (
    colors: { background?: TColor, text?: TColor },
    bgDecl: string | null,
    bgIntentFg: string | null,
    bgIsGradient: boolean
): { fgDecl: string | null, gradientStyles: string[] } {
    const { background, text } = colors

    if (text) {
        if (isGradient(text)) return resolveTextGradient(text)
        if (isIntent(text as string)) return { fgDecl: resolveIntentText(colors, bgIntentFg), gradientStyles: [] }
        if (typeof text === 'string' && isCssColor(text)) return { fgDecl: `color: ${text}`, gradientStyles: [] }
        return { fgDecl: null, gradientStyles: [] }
    }
    // bg was an intent and consumer didn't provide an explicit text
    // colour → pair the intent's matching fg token.
    if (bgIntentFg && !bgIsGradient) return { fgDecl: `color: ${bgIntentFg}`, gradientStyles: [] }
    if (bgDecl && !bgIsGradient) return { fgDecl: resolveAutoContrast(background), gradientStyles: [] }
    return { fgDecl: null, gradientStyles: [] }
}

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
        const { bgDecl, bgIntentFg, bgIsGradient } = resolveBackground(colors.value.background)
        const { fgDecl, gradientStyles } = resolveForeground(colors.value, bgDecl, bgIntentFg, bgIsGradient)

        // The text-gradient triad goes BEFORE the bg declaration so a
        // co-located `bgColor` still owns the actual surface.
        const styles: string[] = [...gradientStyles]
        if (bgDecl) styles.push(bgDecl)
        if (fgDecl) styles.push(fgDecl)
        return styles
    })

    return {colorClasses, colorStyles}
}
