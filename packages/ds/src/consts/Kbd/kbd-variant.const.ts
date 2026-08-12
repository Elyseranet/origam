import type { IKbdProps } from '../../interfaces'
import type { TKbdVariant, TVariantPresets } from '../../types'

/**
 * DS-shipped preset table for `OrigamKbd`'s `variant` prop — ADR-005 pilot
 * (`docs/internal/adr-005-variant-as-props-preset.md`).
 *
 * This REPLACES the pre-v3 `&--variant-*` SCSS blocks. Every value below is
 * a re-expression, in props, of what that SCSS used to set — chosen so the
 * DEFAULT rendering is unchanged (verified with before/after screenshots,
 * see the pilot's delivery notes).
 *
 * `bgColor` / `borderColor` reference the SAME `--origam-color__*` custom
 * properties the old SCSS read, as raw CSS `var(...)` values (the `TColor`
 * "custom value" channel — see `useColor`'s classes-first split in
 * `color.composable.ts`), not semantic intents: none of the 8 intents
 * (`neutral/primary/secondary/ghost/success/warning/danger/info`) represent
 * "raised surface" or "subtle border", so an intent would change the look.
 *
 * `elevation` carries the two multi-layer `color-mix(in srgb, currentColor
 * …)` box-shadow strings verbatim — `useElevation`'s custom-box-shadow
 * detection (`CUSTOM_BOX_SHADOW_REGEX`) already lists `color-mix(` as a
 * recognised signal, so these pass through untouched (verified: this is
 * the ONE spot in ADR-005's D6 table that explicitly needed testing before
 * being relied on).
 *
 * `tonal`'s background is the one value that did NOT pass through
 * unmodified: `bgColor` is typed `TColor` and resolves through
 * `useColor`'s `isCssColor` gate, whose CSS-function allow-list was
 * missing `color-mix` (only bare `color(...)` was recognised — see the
 * fix + changelog note in `utils/Commons/color.util.ts`). That gap is
 * fixed alongside this preset table so the literal
 * `color-mix(in srgb, currentColor 8%, transparent)` tint survives.
 *
 * `border` uses the boolean `true` shorthand (→ the `.origam--border-thin`
 * utility, 1px solid) for `outlined` / `filled`, matching the classes-first
 * convention and the illustrative `BTN_VARIANT_PRESETS` shape in the ADR.
 *
 * `tonal` sets `border: 0` EXPLICITLY (not omitted). This was wrong in an
 * earlier draft: the reasoning "Vue coerces an unset boolean-typed prop to
 * `false`, which already renders as no border" is true of the PROP, but
 * `key-surface`'s base mixin (`OrigamKbd.vue`'s `<style>`) declares
 * `border-width: var(--origam-kbd---border-width, 1px)` UNCONDITIONALLY as
 * the component's own CSS baseline — omitting `border` means `useBorder`
 * emits NO style/class at all, so nothing overrides that 1px CSS fallback
 * and a "no-border" tonal preset renders WITH a border. `border: 0`
 * (number) makes `useBorder` emit an inline `border-width: 0px` that wins
 * over the mixin (inline beats class). Caught by visual verification
 * (before/after screenshot comparison), not by the type-checker or unit
 * tests — see the pilot's delivery notes.
 */
export const KBD_VARIANT_PRESETS: TVariantPresets<TKbdVariant, IKbdProps> = {
    outlined: {
        bgColor: 'var(--origam-color__surface---raised, #fff)',
        borderColor: 'var(--origam-color__border---subtle, #d4d4d4)',
        border: true,
        elevation: '0 1px 0 0 color-mix(in srgb, currentColor 12%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 50%, transparent)'
    },
    filled: {
        bgColor: 'var(--origam-color__surface---overlay, #f5f5f5)',
        borderColor: 'var(--origam-color__border---subtle, #d4d4d4)',
        border: true,
        elevation: '0 1px 2px 0 color-mix(in srgb, currentColor 18%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 60%, transparent)'
    },
    tonal: {
        bgColor: 'color-mix(in srgb, currentColor 8%, transparent)',
        border: 0,
        elevation: 'none'
    }
}
