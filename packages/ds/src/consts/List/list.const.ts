import { ComputedRef, InjectionKey, Ref } from 'vue'

export const ORIGAM_LIST_KEY: InjectionKey<{
    hasPrepend: Ref<boolean>
    updateHasPrepend: (value: ComputedRef<boolean>) => void
    hasAppend: Ref<boolean>
    updateHasAppend: (value: ComputedRef<boolean>) => void
}> = Symbol.for('origam:list')
