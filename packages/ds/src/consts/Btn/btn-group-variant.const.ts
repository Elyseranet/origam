import type { IBtnGroupProps } from '../../interfaces'
import type { TVariant, TVariantPresets } from '../../types'

/**
 * DS-shipped preset table for `OrigamBtnGroup`'s `variant` prop — ADR-005,
 * ticket #23. Same mechanism and same token-fidelity rationale as
 * `BTN_VARIANT_PRESETS` (`consts/Btn/btn-variant.const.ts`) — read that
 * file's JSDoc first, this one only documents what differs.
 *
 * ── Why no `active` / `hover` sub-objects ───────────────────────────────
 * `OrigamBtnGroup.vue` calls `useStateEffect(props)` with NO `isHover` /
 * `isActive` / `hoverState` / `activeState` arguments — the composable's
 * defaults (`noopRef`, permanently `false`) mean the GROUP's own surface
 * never reads a state override; `hover` / `active` on `IBtnGroupProps`
 * exist only to be FORWARDED to child `<origam-btn>` instances (see
 * `OrigamBtnGroup.vue`'s `slotDefaults`). A preset `active: {...}` here
 * would be dead weight — silently never consumed — so it is omitted
 * entirely rather than shipping a value nobody reads.
 *
 * ── `text` / `plain` share ONE entry in the SCSS this replaces ─────────
 * The removed rule was `&--variant-text, &--variant-plain { background-
 * color: transparent !important; box-shadow: none; }` — both values get
 * an IDENTICAL preset object here (two keys, same literal shape) since
 * `TVariantPresets` has no "alias" concept.
 *
 * ── Border width ─────────────────────────────────────────────────────────
 * Same `border: 1` (literal number → guaranteed inline style) reasoning as
 * `BTN_VARIANT_PRESETS` — the group's base rule ALSO unconditionally
 * declares `border-width: var(--origam-btn-group---border-width)`
 * (`OrigamBtnGroup.vue`'s scoped `<style>`), so a `.origam--border-thin`
 * utility class would race that base rule at equal specificity depending
 * on stylesheet load order. The removed SCSS additionally re-pointed the
 * `--origam-btn-group---border-width` CUSTOM PROPERTY itself (consumed by
 * nothing else in the current file per a full read — the corner-clipping
 * relies purely on `overflow: hidden` deriving the inner radius natively,
 * not on that var's value) — not preserved, since `border: 1` (inline
 * style) already wins the ACTUAL rendered width deterministically without
 * it.
 */
export const BTN_GROUP_VARIANT_PRESETS: TVariantPresets<TVariant, IBtnGroupProps> = {
    text: {
        bgColor: 'transparent',
        elevation: 0
    },
    plain: {
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
        elevation: 0
    },
    outlined: {
        bgColor: 'transparent',
        border: 1,
        borderStyle: 'solid',
        borderColor: 'var(--origam-btn---border-color, currentColor)',
        elevation: 0
    },
    ghost: {
        bgColor: 'var(--origam-btn---background-color-ghost, color-mix(in srgb, currentColor 12%, transparent))',
        border: 1,
        borderStyle: 'solid',
        borderColor: 'var(--origam-btn---border-color-ghost, color-mix(in srgb, currentColor 24%, transparent))',
        elevation: 'var(--origam-btn---box-shadow-ghost, 0 0 0 1px color-mix(in srgb, currentColor 18%, transparent), 0 4px 18px 0 color-mix(in srgb, currentColor 28%, transparent), 0 1px 0 0 color-mix(in srgb, white 35%, transparent) inset)',
        backdropBlur: 'md'
    }
}
