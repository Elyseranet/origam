import { TAB_VARIANT } from '../../enums/Tabs/tab.enum'
import OrigamTab from '../../components/Tabs/OrigamTab.vue'

export type TTabVariant = `${TAB_VARIANT}`

export type TOrigamTab = InstanceType<typeof OrigamTab>
