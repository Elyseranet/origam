import { OPEN_STRATEGY, SELECT_STRATEGY, SELECTED } from '../../enums'

import { Ref } from 'vue'

export type TSelectStrategy = `${SELECT_STRATEGY}`

export type TSelectStrategyFn = (data: {
    id: unknown
    value: boolean
    selected: Map<unknown, `${SELECTED}`>
    children: Map<unknown, Array<unknown>>
    parents: Map<unknown, unknown>
    event?: Event
}) => Map<unknown, `${SELECTED}`>

export type TOpenStrategy = `${OPEN_STRATEGY}`

export type TOpenStrategyFns = {
    open: TOpenStrategyFn
    select: TOpenSelectStrategyFn
}

export type TOpenStrategyFn = (data: {
    id: unknown
    value: boolean
    opened: Set<unknown>
    children: Map<unknown, Array<unknown>>
    parents: Map<unknown, unknown>
    event?: Event
}) => Set<unknown>

export type TOpenSelectStrategyFn = (data: {
    id: unknown
    value: boolean
    opened: Set<unknown>
    selected: Map<unknown, `${SELECTED}`>
    children: Map<unknown, Array<unknown>>
    parents: Map<unknown, unknown>
    event?: Event
}) => Set<unknown> | null

export type TStrategySelect = {
    select: TSelectStrategyFn
    in: TSelectStrategyTransformInFn
    out: TSelectStrategyTransformOutFn
}

export type TSelectStrategyTransformInFn = (
    v: Readonly<Array<unknown> | undefined>,
    children: Map<unknown, Array<unknown>>,
    parents: Map<unknown, unknown>
) => Map<unknown, `${SELECTED}`>

export type TSelectStrategyTransformOutFn = (
    v: Map<unknown, `${SELECTED}`>,
    children: Map<unknown, Array<unknown>>,
    parents: Map<unknown, unknown>
) => Array<unknown>

export type TStrategyOpen = {
    open: TOpenStrategyFn
    select: TOpenSelectStrategyFn
}

export type TNestedProvide = {
    id: Ref<unknown>
    isGroupActivator?: boolean
    root: {
        children: Ref<Map<unknown, Array<unknown>>>
        parents: Ref<Map<unknown, unknown>>
        opened: Ref<Set<unknown>>
        selected: Ref<Map<unknown, `${SELECTED}`>>
        selectedValues: Ref<Array<unknown>>
        register: (id: unknown, parentId: unknown, isGroup?: boolean) => void
        unregister: (id: unknown) => void
        open: (id: unknown, value: boolean, event?: Event) => void
        select: (id: unknown, value: boolean, event?: Event) => void
        openOnSelect: (id: unknown, value: boolean, event?: Event) => void
    }
}
