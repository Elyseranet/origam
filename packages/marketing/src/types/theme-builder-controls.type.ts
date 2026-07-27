import type {
    THEME_BUILDER_BOX_MODEL_MODES,
    THEME_BUILDER_ELEVATION_CUSTOM_MODES
} from '~/consts/theme-builder-controls.const'

/** Box-model link mode for the Padding / Margin control. */
export type TThemeBuilderBoxModelMode = typeof THEME_BUILDER_BOX_MODEL_MODES[number]

/** Elevation "Autre" sub-mode: quick depth slider vs full shadow composer. */
export type TThemeBuilderElevationCustomMode = typeof THEME_BUILDER_ELEVATION_CUSTOM_MODES[number]

/** One edge of the box-model editor (Padding / Margin, "Aucun lien" mode). */
export type TThemeBuilderBoxModelEdge = 'top' | 'left' | 'bottom' | 'right'

/** One corner of the Rounded 4-corner editor. */
export type TThemeBuilderCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

/** One side of the Border per-side width/colour editor. */
export type TThemeBuilderBorderSide = 'top' | 'right' | 'bottom' | 'left'

/** Classification of a raw color prop value in the Color control (Contrôle 1). */
export type TThemeBuilderColorMode = 'inherit' | 'intent' | 'custom'

/** The two tabs of the component controls panel (`ThemeBuilderControls.vue`). */
export type TThemeBuilderTab = 'props' | 'tokens'
