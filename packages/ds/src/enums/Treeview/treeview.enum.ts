/**
 * Selection mode for `<OrigamTreeview>` — `NONE` disables selection
 * entirely, `SINGLE` allows one selected node at a time, `MULTIPLE`
 * allows any number (drives `aria-multiselectable`).
 */
export enum TREEVIEW_SELECT_MODE {
    SINGLE = 'single',
    MULTIPLE = 'multiple',
    NONE = 'none'
}

/**
 * Which nodes are eligible for selection. `LEAF` restricts selection
 * to nodes without children; `ALL` allows branch nodes too.
 */
export enum TREEVIEW_SELECTABLE_NODES {
    LEAF = 'leaf',
    ALL = 'all'
}
