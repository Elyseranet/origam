import type { IBlockquoteProps } from '../../interfaces'
import type { TBlockquoteVariant, TVariantPresets } from '../../types'

/**
 * DS-shipped preset table for `OrigamBlockquote`'s `variant` prop — ADR-005
 * (`docs/internal/adr-005-variant-as-props-preset.md`), family A conversion.
 *
 * This REPLACES the pre-v3 `&--variant-*` SCSS blocks (typography, padding,
 * accent border). Every value below is a re-expression, in props, of what
 * that SCSS used to set — chosen so the DEFAULT rendering is unchanged
 * (verified with before/after `getComputedStyle` comparisons against
 * `git stash`, see the delivery notes for ticket #25).
 *
 * ## What did NOT convert (documented, not forced — see ADR-005 D5/D6)
 *
 * Two things stay OUTSIDE this table, on purpose:
 *
 * 1. **`quoted`'s decorative quote-mark glyph + the `z-index` stacking that
 *    keeps `__body` / `__attribution` readable above it.** This paints a
 *    nested BEM CHILD (`.origam-blockquote__mark--bg`, `__body`,
 *    `__attribution`), and a props preset only configures the ROOT
 *    component — there is no prop surface that reaches into a descendant
 *    selector, and no `IPositionProps`-style `zIndex` prop exists on
 *    Commons regardless. `OrigamBlockquote.vue` keeps `showQuoteMark`
 *    (`variant === 'quoted'`) as a structural, non-preset read of the
 *    RESOLVED `variant`, exactly like ADR-005 D6's `display: none`
 *    precedent ("keep as component-internal CSS keyed off a behavioural
 *    flag, not off the variant class"). The stacking CSS is now keyed off
 *    a dedicated `--has-quote-mark` structural class (see the component's
 *    `<style>` block), NOT `--variant-quoted` — so it survives the D3 CI
 *    guard banning DS rules on `--variant-*` selectors.
 * 2. **`pull`'s default `align: 'center'`.** This is a *derived default*
 *    computed from the resolved `variant` (`effectiveAlign` in the
 *    component), not a static prop value a preset table can hold — an
 *    explicit `align` prop must keep winning over it regardless of WHICH
 *    tier supplied `variant`, which the preset tier cannot express (a
 *    preset entry is a flat value, not a function of another prop's
 *    resolution). Left as component logic, unchanged by this ticket.
 *
 * ## Border — a single logical side via the GLOBAL `border` shorthand
 *
 * `IBorderProps` has no "only `border-inline-start`" primitive: the
 * per-side props (`borderTop` / `borderRight` / `borderBottom` /
 * `borderLeft`) are declared PHYSICAL by design (`border.composable.ts`
 * JSDoc), and `borderBlock` / `borderInline` are declared on the interface
 * but never read by `useBorder` (dead props — a pre-existing DS gap,
 * out of scope for this ticket, flagged in the delivery notes).
 *
 * The GLOBAL `border` shorthand STRING, however, already distributes a
 * 4-value input across LOGICAL sides — `formatBorderStylesVar` (see
 * `border.util.ts`) maps `values[0..3]` to `block-start / inline-start /
 * block-end / inline-end`, the same "Haut/Gauche/Bas/Droite" convention
 * already used by `margin` / `padding` (issue #216). Zeroing the three
 * unused sides therefore expresses "only `border-inline-start`" through
 * the EXISTING documented prop contract — no new mechanism:
 *   `border: '0px 4px 0px 0px'` → inline-start: 4px, everything else: 0.
 * `pull`'s two-side rule uses the 2-value form the same way:
 *   `border: '2px 0px'` → block (top+bottom): 2px, inline: 0.
 *
 * `borderColor` is set to the LITERAL CSS custom-property reference
 * `var(--origam-blockquote---resolved-accent-color)` — the SAME variable
 * the component's `customColorStyles` / `--accent-{intent}` classes
 * already resolve for the accent axis. This is NOT a static color baked
 * into the preset; it is a pointer into the accent-color system the
 * component computes independently of `variant`, so the accent bar keeps
 * tracking `accentColor` / `bgColor` / theme overrides exactly as before.
 * (`borderColor` defaulting to `currentColor` — i.e. the BODY TEXT color —
 * would be a real regression: `color="danger"` + default `accentColor`
 * would paint a red bar instead of the intended accent color.)
 *
 * ## Padding — baked block/inline literals, not the old `calc()` chain
 *
 * The pre-v3 SCSS derived `padding-inline-start` as
 * `calc(var(--resolved-padding-inline) + var(--accent-width))` — i.e. it
 * ADDED to whatever the base padding was. A props preset cannot express
 * "add to the caller's value" (Q2 makes the preset the WEAKEST tier: an
 * explicit `padding` prop at the call site REPLACES the preset entirely,
 * it does not compose with it). The values below are therefore the
 * literal PIXEL RESULT of that calc with zero customisation — i.e. what a
 * fresh install already renders — using the 4-value logical padding
 * shorthand (`formatPaddingStylesVar`, same Haut/Gauche/Bas/Droite order).
 * A consumer who explicitly sets `padding` now gets EXACTLY that value
 * (no hidden `+ accent-width` bump) — an intentional behaviour change per
 * ADR-005 Q2, the same trade-off already accepted for Btn/Kbd.
 *
 * ## Typography — token matches were exact, `fontStyle` was the one gap
 *
 * `fontFamily` / `fontSize` / `fontWeight` / `lineHeight` all had an EXACT
 * existing token matching the old raw CSS value (`1.125rem` ≡ `xl`,
 * `0.875rem` ≡ `md`, `1.5rem` ≡ `3xl`, `2` ≡ `loose`, `1.375` ≡ `snug`,
 * `500` ≡ `medium`, `Georgia…` ≡ `serif`) — no coincidence, the DS scale
 * and the hand-rolled SCSS values were already aligned. `font-style:
 * italic` (elegant, minimal) had NO Commons prop at all — same class of
 * gap as ADR-005 D6's `opacity` / `backdrop-filter` findings on Btn.
 * Per the ADR's own arbitration (Q1: "the sanctioned-exception option was
 * rejected... an exception does not stay singular"), `fontStyle` was
 * added to `ITypographyProps` / `useTypography` (see those files) rather
 * than left as a bespoke `--variant-*` CSS survivor. Flagged prominently
 * in the delivery notes as a shared-interface change made without a
 * separate arbitration round — low risk (additive, optional, mirrors 5
 * sibling props on the same interface) but worth a second pair of eyes.
 */
export const BLOCKQUOTE_VARIANT_PRESETS: TVariantPresets<TBlockquoteVariant, IBlockquoteProps> = {
    default: {
        padding: '16px 28px 16px 24px',
        border: '0px 4px 0px 0px',
        borderColor: 'var(--origam-blockquote---resolved-accent-color)'
    },
    elegant: {
        padding: '24px 28px 24px 24px',
        border: '0px 4px 0px 0px',
        borderColor: 'var(--origam-blockquote---resolved-accent-color)',
        fontFamily: 'serif',
        fontSize: 'xl',
        fontStyle: 'italic',
        lineHeight: 'loose'
    },
    quoted: {
        padding: '32px 24px 16px 24px'
    },
    minimal: {
        padding: '0px 14px 0px 12px',
        border: '0px 2px 0px 0px',
        borderColor: 'var(--origam-blockquote---resolved-accent-color)',
        fontSize: 'md',
        fontStyle: 'italic'
    },
    pull: {
        padding: '24px',
        border: '2px 0px',
        borderColor: 'var(--origam-blockquote---resolved-accent-color)',
        fontFamily: 'serif',
        fontSize: '3xl',
        fontWeight: 'medium',
        lineHeight: 'snug'
    }
}
