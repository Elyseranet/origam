import type { TTextareaToolbarCommand } from '../../types'

/**
 * Returned shape of the `useTextareaRich` composable. Components consume
 * the public surface (refs + handlers) to render the contenteditable
 * editor and bind the toolbar.
 */
export interface IUseTextareaRichOptions {
    /**
     * Whether the editor surface is currently editable. Bound to the
     * `contenteditable` attribute downstream.
     */
    readonly disabled: () => boolean

    /**
     * Initial / external HTML value (already sanitised by the host
     * component when running in `output="html"` mode).
     */
    readonly value: () => string

    /**
     * Sanitised HTML emit handler. Fired whenever the editor mutates.
     */
    readonly onUpdate: (raw: string) => void

    /**
     * Notified each time a toolbar command runs.
     */
    readonly onFormat: (command: TTextareaToolbarCommand, value?: string) => void
}

/**
 * Reactive state describing which toolbar commands are currently active
 * at the caret position. Used by the toolbar to render the
 * `aria-pressed` state and the visual active class.
 */
export interface ITextareaRichActiveState {
    bold: boolean
    italic: boolean
    underline: boolean
    code: boolean
    link: boolean
    listBullet: boolean
    listOrdered: boolean
    heading: 0 | 1 | 2 | 3
}
