/**
 * Identifies each action button rendered by `<OrigamInlineEdit>` when
 * `showActions` is true. Used internally to build `data-cy` attributes
 * and ARIA labels — never used as a magic string directly in a component.
 */
export enum INLINE_EDIT_ACTION {
    EDIT     = 'edit',
    CONFIRM  = 'confirm',
    CANCEL   = 'cancel'
}
