import type { IComponentDefinition } from '../Catalog/component-definition.interface'

/*********************************************************
 * IPlaygroundDrawerProps
 ********************************************************/
export interface IPlaygroundDrawerProps {
    /** Whether the drawer is open. */
    modelValue: boolean
    /** The catalogue to list and search. */
    components: IComponentDefinition[]
    /** The element to return focus to on close — the button that opened it. */
    returnFocusTo?: HTMLElement | null
}

export interface IPlaygroundDrawerEmits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'select', name: string): void
}
