import type { InjectionKey } from 'vue'
import type { IFormProvide } from '../../interfaces/Form/form.interface'

export const ORIGAM_FORM_KEY: InjectionKey<IFormProvide> = Symbol.for('origam:form')
