import OrigamToolbar from '../../components/Toolbar/OrigamToolbar.vue'
import { SCROLL_BEHAVIOR } from '../../enums/Toolbar/toolbar.enum'

export type TScrollBehavior = `${SCROLL_BEHAVIOR}`

export type TOrigamToolbar = InstanceType<typeof OrigamToolbar>
