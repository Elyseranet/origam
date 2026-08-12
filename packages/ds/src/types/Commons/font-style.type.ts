/**
 * Font-style CSS keyword. Unlike the other `ITypographyProps` members
 * (`fontFamily` / `fontSize` / `fontWeight` / `lineHeight` /
 * `letterSpacing`), this is NOT a primitive-token lookup — there is no
 * `--origam-font__style---*` ramp in the token pipeline, because `italic` /
 * `oblique` / `normal` are the entire value space; a scale would add
 * indirection with nothing to scale. `useTypography` therefore writes the
 * literal keyword straight to the component CSS variable, the same way
 * `useBorder` writes `borderStyle` verbatim.
 */
export type TFontStyle = 'normal' | 'italic' | 'oblique'
