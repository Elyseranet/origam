import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import type { IBgColorProps, IColorProps } from '../../interfaces/Commons/color.interface'
import type { TBgFgRole } from '../../types/Commons/color.type'
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
    rawBgExprWithState,
    tokenForegroundForIntent,
    tokenStylesForIntent,
    warnLegacyColor,
} from '../../utils/Commons/color.util'
import { isGradient, resolveGradient } from '../../utils/Commons/gradient.util'

/*********************************************************
 * useColorEffect
 *
 * @description
 * Hover/active/disabled-aware bg+fg colour resolver — refactored for
 * design-tokens / intent support (Lot 1).
 * Deliberately independent from `useColor`: the role/state derivation
 * (default / hover / active slots) is a different algorithm from the
 * legacy static resolver, not a variant of it — kept in its own file
 * rather than forced to share a base.
 *
 * Returns the same shape as before — `{ colorStyles, color, bgColor }` —
 * so existing callers (`OrigamAudio`, `OrigamVideo`) keep working
 * without changes.
 *
 * `colorStyles` is an array of CSS declarations like
 * `'background-color: …'`, either pointing to a token
 * (`var(--origam-color__action--primary---bg)`) when `props.color` is
 * an intent, or to a raw value when it's a hex/rgb (legacy).
 *
 * State resolution: `isHover.value` / `isActive.value` bump an intent
 * `bgColor` to its `bgHover` / `bgActive` token rung (color-mix
 * fallback when the token is missing). The flat `hoverColor` /
 * `activeColor` / `hoverBgColor` / `activeBgColor` per-state override
 * props were removed (folded into the `hover` / `active` object props
 * on components that support them — see `color.interface.ts`); neither
 * real caller of this composable (`OrigamAudio`, `OrigamVideo`) ever
 * declared them, so the foreground/background scalars are now just
 * `props.color` / `props.bgColor` — only the darken-derivation role
 * (`bgRole`) still reacts to `isHover` / `isActive`.
 ********************************************************/
export function useColorEffect (
    props: IColorProps & IBgColorProps,
    isHover: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isActive: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isDisabled: Ref<boolean> | ComputedRef<boolean> = ref(false)
) {
    const color = computed(() => props.color)
    const bgColor = computed(() => props.bgColor)

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
        // ── State role ────────────────────────────────────────────────────
        // hover and active resolve to DIFFERENT roles so the cross-
        // component spec ("hover -20 %, active -30 %") holds. There is no
        // per-state override anymore (see the composable's JSDoc) — the
        // role is purely a function of `isHover` / `isActive`.
        const bgRole: TBgFgRole =
            isHover.value ? 'hover' :
            isActive.value ? 'active' :
            'default'

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
