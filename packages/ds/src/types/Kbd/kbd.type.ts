import OrigamKbd from '../../components/Kbd/OrigamKbd.vue'
import { KBD_VARIANT } from '../../enums/Kbd/kbd.enum'

export type TKbdVariant = `${KBD_VARIANT}`

export type TOrigamKbd = InstanceType<typeof OrigamKbd>
