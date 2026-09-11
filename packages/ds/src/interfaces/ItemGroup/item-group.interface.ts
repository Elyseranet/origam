import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IGroupItemProps,
    IGroupProps,
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
 * `IItemProps` in `List/list.interface.ts` (List's `items?` prop).
 *
 * `tag` shadowed locally — see the note on `IItemGroupProps`.
 */
export interface IItemGroupItemProps extends ICommonsComponentProps, ITagProps, IGroupItemProps {
    tag?: string
}

/** Emits fired by `<OrigamItemGroup>` — v-model on the active item set. */
export interface IItemGroupEmits extends ICommonsComponentEmits {}
