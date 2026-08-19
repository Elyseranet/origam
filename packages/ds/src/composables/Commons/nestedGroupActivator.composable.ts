import { inject, provide } from 'vue'
import { EMPTY_NESTED, ORIGAM_NESTED_KEY } from '../../consts'

/*********************************************************
 * useNestedGroupActivator
 *
 * @description
 * Marks the current provide scope as a "group activator" — the next
 * `useNestedItem` down the tree reads `isGroupActivator` off the
 * nearest `ORIGAM_NESTED_KEY` value to skip its own register/unregister
 * (the activator is a visual proxy for its group, not a node itself).
 * Independent from `useNested` / `useNestedItem` at the call level (no
 * direct function dependency) — the three only share the
 * `ORIGAM_NESTED_KEY` provide/inject contract.
 ********************************************************/
export function useNestedGroupActivator () {
    const parent = inject(ORIGAM_NESTED_KEY, EMPTY_NESTED)

    const item = {
        ...parent,
        isGroupActivator: true
    }

    provide(ORIGAM_NESTED_KEY, item)
}
