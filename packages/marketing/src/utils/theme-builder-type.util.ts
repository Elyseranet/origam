import {
    THEME_BUILDER_COLOR_TYPE_HINTS,
    THEME_BUILDER_SKIP_INTERFACE_REF,
    THEME_BUILDER_SKIP_TYPE_HINTS
} from '~/consts/theme-builder-groups.const'

/** A prop type label that references data / callbacks / objects is non-themable. */
export function isThemeBuilderSkippableType (label: string): boolean {
    return THEME_BUILDER_SKIP_INTERFACE_REF.test(label)
        || THEME_BUILDER_SKIP_TYPE_HINTS.some(hint => label.includes(hint))
}

/** Whether a prop type label denotes a colour value → swatch input. */
export function isThemeBuilderColorType (label: string): boolean {
    return THEME_BUILDER_COLOR_TYPE_HINTS.some(hint => label.includes(hint))
}
