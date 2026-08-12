import type { IBtnProps } from '../../interfaces'
import type { TVariant, TVariantPresets } from '../../types'

/**
 * DS-shipped preset table for `OrigamBtn`'s `variant` prop — ADR-005
 * (`docs/internal/adr-005-variant-as-props-preset.md`), ticket #23.
 *
 * This REPLACES the pre-v3 `&--variant-*` SCSS blocks (7 selectors, 9
 * `!important` declarations on `background-color`, the mechanical cause of
 * the reported Theme Builder bug — an `outlined` button ignoring any
 * `bgColor` change). Resolution order (ADR-005 Q2, weakest tier):
 * call-site prop > theme default > THIS PRESET > `withDefaults()`. So
 * `<origam-btn variant="outlined" bg-color="primary">` now paints primary —
 * `bgColor` is a call-site prop, `variant`'s preset is the weakest tier for
 * the `bgColor` KEY specifically (each prop resolves independently, see
 * `useDefaults`'s per-key resolution in `defaults.composable.ts`).
 *
 * Every value below is a re-expression, IN PROPS, of what the removed SCSS
 * used to set — chosen to keep the DEFAULT rendering unchanged (verified
 * with before/after `getComputedStyle` + the committed VRT baselines in
 * `packages/tests/vrt/btn-variant.spec.ts`).
 *
 * ── Token fidelity ─────────────────────────────────────────────────────
 * `bgColor` / `borderColor` / `elevation` reference the EXACT SAME
 * `--origam-btn---*` CSS custom properties the old SCSS read (as raw
 * `var(...)` values — the `TColor` / `TElevation` "custom value" channel,
 * same pattern `KBD_VARIANT_PRESETS` established). This is NOT cosmetic:
 * `packages/marketing/src/themes/{cartoon,geek,glass,ecom,apple,editorial,
 * material}.theme.ts` all override `--origam-btn---background-color-tonal`,
 * `--origam-btn---background-color-ghost`, `--origam-btn---box-shadow-
 * elevated`, `--origam-btn---border-color`, etc. directly — dropping the
 * var() chain in favour of a bare intent/token would silently break every
 * one of those themes the moment this preset table replaces the SCSS.
 * Verified via `grep -rln` across `packages/marketing` before writing this
 * file (see PR description / delivery notes).
 *
 * ── The one token NOT preserved: per-component border-WIDTH overrides ──
 * `--origam-btn---border-width-outlined` / `-ghost` (cartoon sets both to
 * `3px`) cannot be threaded through `IBorderProps.border` — the shorthand
 * prop's regex-based parser (`BORDER_REGEX`, `border.const.ts`) only
 * recognises NUMERIC widths, never a `var(...)` reference, and passing one
 * as a raw string mis-parses (the var() text falls through to the `color`
 * capture group). `border: 1` (a literal number) is used instead — it
 * forces a deterministic INLINE style (guaranteed to beat the component's
 * own unconditional base `border-width` declaration regardless of
 * stylesheet load order, unlike the `.origam--border-thin` UTILITY class
 * which sits at the SAME specificity as that base rule and would depend on
 * import order) and happens to equal the default theme's `thin` (1px)
 * rung. Consequence, accepted knowingly and flagged for a follow-up ticket:
 * `cartoon.theme.ts`'s 3px override token becomes a dead CSS var once this
 * preset ships — that theme needs a companion migration to the ADR-005 D4
 * `variants` map (`variants: { 'origam-btn': { outlined: { border: 3 } } }`
 * — literally the ADR's own worked example for the cartoon 3px case).
 *
 * ── State (`active` / `hover`) ──────────────────────────────────────────
 * ADR-005 Q3: a preset MAY set `hover` / `active` — resolved through the
 * SAME per-prop precedence as everything else (`useStateEffect` reads the
 * component's OWN resolved `hover/active` prop, which by the time it's
 * read has ALREADY gone through the preset tier for that key). `tonal`'s
 * and `outlined`'s active-state fill, and `plain`/`ghost`'s hover surface,
 * are the props re-expression of the removed nested `&--active` /
 * `&:hover, &:focus-visible` SCSS blocks. `OrigamBtn.vue` wires
 * `@focus`/`@blur` to the SAME `onMouseenter`/`onMouseleave` handlers
 * `useHover` already exposes, so a KEYBOARD-focused button still gets the
 * hover surface (parity with the removed `:focus-visible` selector — pure
 * mouse-driven `isHover` would otherwise silently drop keyboard affordance
 * for `plain`/`ghost`).
 *
 * `tonal`'s active state also re-expresses `font-weight: 600` (the
 * `IStateEffectConfig.fontWeight` axis — NOT resolved centrally by
 * `useStateEffect`, since no other consumer of the composable needs it
 * yet; `OrigamBtn.vue` reads `activeState.value?.fontWeight` directly).
 *
 * ── `ghost` ──────────────────────────────────────────────────────────────
 * ADR-005 Q1 arbitration: `backdrop-filter: blur(8px)` becomes the
 * `backdropBlur` prop (`IBackdropProps`, ticket #21) instead of a
 * `@supports`-guarded SCSS block. `backdropBlur: 'md'` resolves to
 * `var(--origam-backdrop__blur---md)` = `blur(8px)` — pixel-for-pixel the
 * removed value (`tokens/primitive.json` → `backdrop.blur.md`). No
 * `@supports not (...)` fallback rule survives: `useBackdrop` deliberately
 * does not gate emission behind `useCssSupport()` (backdrop-filter degrades
 * gracefully with no visual crash on its own — see `backdrop.composable.ts`
 * JSDoc) — the fallback background from the removed SCSS is dropped as
 * dead code, not silently broken (unsupported browsers now just render
 * without the blur, keeping the SAME translucent tint, same as before the
 * `@supports not` branch kicked in, minus the extra opacity bump).
 *
 * ── `plain` ──────────────────────────────────────────────────────────────
 * ADR-005 D6: `opacity: .7` / `hover: { opacity: 1 }` had NO prop surface
 * pre-migration. `IOpacityProps` / `useOpacity` close that gap (this
 * ticket). `opacity` references `--origam-btn---opacity-plain` (falls back
 * to the primitive `--origam-opacity---70`), matching the removed value.
 */
export const BTN_VARIANT_PRESETS: TVariantPresets<TVariant, IBtnProps> = {
    text: {
        bgColor: 'transparent',
        elevation: 0
    },
    flat: {
        elevation: 0
    },
    elevated: {
        elevation: 'var(--origam-btn---box-shadow-elevated, var(--origam-shadow---md))'
    },
    tonal: {
        bgColor: 'var(--origam-btn---background-color-tonal, var(--origam-color__surface---overlay))',
        elevation: 0,
        active: {
            bgColor: 'var(--origam-btn---background-color-tonal-active, var(--origam-color__surface---raised, var(--origam-color__surface---overlay)))',
            elevation: 'var(--origam-btn---box-shadow-tonal-active, var(--origam-shadow---xs))',
            fontWeight: 'semibold'
        }
    },
    outlined: {
        bgColor: 'transparent',
        border: 1,
        borderStyle: 'solid',
        borderColor: 'var(--origam-btn---border-color, currentColor)',
        elevation: 0,
        active: {
            bgColor: 'var(--origam-btn---background-color-active, var(--origam-btn---background-color))',
            color: 'var(--origam-btn---color)',
            borderColor: 'var(--origam-btn---background-color-active, var(--origam-btn---background-color))'
        }
    },
    plain: {
        bgColor: 'transparent',
        elevation: 0,
        opacity: 'var(--origam-btn---opacity-plain, var(--origam-opacity---70))',
        hover: {
            opacity: 1
        }
    },
    ghost: {
        bgColor: 'var(--origam-btn---background-color-ghost, color-mix(in srgb, currentColor 12%, transparent))',
        border: 1,
        borderStyle: 'solid',
        borderColor: 'var(--origam-btn---border-color-ghost, color-mix(in srgb, currentColor 24%, transparent))',
        elevation: 'var(--origam-btn---box-shadow-ghost, 0 0 0 1px color-mix(in srgb, currentColor 18%, transparent), 0 4px 18px 0 color-mix(in srgb, currentColor 28%, transparent), 0 1px 0 0 color-mix(in srgb, white 35%, transparent) inset)',
        backdropBlur: 'md',
        hover: {
            bgColor: 'var(--origam-btn---background-color-ghost-hover, color-mix(in srgb, currentColor 18%, transparent))',
            elevation: 'var(--origam-btn---box-shadow-ghost-hover, 0 0 0 1px color-mix(in srgb, currentColor 26%, transparent), 0 6px 24px 0 color-mix(in srgb, currentColor 40%, transparent), 0 1px 0 0 color-mix(in srgb, white 45%, transparent) inset)'
        }
    }
}
