import type { IGroupProvide } from "../../interfaces";

import type { InjectionKey } from "vue"

export const ORIGAM_SLIDE_GROUP_KEY: InjectionKey<IGroupProvide> = Symbol.for('origam:slide-group')
