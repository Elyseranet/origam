import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IGroupItemProps,
    IGroupProps,
    IGroupProvide,
    ITagProps
} from '../../interfaces'

/**
 * Props for `<OrigamItemGroup>` — the renderless selection container.
 * Mirrors `IBtnToggleProps` minus the visual mixins (this group has
 * no chrome of its own).
 *
 * `tag` is explicitly redeclared here even though it lives on
 * `ITagProps`. Vue 3's `defineProps<I>()` doesn't always extract
 * inherited props from extends chains when the local interface body
 * is empty — leaving consumers with `[Vue warn]: Property "tag" was
 * accessed during render but is not defined on instance`. Shadowing
 * the same property locally forces the runtime prop registration.
 */
export interface IItemGroupProps extends ICommonsComponentProps, ITagProps, IGroupProps {
    tag?: string
}

/**
 * Props for `<OrigamItem>` — a single registered item inside the group.
 * Named `IItemGroupItemProps` to avoid collision with the existing
 * `IItemProps` in `Commons/item.interface.ts` (the data-normalisation
 * mixin shared by List/Select/Menu — unrelated to this component
 * despite the name overlap).
 *
 * `tag` shadowed locally — see the note on `IItemGroupProps`.
 */
export interface IItemGroupItemProps extends ICommonsComponentProps, ITagProps, IGroupItemProps {
    tag?: string
}

/** Emits fired by `<OrigamItemGroup>` — v-model on the active item set. */
export interface IItemGroupEmits extends ICommonsComponentEmits {}

/** Scope forwarded to `<OrigamItem>`'s `default` slot — the resolved
 *  selection state from the enclosing `<OrigamItemGroup>`. */
export interface IItemGroupItemSlotProps {
    isSelected: boolean
    selectedClass: Array<string | undefined> | false
    toggle: () => void
    select: (value: boolean) => void
    value: unknown
    disabled: boolean | undefined
}

/** Slot signatures for `<OrigamItem>`. */
export interface IItemGroupItemSlots {
    default?: (data: IItemGroupItemSlotProps) => any
}

/** Slot signatures for `<OrigamItemGroup>` — the raw `useGroup()`
 *  selection API, forwarded as-is (its `selected` field stays a `Ref`,
 *  unlike `OrigamItem`'s own unwrapped `default` scope). */
export interface IItemGroupSlots {
    default?: (data: Pick<IGroupProvide, 'isSelected' | 'select' | 'next' | 'prev' | 'selected'>) => any
}
