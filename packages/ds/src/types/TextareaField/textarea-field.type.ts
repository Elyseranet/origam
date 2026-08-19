import type { TEXTAREA_MODE, TEXTAREA_OUTPUT } from '../../enums/TextareaField/textarea-field.enum'
import OrigamTextareaField from '../../components/TextareaField/OrigamTextareaField.vue'

export type TOrigamTextareaField = InstanceType<typeof OrigamTextareaField>


export type TTextareaMode = `${TEXTAREA_MODE}`

export type TTextareaOutput = `${TEXTAREA_OUTPUT}`
