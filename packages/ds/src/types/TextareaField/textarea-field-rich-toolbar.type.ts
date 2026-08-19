import type { TEXTAREA_TOOLBAR_COMMAND, TEXTAREA_TOOLBAR_POSITION } from '../../enums/TextareaField/textarea-field-rich-toolbar.enum'
import OrigamTextareaFieldRichToolbar from '../../components/TextareaField/OrigamTextareaFieldRichToolbar.vue'

export type TOrigamTextareaFieldRichToolbar = InstanceType<typeof OrigamTextareaFieldRichToolbar>

export type TTextareaToolbarCommand = `${TEXTAREA_TOOLBAR_COMMAND}`

export type TTextareaToolbarPosition = `${TEXTAREA_TOOLBAR_POSITION}`
