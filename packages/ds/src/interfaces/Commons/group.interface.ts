import type { ComponentInternalInstance, ComputedRef, Ref } from 'vue'

/*********************************************************
 * domId (IGroupItem / IGroupProvide.items[number])
 *
 * @description
 * Resolved DOM id of a registered item — `props.id` when the consumer
 * supplied one, a generated fallback otherwise. NOT set by `register()`
 * itself: `useGroupItem` only ever registers `{ id, value, disabled }`. A
 * consumer that needs to expose its OWN resolved DOM id for a sibling to
 * cross-reference (ARIA `aria-controls` / `aria-labelledby` pairing — see
 * `<OrigamTab>` / `<OrigamTabPanel>`, #519-#522) writes it here directly
 * through `group.items`, AFTER registration, from a reactive effect.
 * @description
 * Optional and unused by the group itself — it never reads or depends on
 * this field, so components that don't set it (Btn, Chip, ExpansionPanel,
 * ItemGroupItem, WindowItem) are unaffected.
 ********************************************************/
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
        domId?: string
    }>>
    disabled: Ref<boolean | undefined>
    getItemIndex: (value: unknown) => number
}

export interface IGroupItem {
    id: number
    value: Ref<unknown>
    disabled: Ref<boolean | undefined>
    domId?: string
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
