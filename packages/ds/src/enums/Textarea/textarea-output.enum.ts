/**
 * Output format of the rich-text textarea — controls how the editor's
 * DOM is serialised back into the v-model string.
 *
 * - `HTML` emits sanitised HTML (allowlist on tags + attributes + URL
 *   schemes).
 * - `MARKDOWN` emits a CommonMark-flavoured subset (bold, italic, links,
 *   lists, headings, code). `<u>` is preserved verbatim because vanilla
 *   Markdown has no underline syntax.
 */
export enum TEXTAREA_OUTPUT {
    HTML = 'html',
    MARKDOWN = 'markdown'
}
