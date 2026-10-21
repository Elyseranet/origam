import { FONT_FAMILY } from '../../enums/Commons/font-family.enum'

/**
 * Font-family token keys (map to `--origam-font__family---{key}`):
 *   sans (Inter / Helvetica Neue / Arial) · mono (JetBrains Mono / Fira Code) · serif (Georgia / Times New Roman) · display (= sans unless themed)
 */
export type TFontFamily = `${FONT_FAMILY}`
