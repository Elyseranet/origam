import type {
    TGridAutoFlow,
    TGridGapSize,
    TGridPlaceContent,
    TGridPlaceItems,
    TGridPlaceSelf
} from '../../types'

/**
 * Closed list of valid `gap` token values for `<OrigamGrid>`. Exposed
 * so stories / consumers can iterate the matrix (e.g. for a `HstSelect`)
 * without duplicating string literals.
 */
export const GRID_GAP_SIZES: ReadonlyArray<TGridGapSize> = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl'
]

/**
 * Closed list of valid `autoFlow` values.
 */
export const GRID_AUTO_FLOWS: ReadonlyArray<TGridAutoFlow> = [
    'row',
    'column',
    'row dense',
    'column dense'
]

/**
 * Closed list of valid `alignItems` / `justifyItems` / `alignSelf` /
 * `justifySelf` values.
 */
export const GRID_PLACE_ITEMS: ReadonlyArray<TGridPlaceItems> = [
    'start',
    'center',
    'end',
    'stretch'
]

/** Alias of `GRID_PLACE_ITEMS` for the GridItem `*-self` axis. */
export const GRID_PLACE_SELF: ReadonlyArray<TGridPlaceSelf> = GRID_PLACE_ITEMS

/**
 * Closed list of valid `alignContent` / `justifyContent` values.
 */
export const GRID_PLACE_CONTENT: ReadonlyArray<TGridPlaceContent> = [
    'start',
    'center',
    'end',
    'stretch',
    'space-between',
    'space-around',
    'space-evenly'
]

/**
 * Maps the gap-size tokens to the matching CSS custom property emitted
 * by Style Dictionary from `tokens/component/grid.json`.
 *
 * Why expose this map rather than build the var name on the fly? Two
 * reasons:
 * 1. Single source of truth — if a token gets renamed, this map and
 *    the SCSS reference move together.
 * 2. Type-narrowing — TS guarantees that every member of `TGridGapSize`
 *    has a matching entry.
 */
export const GRID_GAP_SIZE_VAR: Readonly<Record<TGridGapSize, string>> = {
    xs: 'var(--origam-grid---gap-xs)',
    sm: 'var(--origam-grid---gap-sm)',
    md: 'var(--origam-grid---gap-md)',
    lg: 'var(--origam-grid---gap-lg)',
    xl: 'var(--origam-grid---gap-xl)'
}

/**
 * Default values used by both `<OrigamGrid>` and its sub-component.
 * Duplicated here so consumers can reference them when authoring their
 * own wrappers without re-importing the component.
 */
export const GRID_DEFAULTS = {
    columns: 'auto' as string,
    rows: 'auto' as string,
    gap: 'md' as TGridGapSize,
    autoFlow: 'row' as TGridAutoFlow,
    alignItems: 'stretch' as TGridPlaceItems,
    justifyItems: 'stretch' as TGridPlaceItems,
    inline: false,
    tag: 'div'
} as const
