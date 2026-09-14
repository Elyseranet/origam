import type { InjectionKey } from "vue"
import type { IGoToInstance } from '../../interfaces/Commons/goTo.interface'

export const ORIGAM_GO_TO_KEY: InjectionKey<IGoToInstance> = Symbol.for('origam:goto')
