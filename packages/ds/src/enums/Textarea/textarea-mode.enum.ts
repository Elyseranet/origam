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
