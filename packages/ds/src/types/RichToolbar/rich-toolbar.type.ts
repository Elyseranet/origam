import type { TEXTAREA_TOOLBAR_COMMAND, TEXTAREA_TOOLBAR_POSITION } from '../../enums'
import { OrigamRichToolbar } from '../../components'

export type TOrigamRichToolbar = InstanceType<typeof OrigamRichToolbar>

export type TTextareaToolbarCommand = `${TEXTAREA_TOOLBAR_COMMAND}`

export type TTextareaToolbarPosition = `${TEXTAREA_TOOLBAR_POSITION}`
