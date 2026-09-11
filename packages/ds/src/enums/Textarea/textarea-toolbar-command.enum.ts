/**
 * Identifiers for every rich-text toolbar command. These strings drive
 * the toolbar `*Props` contract, the `format` emit payload and the
 * keyboard shortcut map. Keep them in sync with `DEFAULT_TOOLBAR` and
 * the `useTextareaRich` composable's command switch.
 */
export enum TEXTAREA_TOOLBAR_COMMAND {
    BOLD = 'bold',
    ITALIC = 'italic',
    UNDERLINE = 'underline',
    LINK = 'link',
    LIST_BULLET = 'list-bullet',
    LIST_ORDERED = 'list-ordered',
    HEADING_1 = 'heading-1',
    HEADING_2 = 'heading-2',
    HEADING_3 = 'heading-3',
    HEADING = 'heading',
    CODE_INLINE = 'code-inline',
    CLEAR_FORMAT = 'clear-format'
}
