export enum DATATABLE_SELECT_STRATEGY {
    SINGLE = 'single',
    PAGE = 'page',
    ALL = 'all'
}

/*********************************************************
 * DATATABLE_SKELETON_CELL
 *
 * @description
 * Silhouette a placeholder cell draws, derived from the COLUMN it belongs
 * to (the table has no column "type"; its descriptor only carries `align`
 * and the reserved `data-table-select` / `data-table-expand` keys).
 * `text` is a bar from the start edge, `end` a shorter bar flush with the
 * end edge (numbers, amounts), `control` a small square (checkbox,
 * expand chevron).
 ********************************************************/
export enum DATATABLE_SKELETON_CELL {
    TEXT = 'text',
    END = 'end',
    CONTROL = 'control'
}
