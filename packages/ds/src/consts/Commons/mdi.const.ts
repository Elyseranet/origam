import { MDI_ICONS } from '../../enums'
import type { IIconAliases } from '../../interfaces/Icon/icon.interface'

import { MDI_CORE_ALIASES } from './mdi-core.const'

export { MDI } from './mdi-core.const'

export const MDI_ALIASES: IIconAliases = {
    ...MDI_ICONS,
    ...MDI_CORE_ALIASES
}
