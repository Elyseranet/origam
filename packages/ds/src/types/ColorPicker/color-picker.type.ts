import OrigamColorPicker from '../../components/ColorPicker/OrigamColorPicker.vue'

import { COLOR_MODES_NAMES } from '../../enums/ColorPicker/color-picker.enum'

export type TColorModes = `${COLOR_MODES_NAMES}`

export type TOrigamColorPicker = InstanceType<typeof OrigamColorPicker>
