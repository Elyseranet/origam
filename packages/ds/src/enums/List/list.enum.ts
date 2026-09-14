export enum LINES {
    ONE = 'one',
    TWO = 'two',
    THREE = 'three'
}

/*********************************************************
 * LIST_ROLE
 *
 * @description
 * The two ARIA roles `<OrigamList>` can legitimately carry. `listbox`
 * is a SELECTION widget — it promises `option` children carrying
 * `aria-selected`, and a screen reader announces it as such. A
 * navigation list, a list of subheaders and dividers, or a menu's item
 * list is none of that, so it announces `list` instead.
 * @description
 * See `LIST_ITEM_ROLE` for the matching row roles: the pair is chosen
 * once, by the list, and published to its rows — the container and its
 * rows can never disagree.
 ********************************************************/
export enum LIST_ROLE {
    LIST = 'list',
    LISTBOX = 'listbox'
}
