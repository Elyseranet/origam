import OrigamDatePicker from '../../components/DatePicker/OrigamDatePicker.vue'

import { DATE_MODE } from '../../enums/DatePicker/date-picker.enum'

export type TDateMode = `${DATE_MODE}`

export type TOrigamDatePicker = InstanceType<typeof OrigamDatePicker>
