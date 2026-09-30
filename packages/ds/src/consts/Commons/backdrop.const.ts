/*********************************************************
 * BACKDROP_BLUR_RUNG_VARS
 *
 * @description
 * The primitive blur ladder, mapped to the `var()` expression
 * `useBackdrop` wraps in `blur(...)`. Keys are the rung names as they
 * appear in the token suffix and in the utility class.
 *
 * @description
 * ⛔ WHOLE LITERAL STRINGS, same reason as `OPACITY_RUNG_VARS`: the
 * dormant direction of `token-var-channels` greps `.ts` sources for the
 * literal `var(--origam-…)` text, and these five tokens have NO other
 * reader in the repo yet — no component consumes `useBackdrop` until
 * ADR-005's lot 4 converts `ghost`. Concatenating the name would make all
 * five read as dormant and turn the guard red on a correct change.
 *
 * @description
 * RUNG VALUES ARE MEASURED, NOT INVENTED. Counted over the `blur(Npx)`
 * literals in `packages/ds/src` + `packages/marketing/src`:
 * `8px` x25, `16px` x21, `6px` x17, `20px` x14, `24px` x7, `12px` x7,
 * `28px` x5. The five rungs below sit on that distribution rather than on
 * a tidy doubling, which is why `sm` is `6px` and not `4px`.
 ********************************************************/
export const BACKDROP_BLUR_RUNG_VARS: Readonly<Record<string, string>> = {
    xs: 'var(--origam-blur---xs, 4px)',
    sm: 'var(--origam-blur---sm, 6px)',
    md: 'var(--origam-blur---md, 8px)',
    lg: 'var(--origam-blur---lg, 16px)',
    xl: 'var(--origam-blur---xl, 24px)'
}

/*********************************************************
 * BACKDROP_BLUR_DEFAULT_RUNG
 *
 * @description
 * Rung used when `backdropBlur` is passed as a bare `true`.
 *
 * @description
 * `md` is `8px`, which is both the most frequent blur literal in the repo
 * and the exact value `OrigamBtn`'s `ghost` rule paints today
 * (`backdrop-filter: var(--origam-btn---backdrop-filter-ghost, blur(8px))`).
 * ADR-005 lot 4 can therefore convert `ghost` to `backdropBlur: 'md'`
 * with no rendering change to justify.
 ********************************************************/
export const BACKDROP_BLUR_DEFAULT_RUNG = 'md'

/*********************************************************
 * BACKDROP_UTILITY_CLASS_PREFIX
 *
 * @description
 * Root of the global backdrop utility classes emitted by `useBackdrop`
 * (`.origam--backdrop-blur-md`, ...). Declared in
 * `src/assets/css/tokens/origam-utilities.css`.
 ********************************************************/
export const BACKDROP_UTILITY_CLASS_PREFIX = 'origam--backdrop-blur-'
