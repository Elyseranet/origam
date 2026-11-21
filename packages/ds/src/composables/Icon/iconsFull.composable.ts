import { MDI_ALIASES } from '../../consts/Commons/mdi.const'
import type { TIconOptions } from '../../types/Icon/icon.type'
import { mergeDeep } from '../../utils/Commons/commons.util'

import { createIconsCore } from './icon.composable'

/*********************************************************
 * createIcons
 *
 * @description
 * Icon configuration provided by `createOrigam()`: default set, available sets
 * and aliases, with the MDI aliases pre-loaded so `icon="mdi-account"` works
 * with no setup. Consumer options are deep-merged over the DS values.
 *
 * @description
 * (#1392) Lives apart from `useIcon` on purpose: it reaches `MDI_ALIASES` (the
 * ~7 000-entry `MDI_ICONS` enum, ~430 Kio). In `icon.composable.ts`, every
 * component importing `useIcon` (Btn, Avatar, Chip...) pulled the enum in
 * through the module graph, icon or not.
 ********************************************************/
export function createIcons (options?: TIconOptions) {
    return createIconsCore(mergeDeep({aliases: MDI_ALIASES}, options))
}
