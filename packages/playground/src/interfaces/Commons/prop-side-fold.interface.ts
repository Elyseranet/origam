/*********************************************************
 * IPropSideFoldAxis
 *
 * @description
 * One labelled bucket of side/corner declinations folded under a root prop
 * row — "Largeur — côtés physiques" under `border`, "Bornes" under `height`.
 ********************************************************/
export interface IPropSideFoldAxis {
    /** Human-facing label for this bucket of declinations. */
    label: string
    /** The declined prop names this bucket folds, e.g. `borderTop`, `borderLeft`. */
    names: string[]
}
