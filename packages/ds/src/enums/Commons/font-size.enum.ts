/**
 * Font-size token keys. Map to `--origam-font__size---{key}`:
 * xs 0.625rem · sm 0.75rem · md 0.875rem · lg 1rem · xl 1.125rem ·
 * 2xl 1.25rem · 3xl 1.5rem · 4xl 1.875rem · 5xl 2.25rem
 *
 * The four largest rungs are named `XL_2` … `XL_5` rather than `2XL` …
 * `5XL` because a TypeScript identifier cannot start with a digit. The
 * emitted VALUES are the canonical token keys (`'2xl'`, …) — only the
 * member identifiers carry the reordering.
 */
export enum FONT_SIZE {
    XS = 'xs',
    SM = 'sm',
    MD = 'md',
    LG = 'lg',
    XL = 'xl',
    XL_2 = '2xl',
    XL_3 = '3xl',
    XL_4 = '4xl',
    XL_5 = '5xl'
}
