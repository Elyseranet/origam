import type { IGroupProvide } from '../../interfaces/Commons/group.interface'

import type { InjectionKey } from "vue"

export const ORIGAM_SLIDE_GROUP_KEY: InjectionKey<IGroupProvide> = Symbol.for('origam:slide-group')
