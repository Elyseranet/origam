/**
 * Where the rich-text toolbar is rendered relative to the editable
 * surface. `FLOATING` pins it to the viewport via `position: sticky`
 * inside the Field shell so it stays visible while the surface scrolls.
 */
export enum TEXTAREA_TOOLBAR_POSITION {
    TOP = 'top',
    BOTTOM = 'bottom',
    FLOATING = 'floating'
}
