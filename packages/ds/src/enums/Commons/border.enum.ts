export enum BORDER_STYLE {
    NONE = 'none',
    HIDDEN = 'hidden',
    DOTTED = 'dotted',
    DASHED = 'dashed',
    SOLID = 'solid',
    DOUBLE = 'double',
    GROOVE = 'groove',
    RIDGE = 'ridge',
    INSET = 'inset',
    OUTSET = 'outset'
}

/**
 * CSS logical border axes (`border-block` / `border-inline`), as opposed
 * to the PHYSICAL per-side directions (`BLOCK` + `INLINE` in
 * `anchor.enum.ts` = top/bottom/left/right).
 */
export enum BORDER_LOGICAL_AXIS {
    BLOCK = 'block',
    INLINE = 'inline'
}
