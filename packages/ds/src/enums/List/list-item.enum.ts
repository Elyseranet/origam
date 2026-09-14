export enum LIST_ITEM_TYPE {
    ITEM = 'item',
    SUBHEADER = 'subheader',
    DIVIDER = 'divider'
}

/*********************************************************
 * LIST_ITEM_ROLE
 *
 * @description
 * Row counterpart of `LIST_ROLE`: an `option` is only valid inside a
 * `listbox`, a `listitem` only inside a `list`. The row never picks its
 * own role — it reads the mode its list published through
 * `ORIGAM_LIST_KEY`.
 ********************************************************/
export enum LIST_ITEM_ROLE {
    LISTITEM = 'listitem',
    OPTION = 'option'
}
