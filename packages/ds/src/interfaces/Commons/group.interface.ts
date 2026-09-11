import type { ComponentInternalInstance, ComputedRef, Ref } from 'vue'

export interface IGroupProvide {
    register: (item: IGroupItem, cmp: ComponentInternalInstance) => void
    unregister: (id: number) => void
    select: (id: number, value: boolean) => void
    selected: Ref<Readonly<Array<number>>>
    isSelected: (id: number) => boolean
    prev: () => void
    next: () => void
    selectedClass: Ref<string | undefined>
    items: ComputedRef<Array<{
        id: number
        value: unknown
        disabled: boolean | undefined
    }>>
    disabled: Ref<boolean | undefined>
    getItemIndex: (value: unknown) => number
}

export interface IGroupItem {
    id: number
    value: Ref<unknown>
    disabled: Ref<boolean | undefined>
}

export interface IGroupProps {
    disabled?: boolean
    modelValue?: any
    multiple?: boolean
    mandatory?: boolean
    max?: number
    selectedClass?: string
}

export interface IGroupItemProps {
    value?: any
    disabled?: boolean
    selectedClass?: string
}

export interface IGroupItemProvide {
    id: number
    isSelected: Ref<boolean>
    toggle: () => void
    select: (value: boolean) => void
    selectedClass: Ref<Array<(string | undefined)> | false>
    value: Ref<unknown>
    disabled: Ref<boolean | undefined>
    group: IGroupProvide
}

/** Emit signature for components that are part of a selectable group. */
export interface IGroupEmits {
    (e: 'group:selected', value: { value: boolean }): void
}
