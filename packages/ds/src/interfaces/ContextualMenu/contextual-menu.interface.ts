import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IMenuProps } from '../Menu/menu.interface'

export interface IContextualMenuProps extends ICommonsComponentProps, IMenuProps {

}

export interface IContextualMenuEmits {}

/**
 * ⛔ NOT EMPTY — DO NOT "simplify" this back to `{}`.
 *
 * `<OrigamContextualMenu>` is a transparent slot passthrough: its
 * template does `v-for="(_, name) in $slots"` then `:name="name"` to
 * forward WHATEVER named slots the consumer provides straight to the
 * inner `<OrigamMenu>` (see the component's own comment, previously
 * removed then restored here as a type-level guard). An empty
 * `IContextualMenuSlots {}` has no index signature, so `$slots` types
 * as `{}` and indexing it by a generic `string` fails compilation:
 *
 *   error TS7053: Element implicitly has an 'any' type because
 *   expression of type 'string' can't be used to index type
 *   'Readonly<IContextualMenuSlots> & IContextualMenuSlots'.
 *
 * The index signature was NOT the cause of the hole — the dynamic
 * indexing was already unchecked before. Typing `defineSlots` made the
 * hole checkable, and therefore refusable by the compiler. Removing
 * the index signature doesn't fix anything, it just makes `vue-tsc`
 * stop looking — and since `vue-tsc` type-checks the whole package in
 * one pass, this single file blocks the type-check gate for every
 * component in the catalogue, not just this one.
 */
export interface IContextualMenuSlots {
    [name: string]: ((props: any) => any) | undefined
}

