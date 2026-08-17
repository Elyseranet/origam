import { CODE_LANG, CODE_THEME } from '../../enums'
import { OrigamCode } from '../../components'

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
