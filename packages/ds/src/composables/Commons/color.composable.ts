import type { ComputedRef, Ref } from 'vue'
import { computed, isRef, ref } from 'vue'
import type { IBgColorProps, IColorProps } from "../../interfaces"
import type { TBgFgRole, TColor, TIntent } from '../../types'
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
    rawBgExprWithState,
    tokenForegroundForIntent,
    tokenStylesForIntent,
    warnLegacyColor,
} from '../../utils/Commons/color.util'
import { isGradient, resolveGradient } from '../../utils/Commons/gradient.util'

// ────────────────────────────────────────────────────────────────────────────
// Composable rule: ONLY `use*` functions live in this file.
// Helper functions (isIntent, isUtilityIntent, intentBgExpr, …) and the
// legacy-warning module state live in `src/utils/Commons/color.util.ts`.
// Constants live in `src/consts/Commons/color.const.ts`. Types live in
// `src/types/Commons/color.type.ts`.
//
// `useColorEffect` accepts both raw CSS colors (legacy) and semantic
// intents. When an intent is provided, we emit references to design
// tokens so the theme switches automatically (light/dark/brand-x).
// When a raw color is provided, we keep the legacy JS-side behaviour
// and warn once per key — hex/rgb support will be removed in v3.0.0.
//
// Cross-component derivation rule (per user spec):
//
//     normal  →  bgColor
//     hover   →  bgColor + 20 % darker   (designer token, color-mix fallback)
//     active  →  bgColor + 30 % darker   (designer token, color-mix fallback)
//
// Implementation strategy: cascading CSS var:
//
//     var(--bgHover, color-mix(in srgb, bg, black 20%))
// ────────────────────────────────────────────────────────────────────────────


// ────────────────────────────────────────────────────────────────────────────
// Legacy `useColor` API (kept for backward compat — used by ~49 components)
// ────────────────────────────────────────────────────────────────────────────

/*********************************************************
 * useColor
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

/*********************************************************
 * useBothColor
 ********************************************************/
export function useBothColor<T extends Record<K, TColor>, K extends string> (bgColorProps: T | Ref<TColor> | ComputedRef<TColor>, colorProps: T | Ref<TColor> | ComputedRef<TColor>, name?: K) {
    const bothColors = computed(() => {
        return {
            text: isRef(colorProps) ? colorProps.value : (name ? colorProps[name] : null),
            background: isRef(bgColorProps) ? bgColorProps.value : (name ? bgColorProps[name] : null)
        }
    })

    return useColor(bothColors)
}

/*********************************************************
 * useTextColor
 ********************************************************/
export function useTextColor<T extends Record<K, TColor>, K extends string> (
    props: T | Ref<TColor>,
    name?: K
) {
    const colors = computed(() => ({
        text: isRef(props) ? props.value : (name ? props[name] : null)
    }))

    const {colorClasses: textColorClasses, colorStyles: textColorStyles} = useColor(colors)

    return {textColorClasses, textColorStyles}
}

/*********************************************************
 * useBackgroundColor
 ********************************************************/
export function useBackgroundColor<T extends Record<K, TColor>, K extends string> (
    props: T | Ref<TColor>,
    name?: K
) {
    const colors = computed(() => ({
        background: isRef(props) ? props.value : (name ? props[name] : null)
    }))

    const {colorClasses: backgroundColorClasses, colorStyles: backgroundColorStyles} = useColor(colors)

    return {backgroundColorClasses, backgroundColorStyles}
}

// ────────────────────────────────────────────────────────────────────────────
// `useColorEffect` — refactored for design-tokens / intent support (Lot 1)
// ────────────────────────────────────────────────────────────────────────────
//
// Returns the same shape as before — `{ colorStyles, color, bgColor }` — so
// existing callers (OrigamBtn, etc.) keep working without changes.
//
// `colorStyles` is an array of CSS declarations like `'background-color: …'`,
// either pointing to a token (`var(--origam-color__action--primary---bg)`) when
// `props.color` is an intent, or to a raw value when it's a hex/rgb (legacy).
//
// State resolution:
//   - `isHover.value` and `isActive.value` swap to `hoverColor` / `activeColor`
//     when those are explicitly set on props.
//   - When in hover state with no `hoverColor` override, intent values use
//     the `bgHover`/`fgHover` slot of the same intent's action set.

/*********************************************************
 * useColorEffect
 ********************************************************/
export function useColorEffect (
    props: IColorProps & IBgColorProps & {
        hoverColor?: TColor
        activeColor?: TColor
        hoverBgColor?: TColor
        activeBgColor?: TColor
    },
    isHover: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isActive: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isDisabled: Ref<boolean> | ComputedRef<boolean> = ref(false)
) {
    const activeColor = computed(() => props.activeColor ? props.activeColor : props.color)
    const hoverColor = computed(() => props.hoverColor ? props.hoverColor : props.color)
    const color = computed(() => {
        return isHover.value ? hoverColor.value : isActive.value ? activeColor.value : props.color
    })
    const activeBgColor = computed(() => props.activeBgColor ? props.activeBgColor : props.bgColor)
    const hoverBgColor = computed(() => props.hoverBgColor ? props.hoverBgColor : props.bgColor)
    const bgColor = computed(() => {
        return isHover.value ? hoverBgColor.value : isActive.value ? activeBgColor.value : props.bgColor
    })

    // Utility classes for the resting state ONLY. When the component is
    // in hover / active state, slot resolution kicks the bg/fg to their
    // `bgHover` / `fgHover` token rungs — there is no matching utility
    // class for those slots, so we emit nothing and let the inline
    // styles win. Same goes for legacy raw colors (hex/rgb).
    const colorClasses = computed<string[]>(() => {
        // Bypass the utility layer in hover/active/disabled because the
        // resolved token is not the resting `--origam-color__action--*---bg`
        // referenced by the utility class.
        if (isHover.value || isActive.value || isDisabled.value) return []

        const classes: string[] = []
        const bgVal = bgColor.value
        const fgVal = color.value

        if (bgVal && isUtilityIntent(bgVal)) {
            classes.push(`origam--bg-${bgVal}`)
        }
        if (fgVal && isUtilityIntent(fgVal)) {
            classes.push(`origam--color-${fgVal}`)
        } else if (!fgVal && bgVal && isUtilityIntent(bgVal)) {
            // Auto-contrast: a bg-only intent pairs the matching fg
            // token. We don't emit a `.origam--color-*` class here
            // because the utility uses the intent's `*-fg` token while
            // the inline style emits the WCAG-paired surface foreground
            // (handled below). The component's SCSS picks up the
            // inline style during the transition.
        }
        return classes
    })

    const colorStyles = computed<string[]>(() => {
        // ─────────────────────────────────────────────────────────────────
        // Resolve bg and fg INDEPENDENTLY so that overriding only one of
        // them (e.g. `hoverBgColor` while keeping `color="primary"` for
        // the foreground) actually works. The previous "path A wins" logic
        // short-circuited as soon as `color` was an intent and silently
        // dropped any bgColor / hoverBgColor / activeBgColor overrides.
        //
        // Slot selection ("default" vs "hover") is per-axis: a missing
        // hoverBgColor lets the bg auto-bump to the intent's `bgHover`
        // slot, and likewise for fg. When the consumer DID pass an explicit
        // hover override we use the value as-is on the "default" slot of
        // that intent (the consumer chose the value, they don't want us
        // re-bumping it to a hover variant of itself).
        // ─────────────────────────────────────────────────────────────────
        // `isDisabled` is accepted here for API symmetry with `isHover`
        // / `isActive`, but does NOT switch the bg/fg to `bgDisabled` /
        // `fgDisabled` tokens — design contract is that disabled is a
        // VEIL/opacity overlay on the resting color, not a token swap.
        // The host component (e.g. `<origam-btn>`) applies its own
        // `--disabled` rule (opacity reduction) so the user sees a
        // lighter version of WHATEVER bgColor was picked, regardless
        // of intent. This keeps every btn in a row (e.g. pagination)
        // visually consistent — same color family, just dimmed.
        // We still read `isDisabled.value` to keep the param wired —
        // in case a future iteration wants per-intent disabled tokens.
        void isDisabled.value
        // ── State role per axis ──────────────────────────────────────────
        // hover and active resolve to DIFFERENT roles so the cross-
        // component spec ("hover -20 %, active -30 %") holds. The
        // previous code collapsed isActive into the 'hover' slot, which
        // was wrong: the two states landed on the same darkening rung
        // (designer-tuned bgHover) and were visually indistinguishable.
        //
        // Per-axis selection is preserved: an explicit hover/activeBgColor
        // takes precedence over the role bump for THAT axis only.
        //
        // Same-intent rule (user spec): when the consumer passes the
        // SAME intent on hoverBgColor / activeBgColor as on the resting
        // bgColor (e.g. `bgColor="primary" hoverBgColor="primary"`),
        // we treat it AS IF the override was absent — i.e. we still
        // bump to the matching `bgHover` / `bgActive` rung so the user
        // gets the canonical -20 % / -30 % darken instead of "nothing
        // happens on hover because the override resolves to the same
        // resting token". Mirror logic applies to `color` / `hoverColor`
        // / `activeColor` for the foreground axis.
        const sameIntentBg = (a: TColor | undefined | null, b: TColor | undefined | null) => {
            return !!a && !!b && a === b && isIntent(a)
        }
        const sameIntentFg = (a: TColor | undefined | null, b: TColor | undefined | null) => {
            return !!a && !!b && a === b && isIntent(a)
        }

        const bgRole: TBgFgRole =
            isHover.value && (!props.hoverBgColor || sameIntentBg(props.hoverBgColor, props.bgColor)) ? 'hover' :
            isActive.value && (!props.activeBgColor || sameIntentBg(props.activeBgColor, props.bgColor)) ? 'active' :
            'default'
        // `fgRole` is intentionally kept in the closure for API symmetry
        // — future intents may differentiate fg slots per state. Today
        // every fg token lives on the same `fg` rung regardless of state
        // (per intentFgExpr), so we reference but don't consume it.
        const _fgRole: TBgFgRole =
            isHover.value && (!props.hoverColor || sameIntentFg(props.hoverColor, props.color)) ? 'hover' :
            isActive.value && (!props.activeColor || sameIntentFg(props.activeColor, props.color)) ? 'active' :
            'default'
        void _fgRole

        let bgDecl: string | null = null
        let fgDecl: string | null = null
        // When bg comes from an intent, we know the matching fg token —
        // remember it so a missing `color` falls back to that pair (auto-
        // contrast inside the design-system without `getForeground`).
        let bgIntentFg: string | null = null
        let bgIsGradient = false
        // Set to true when the FOREGROUND resolves to a gradient — we
        // then need to emit `background-clip: text` / `-webkit-…` at the
        // end (after `bgDecl` so the gradient lives on background-image).
        let clipText = false

        /*********************************************************
         * Background resolution
         ********************************************************/
        if (bgColor.value && isGradient(bgColor.value)) {
            // Gradients ignore the hover/active darken cascade — applying
            // `color-mix` per stop would explode the declaration size and
            // change the artistic intent. Hover/active are visually
            // expressed via the parent component's opacity / transform
            // overlay rather than a token swap. (Same contract as the
            // disabled state: veil/opacity overlay on the resting fill.)
            const grad = resolveGradient(bgColor.value)
            if (grad) {
                bgDecl = `background-image: ${grad}`
                bgIsGradient = true
            }
        } else if (bgColor.value && isIntent(bgColor.value as string)) {
            const m = tokenStylesForIntent(bgColor.value as TIntent, bgRole)
            bgDecl = `background-color: ${m['background-color']}`
            // The intent's contrast fg is fixed across roles — pull from
            // the default slot regardless of bgRole so hover/active text
            // never darkens with the bg.
            bgIntentFg = tokenStylesForIntent(bgColor.value as TIntent, 'default').color
        } else if (bgColor.value === 'transparent') {
            // Default mode (transparent base): math derivation gives a
            // subtle gray on hover, a stronger gray on active — matches
            // the pagination-style "neutral progression" expectation.
            bgDecl = `background-color: ${rawBgExprWithState('transparent', bgRole)}`
        } else if (bgColor.value && typeof bgColor.value === 'string' && isCssColor(bgColor.value)) {
            warnLegacyColor('bgColor', bgColor.value)
            // Raw color path: apply the same -20 % / -30 % derivation
            // for hover / active. Default mode keeps the raw value
            // untouched (no transformation at rest).
            bgDecl = `background-color: ${rawBgExprWithState(bgColor.value, bgRole)}`
        }

        /*********************************************************
         * Foreground resolution
         ********************************************************/
        // Universal design-system contract (matches `useColor`):
        //   • `color` is FOREGROUND-ONLY — it never paints the surface.
        //   • `bgColor` owns the surface; if the consumer wants both
        //     coloured, both props must be set.
        // The previous version of this block auto-paired the bg from the
        // intent when only `color` was passed — that meant
        // `<OrigamBtnGroup color="primary">` flooded every child button
        // with primary backgrounds instead of just colouring the text,
        // breaking the rest of the design system's expectations.
        // For "filled primary button" use `bgColor="primary"` (which
        // auto-contrasts the text to the intent's fg pair below) or set
        // both explicitly.
        if (color.value && isGradient(color.value)) {
            // Foreground gradient → `background-clip: text` triad. When
            // the surface (bgColor) is ALSO a gradient, both occupy the
            // same `background-image` channel — the consumer should pick
            // one. We honour the FOREGROUND in that case (the text glyphs
            // win over the empty surface area). The bg/fg gradient
            // collision is documented in the gradient guide.
            const grad = resolveGradient(color.value)
            if (grad) {
                fgDecl = 'color: transparent'
                // Hijack background-image for the text gradient: any bg
                // gradient set on bgColor is replaced (foreground wins).
                bgDecl = `background-image: ${grad}`
                clipText = true
            }
        } else if (color.value && isIntent(color.value as string)) {
            // ── Color-clash auto-contrast (cross-component rule) ────────
            // When the consumer passes the SAME intent on both axes
            // (e.g. `color="primary" bgColor="primary"`), painting the
            // fg with `tokenForegroundForIntent` returns the intent's
            // own hue (fgSubtle = primary.700) ON TOP of the bg's intent
            // surface — hue-on-hue, unreadable ("violet on violet"). Swap
            // to the bg's paired contrast token instead (white on a
            // saturated brand surface, dark on a soft surface) so the
            // text is always legible without forcing the consumer to
            // spell out both values explicitly.
            if (
                bgIntentFg &&
                bgColor.value &&
                isIntent(bgColor.value as string) &&
                color.value === bgColor.value
            ) {
                fgDecl = `color: ${bgIntentFg}`
            } else {
                // `tokenForegroundForIntent` returns the intent's *foreground*
                // token (e.g. `var(--origam-color__action--primary---fgSubtle)`),
                // designed to be legible on a neutral surface — exactly the
                // semantics consumers want from `color` alone.
                fgDecl = `color: ${tokenForegroundForIntent(color.value as TIntent)}`
            }
        } else if (color.value && typeof color.value === 'string' && isCssColor(color.value)) {
            if (color.value !== 'transparent') warnLegacyColor('color', color.value)
            fgDecl = `color: ${color.value}`
        } else if (!color.value && bgIntentFg && !bgIsGradient) {
            // Auto-contrast (token path): bg comes from an intent, no
            // explicit color → pair the intent's matching `fg` token so
            // the text is always legible without the consumer specifying
            // both. Reads the same hover/disabled slot via `bgRole`.
            fgDecl = `color: ${bgIntentFg}`
        } else if (!color.value && !bgIsGradient && bgColor.value && typeof bgColor.value === 'string'
                   && bgColor.value !== 'transparent' && isParsableColor(bgColor.value)) {
            // Auto-contrast (legacy raw CSS): WCAG-aware foreground from
            // the existing `getForeground` helper. Skipped for translucent
            // bgs (alpha < 1) since contrast can't be reliably computed.
            const parsed = parseColor(bgColor.value)
            if (parsed.a == null || parsed.a === 1) {
                fgDecl = `color: ${getForeground(parsed)}`
            }
        }

        const styles: string[] = []
        if (bgDecl) styles.push(bgDecl)
        if (fgDecl) styles.push(fgDecl)
        if (clipText) {
            styles.push('background-clip: text')
            styles.push('-webkit-background-clip: text')
        }
        return styles
    })

    return {colorClasses, colorStyles, color, bgColor}
}
