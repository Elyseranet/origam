import type { TFontFamily, TFontSize, TFontWeight, TLetterSpacing, TLineHeight } from '../../types'

/**
 * Cross-cutting typography surface — the font equivalent of
 * `IColorProps` / `IBorderProps` / `IMarginProps`. Every prop is optional
 * and maps a primitive font token key to the matching component CSS
 * variable via `useTypography`. When a prop is unset the component keeps
 * its theme value (no override emitted).
 *
 * | Prop            | CSS property      | Primitive token group        |
 * |-----------------|-------------------|------------------------------|
 * | `fontFamily`    | `font-family`     | `--origam-font__family---*`        |
 * | `fontSize`      | `font-size`       | `--origam-font__size---*`          |
 * | `fontWeight`    | `font-weight`     | `--origam-font__weight---*`        |
 * | `lineHeight`    | `line-height`     | `--origam-font__lineHeight---*`    |
 * | `letterSpacing` | `letter-spacing`  | `--origam-font__letterSpacing---*` |
 *
 * Collision-free names by design: `fontSize` / `fontWeight` / `fontFamily`
 * (not `size` / `weight` / `family`) so the surface composes with
 * `ISizeProps.size` on Btn / Chip / Avatar / Kbd without clashing.
 */
export interface ITypographyProps {
    /**
     * Font family token. Maps to `--origam-font__family---{fontFamily}`
     * (sans · mono · serif).
     * When unset, the component keeps its theme font-family.
     */
    fontFamily?: TFontFamily
    /**
     * Font size token. Maps to `--origam-font__size---{fontSize}`
     * (xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl).
     * When unset, the component keeps its theme / density font-size.
     */
    fontSize?: TFontSize
    /**
     * Font weight token. Maps to `--origam-font__weight---{fontWeight}`
     * (regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900).
     * When unset, the component keeps its theme font-weight.
     */
    fontWeight?: TFontWeight
    /**
     * Line-height token. Maps to `--origam-font__lineHeight---{lineHeight}`
     * (none 1 · tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625 · loose 2).
     * When unset, the component keeps its theme line-height.
     */
    lineHeight?: TLineHeight
    /**
     * Letter-spacing token. Maps to `--origam-font__letterSpacing---{letterSpacing}`
     * (tight -0.025em · normal 0em · wide 0.0094em · wider 0.0125em · widest 0.0893em).
     * When unset, the component keeps its theme letter-spacing.
     */
    letterSpacing?: TLetterSpacing
}
