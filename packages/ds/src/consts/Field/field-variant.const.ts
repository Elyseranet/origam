import type { IFieldProps } from '../../interfaces'
import type { TVariantInput, TVariantPresets } from '../../types'

/**
 * DS-shipped preset table for `OrigamField`'s `variant` prop — ADR-005
 * (`docs/internal/adr-005-variant-as-props-preset.md`), family C (ticket
 * #24), the hardest of the four conversions and, per the ADR's own D5/D7,
 * explicitly expected to be PARTIAL. Read this file's doc alongside
 * `OrigamField.vue`'s `<style>` block — the surviving `&--chrome-*`
 * selectors (renamed from `&--variant-*`, see below) are the other half
 * of this conversion, not a leftover.
 *
 * ## Why Field converts less than Btn / Kbd / Blockquote
 *
 * Btn/Kbd/Blockquote variants paint the ROOT surface. Field's five
 * `VARIANT_INPUT` values instead spend almost their entire SCSS budget on
 * BEM CHILDREN — `&__outlines`, `&__outline`, `&__outline--start/end/notch`,
 * `&__label--floating` — via CSS custom properties
 * (`--origam-field---border-width`, `--origam-field---border-opacity`)
 * that CASCADE into those children, plus state-conditioned rules
 * (`&:hover`, `&#{$this}--focused`, `&#{$this}--error`, `&#{$this}--active`)
 * scoped to those same children. A props preset only configures the props
 * of the ROOT component instance — it has no way to reach into a
 * descendant selector or to declare "when hovered, change the CHILD's
 * opacity". This is exactly ADR-005 D5's family-C definition and D6's
 * "keep as component-internal CSS keyed off a behavioural prop, not off
 * the variant class" precedent (already applied by the Blockquote ticket
 * to its `quoted` quote-mark glyph).
 *
 * ## What DID convert (this table)
 *
 * | Variant | Root-level effect converted | Prop |
 * |---|---|---|
 * | `solo` | `box-shadow` (elevation) | `elevation` |
 * | `filled` | `background` | `bgColor` |
 * | `filled` | asymmetric `border-radius` (top rounded, bottom square) | `rounded` |
 * | `plain` | `background: transparent` | `bgColor` |
 * | `outlined` | `background` | `bgColor` |
 * | `underlined` | — nothing converts, see below | — |
 *
 * `bgColor` / `elevation` reference the EXACT SAME `--origam-field*` custom
 * properties the removed SCSS read (the `TColor` / `TElevation` "custom
 * value" channel, same pattern `BTN_VARIANT_PRESETS` / `KBD_VARIANT_PRESETS`
 * established) — verified via `grep -rln` across `packages/marketing`
 * before writing this file: `material.theme.ts` and `glass.theme.ts`
 * override `--origam-field---background-color` directly (the token
 * `outlined`'s preset below still reads), so dropping the `var()` chain in
 * favour of a bare intent would have silently broken both.
 *
 * ## `filled`'s `rounded` — baked literal, and why
 *
 * The removed SCSS read `border-radius: var(--origam-field---border-radius,
 * 8px) var(--origam-field---border-radius, 8px) 0 0` — i.e. it pointed BACK
 * at the same token `OrigamField.vue`'s `fieldRadiusVarStyles` computed
 * ALSO writes to (it mirrors whatever `rounded` resolves into
 * `--origam-field---border-radius` so the `&--chrome-outlined` corner radii
 * stay in sync with an instance-level `rounded` override). Setting THIS
 * preset's `rounded` to a `var(--origam-field---border-radius, …)`-based
 * string would make that mirrored declaration reference the very custom
 * property it is defining — a CSS cyclic reference, which the spec makes
 * "invalid at computed-value time" for the WHOLE property, not just the
 * offending declaration. Separately (and independently fatal to that
 * approach): `useRounded`'s `CUSTOM_BORDER_RADIUS_REGEX` only recognises a
 * value that IS ENTIRELY one `var(...)`/`calc(...)` call — a 4-value
 * shorthand mixing a `var()` reference with literal `0`s
 * (`"var(...) var(...) 0 0"`) matches NEITHER `BORDER_RADIUS_REGEX` (real
 * length units only) NOR `CUSTOM_BORDER_RADIUS_REGEX` (whole-string
 * `var()`/`calc()` only) and would be SILENTLY DROPPED — no radius at all.
 * Both verified by reading `rounded.composable.ts` / `rounded.util.ts` /
 * `rounded.const.ts` before writing this entry, not assumed.
 *
 * The fix, mirroring the Blockquote ticket's identical trade-off for its
 * `calc()`-composed padding: bake the CURRENT resolved pixel value as a
 * literal 4-corner shorthand (`formatRoundedStylesVar`'s 4-value form maps
 * `[start-start, start-end, end-start, end-end]` — i.e.
 * top-left/top-right/bottom-left/bottom-right in LTR — onto the SAME shape
 * as the removed CSS: top corners rounded, bottom corners square). The
 * literal is `4px`, NOT the `8px` the old SCSS's `var(…, 8px)` FALLBACK
 * implied — verified against the compiled token sheet
 * (`packages/ds/src/assets/css/tokens/light.css`):
 * `--origam-field---border-radius: var(--origam-radius---sm)` = `4px`. The
 * fallback never actually fired (Style Dictionary always emits the real
 * value), so `8px` was never the rendered radius even before this ticket.
 * Accepted trade-off, same class as Blockquote's: a theme that overrides
 * `--origam-field---border-radius` no longer automatically reshapes a
 * `filled` field's top corners through this preset (it still would through
 * an explicit `rounded` prop or an `IOrigamTheme.variants` override, D4).
 * Verified LOW RISK today — `grep` across `packages/marketing/src/themes`
 * shows none of the 7 themes set `variant: 'filled'` on `origam-field`.
 *
 * ## Reachability through the 6 descendants — a real, documented gap
 *
 * `OrigamTextField` / `OrigamTextareaField` / `OrigamSelect` /
 * `OrigamFileField` / `OrigamNumberField` / `OrigamOtpInputField` all wrap
 * `<origam-field>` and forward props via `filterProps` (picks each
 * descendant's OWN resolved value for every key `<origam-field>` declares).
 * ALL SIX declare `rounded: true` in their OWN `withDefaults()` — a
 * CONCRETE value, never `undefined`. `filterProps` only strips literal
 * `undefined`, so `<origam-field>` ALWAYS receives an EXPLICIT `rounded`
 * vnode prop when reached through a descendant — which makes it "passed"
 * for `wasPropPassed()` regardless of whether a human or a theme ever
 * touched it, and blocks BOTH the theme's `'origam-field'.rounded` tier
 * AND this preset's `filled.rounded` for every descendant. This is NOT a
 * regression this ticket introduces: `rounded: true` ALREADY produced an
 * INLINE `border-radius` (uniform, via `useStateEffect`) that ALREADY beat
 * the OLD scoped `&--variant-filled` CLASS rule on specificity before this
 * ticket touched anything (inline always wins over a class, regardless of
 * source order) — so a `filled` field rendered through, say,
 * `<origam-text-field variant="filled">` was ALREADY uniformly rounded,
 * never asymmetric, before this preset existed. The preset's `rounded`
 * entry is real and correct for `<origam-field variant="filled">` used
 * DIRECTLY (a documented, supported usage — Field ships its own story/doc)
 * — it changes nothing, in either direction, for the six descendants.
 * `bgColor` / `elevation` do NOT have this problem: neither is given a
 * concrete default by any of the six wrappers (their type unions don't
 * include `boolean`, so Vue never coerces an unset value to a
 * non-`undefined` concrete default the way it does for `rounded`), so both
 * flow through `filterProps` as `undefined` when untouched and correctly
 * reach this preset's `bgColor` / `elevation` entries through EVERY
 * descendant. Verified by reading each of the six components'
 * `withDefaults()` blocks, not assumed.
 *
 * ## What did NOT convert (documented, not forced — ADR-005 D5/D6)
 *
 * Everything else in the removed `&--variant-*` blocks stays as
 * component CSS, renamed from `&--variant-{value}` to `&--chrome-{value}`
 * so it survives the D3 CI guard banning DS rules on `--variant-*`
 * selectors (mirrors the Blockquote ticket's `--has-quote-mark` pattern —
 * a STRUCTURAL class, computed from the resolved `variant` exactly like
 * the pure-override `origam-field--variant-{value}` class `useVariant`
 * still emits, but carrying the DS's own irreducible CSS instead of being
 * inert):
 *
 * - `solo` — `--origam-field__input---padding-top: 20px` (a layout custom
 *   property read by the `:deep(.origam-field__input)` child selector; no
 *   prop reaches a descendant selector). `border-color: transparent` is
 *   ALSO kept — verified INERT (no `.origam-field` base rule paints a
 *   border on the ROOT at all; only `&__outline` children ever do, and
 *   only for `outlined`/`underlined`/`filled`), kept unchanged rather than
 *   removed to guarantee zero behaviour change.
 * - `filled` — the SAME `--origam-field__input---padding-top: 20px`, PLUS
 *   the entire `&__outlines &__outline { border-bottom; opacity; }` block
 *   (including its `:hover` / `&--focused` / `&--error` state variants) —
 *   BEM child + state, family C by definition.
 * - `plain` — `--origam-field---border-width: 0px` (dead in practice: kept
 *   for parity, since `&__outlines { display: none }` already hides the
 *   element that would have read it), `&__outlines { display: none }`
 *   (ADR-005 D6's own `display: none` precedent — "keep as
 *   component-internal CSS keyed off a behavioural flag, not off the
 *   variant class") and `:deep(.origam-field__input) { padding-inline: 0 }`
 *   (BEM child).
 * - `outlined` — `--origam-field---border-width` /
 *   `--origam-field---border-opacity` (custom properties consumed
 *   EXCLUSIVELY by `&__outline` children, never by the root itself), the
 *   full `&__outline--start/end/notch` per-corner geometry, the floating
 *   label's inline-start alignment margin, and the
 *   `&--active/&--focused { &__outline--notch { border-top-width: 0 } }`
 *   state rule. This is the majority of `outlined`'s SCSS (`outlined` is
 *   also the component's DEFAULT variant) — none of it targets the root.
 * - `underlined` — has ZERO root-level styling to convert: every single
 *   declaration (`--origam-field---border-width`,
 *   `--origam-field---border-opacity`, the `&__outline` bottom-border
 *   geometry, the `:hover`/`&--focused` opacity bump) targets `&__outline`
 *   children or is state-conditioned on them. Its table entry is
 *   deliberately OMITTED (not `underlined: {}`) rather than written as an
 *   empty, misleading entry — `TVariantPresets` is a `Partial<Record<…>>`,
 *   so an absent key is a legitimate "no preset" and resolves straight to
 *   `withDefaults()` for every prop, matching the pre-ticket rendering
 *   exactly (there was nothing to preset).
 *
 * No new Commons interface was needed for this ticket: `IOpacityProps` /
 * `IBackdropProps` / `ITypographyProps.fontStyle` (added by prior variant
 * tickets) were checked against Field's five variants and none apply — no
 * opacity, backdrop-filter or italic styling exists on any Field variant.
 */
export const FIELD_VARIANT_PRESETS: TVariantPresets<TVariantInput, IFieldProps> = {
    solo: {
        elevation: 'var(--origam-theme---elevation, var(--origam-field--variant-solo---box-shadow, var(--origam-shadow---sm)))'
    },
    filled: {
        bgColor: 'var(--origam-field--variant-filled---background-color, color-mix(in srgb, currentColor 12%, transparent))',
        rounded: '4px 4px 0px 0px'
    },
    plain: {
        bgColor: 'transparent'
    },
    outlined: {
        bgColor: 'var(--origam-field---background-color, transparent)'
    }
}
