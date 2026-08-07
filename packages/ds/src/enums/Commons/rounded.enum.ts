/**
 * Predefined corner-radius variants. Mirrors the origam-design-system
 * taxonomy so consumers can swap design systems without re-learning the
 * `rounded` API. Each value is also a class suffix
 * (`origam-btn--rounded-large`) and maps 1:1 to a token rung in
 * `tokens/primitive.json` under `radius.*`.
 */
export enum ROUNDED {
    X_SMALL = 'x-small',
    SMALL = 'small',
    DEFAULT = 'default',
    MEDIUM = 'medium',
    LARGE = 'large',
    X_LARGE = 'x-large',
    SHAPED = 'shaped',
    SHAPED_INVERT = 'shaped-invert'
}

/**
 * The token-scale rungs, resolved by `useRounded` to the generated utility
 * classes (`.origam--rounded-full` → `var(--origam-radius---full)`).
 *
 * They were always accepted at runtime — the brand themes have shipped
 * `rounded: 'md'` / `'lg'` / `'none'` for a while — but `TRounded` only
 * described the component scale above, so TypeScript rejected them and they
 * were invisible to autocompletion. `FULL` in particular is the only way to
 * obtain a circle, which made a round avatar undiscoverable: none of the
 * component-scale names produces one.
 *
 * Declared as a separate enum rather than merged into `ROUNDED` because the
 * two scales are different things — `ROUNDED` names an intent (`shaped`),
 * this one names a radius rung — and merging them would suggest
 * `x-small` and `xs` are interchangeable. They are not.
 */
export enum ROUNDED_TOKEN {
    NONE = 'none',
    XS = 'xs',
    SM = 'sm',
    MD = 'md',
    LG = 'lg',
    XL = 'xl',
    FULL = 'full'
}
