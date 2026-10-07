import { CODE_LANG, CODE_THEME } from '../../enums/Code/code.enum'
import OrigamCode from '../../components/Code/OrigamCode.vue'

export type TOrigamCode = InstanceType<typeof OrigamCode>

export type TCodeLang = `${CODE_LANG}`

export type TCodeTheme = `${CODE_THEME}`

/**
 * The slice of shiki's highlighter API that `useCode()` actually calls.
 *
 * `shiki` is an OPTIONAL peer dependency, so the DS must not `import
 * type` from it — that would make shiki's own types a hard build
 * requirement for every consumer, including those who never install it.
 * Declaring the one method we use keeps the dynamic-import fallback
 * path type-safe with zero dependency on the package being present.
 */
export type TShikiHighlighter = {
    codeToHtml: (code: string, opts: {
        lang: string
        themes?: { light: string, dark: string }
        defaultColor?: false | string
    }) => string
}

/*********************************************************
 * TShikiModule / TShikiHighlighterLoader
 *
 * @description
 * `TShikiModule` is the slice of a shiki-COMPATIBLE MODULE that `useCode()`
 * needs to build a highlighter — i.e. what `import('shiki')` (the DS's own
 * default) or an app-supplied alternative must resolve to. Deliberately
 * minimal, for the same reason `TShikiHighlighter` is: an app that wants to
 * avoid shiki's WASM-loader chunk (see `code.composable.ts`'s
 * `loadHighlighter()`) can hand `createOrigam({ code: { highlighter } })`
 * a loader resolving to `shiki/core` + a regex engine — or any other
 * module — as long as it exposes this one method. `shiki`'s own
 * `createHighlighter` satisfies this type structurally; no cast needed on
 * the consumer side.
 *
 * @description
 * `TShikiHighlighterLoader` is the function shape an app passes as
 * `createOrigam({ code: { highlighter } })` to supply that module instead
 * of the DS's default `import('shiki')`. See `code.composable.ts`'s
 * `loadHighlighter()` for how this branches the dynamic-import path, and
 * `ICodeOptions` for the option itself.
 ********************************************************/
export type TShikiModule = {
    createHighlighter: (opts: {
        themes: ReadonlyArray<string>
        langs: ReadonlyArray<string>
    }) => Promise<TShikiHighlighter>
}

export type TShikiHighlighterLoader = () => Promise<TShikiModule>
