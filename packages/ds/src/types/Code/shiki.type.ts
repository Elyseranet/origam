/**
 * The slice of shiki's highlighter API that `useCode()` actually calls.
 *
 * `shiki` is an OPTIONAL peer dependency, so the DS must not `import
 * type` from it — that would make `shiki`'s own types a hard build
 * requirement for every consumer, including those who never install it.
 * Declaring the one method we use keeps the dynamic-import fallback
 * path type-safe with zero dependency on the package being present.
 *
 * Kept in its own file (rather than `code.type.ts`) because
 * `code.type.ts` imports from `src/components` for its `InstanceType`
 * aliases, and the code composable has no business pulling the
 * component graph in just to type a highlighter.
 */
export type TShikiHighlighter = {
    codeToHtml: (code: string, opts: {
        lang: string
        themes?: { light: string, dark: string }
        defaultColor?: false | string
    }) => string
}
