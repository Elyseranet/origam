/**
 * Render mode for `OrigamTextareaField`.
 *
 * - `PLAIN` keeps the legacy `<textarea>` element + the historical
 *   v-model contract (raw string).
 * - `RICH` swaps the textarea for a `contenteditable` surface wrapped by
 *   the standard Field shell. The v-model becomes sanitised HTML (or
 *   Markdown, depending on the `output` prop).
 */
export enum TEXTAREA_MODE {
    PLAIN = 'plain',
    RICH = 'rich'
}

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
