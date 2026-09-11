/**
 * Canonical SCREAMING_SNAKE option sets for Histoire `HstSelect` controls.
 *
 * This is the migration target for the story-format redesign: stories should
 * import `*_OPTIONS` from here. The legacy `*List` exports remain available
 * (re-aliased below) until every story is migrated, after which the `*List`
 * names are removed.
 */
export {
    variantList as VARIANT_OPTIONS,
    variantInputList as VARIANT_INPUT_OPTIONS
} from './variant.const'

export { intentList as COLOR_OPTIONS } from './intent.const'
export { sizeList as SIZE_OPTIONS } from './size.const'
export { densityList as DENSITY_OPTIONS } from './density.const'
export { roundedList as ROUNDED_OPTIONS } from './rounded.const'
export { elevationList as ELEVATION_OPTIONS } from './elevation.const'
export { iconList as ICON_OPTIONS } from './icon.const'
export { tagList as TAG_OPTIONS } from './tag.const'
export { localeList as LOCALE_OPTIONS } from './locale.const'
export { imgPositionList as IMG_POSITION_OPTIONS } from './img-position.const'
export { borderList as BORDER_OPTIONS, borderStyleList as BORDER_STYLE_OPTIONS } from './border.const'
export {
    fontFamilyList as FONT_FAMILY_OPTIONS,
    fontSizeList as FONT_SIZE_OPTIONS,
    fontWeightList as FONT_WEIGHT_OPTIONS,
    lineHeightList as LINE_HEIGHT_OPTIONS,
    letterSpacingList as LETTER_SPACING_OPTIONS
} from './font.const'

export { alignList as ALIGN_OPTIONS } from './align.const'
export { colsList as COLS_OPTIONS } from './cols.const'
export { justifyList as JUSTIFY_OPTIONS } from './justify.const'
export { positionList as POSITION_OPTIONS } from './position.const'
export { progressTypeList as PROGRESS_TYPE_OPTIONS } from './progress.const'
export { colorList as COLOR_RAW_OPTIONS } from './color.const'
export { intentList as INTENT_OPTIONS } from './intent.const'

import { STATUS, STATUS_POSITION } from '@origam/enums'
import type { IOptions } from '@origam/interfaces'
import type { TStatus, TStatusPosition } from '@origam/types'

export const STATUS_OPTIONS: Array<IOptions<TStatus | undefined>> = [
    { label: '(none)', value: undefined },
    { label: 'Success', value: STATUS.SUCCESS },
    { label: 'Info', value: STATUS.INFO },
    { label: 'Warning', value: STATUS.WARNING },
    { label: 'Error', value: STATUS.ERROR }
]

export const STATUS_POSITION_OPTIONS: Array<IOptions<TStatusPosition>> = [
    { label: 'Prepend', value: STATUS_POSITION.PREPEND },
    { label: 'Append', value: STATUS_POSITION.APPEND },
    { label: 'Replace', value: STATUS_POSITION.REPLACE },
    { label: 'Both', value: STATUS_POSITION.BOTH }
]
