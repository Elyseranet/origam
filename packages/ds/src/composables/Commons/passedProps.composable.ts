import { camelize, getCurrentInstance } from '../../utils'

/*********************************************************
 * usePassedProps
 *
 * @description
 * Was-prop-passed factory — component-side primitive: for the CURRENT
 * component instance, returns a predicate telling whether a given prop
 * key was explicitly written by the parent template (`vnode.props`) —
 * as opposed to resolved from a default (`withDefaults()`, or Vue's
 * own boolean-prop coercion).
 * @description
 * This matters beyond `useDefaults()` itself: any component that
 * FORWARDS its own props down to descendants as
 * `<OrigamDefaultsProvider>` entries (e.g. `OrigamAvatarGroup` →
 * `origam-avatar`, `OrigamBtnGroup` → `origam-btn`) must use this —
 * not a plain `!== undefined` check — to decide whether to forward a
 * value. Reason: Vue resolves an UNSET prop whose declared type
 * *includes* `boolean` (e.g. `border?: boolean | string`, `rounded?:
 * boolean | TRounded`) to the concrete value `false`, never to
 * `undefined`. A naive `omitUndefined()` over the forwarded map
 * therefore still ships an explicit `false` for `border`/`rounded`
 * even when the consumer never set them, which then wins the
 * `mergeDeep` against an ancestor/theme default (e.g. `origam-avatar:
 * { border: true }`) — see #263.
 * @description
 * MUST be re-read on every resolution (not captured once), for the
 * same reason `useDefaults()` re-reads it: a parent binding through a
 * dynamic `v-bind` whose object starts empty
 * (`childRef?.filterProps(...)` before mount) only fills `vnode.props`
 * on a later render.
 * @description
 * Kept in its own file since `useDefaults` is its consumer, not the
 * other way round — moving it alongside `useDefaults` would make the
 * dependency direction backwards to read.
 ********************************************************/
export function usePassedProps<T extends Record<string, any>> (
    _props: T,
    instanceLabel = 'usePassedProps'
): (key: Extract<keyof T, string> | string) => boolean {
    const vm = getCurrentInstance(instanceLabel)

    return (key) => {
        const vnodeProps = vm.vnode.props || {}
        for (const k in vnodeProps) {
            // A key present in `vnode.props` with the value `undefined` does
            // NOT count as passed. Vue does not omit a dynamically-bound key
            // just because its current value is `undefined`, so the ordinary
            // consumer pattern `:bg-color="state.bgColor"` made this return
            // `true` while the value was empty — and the theme default was
            // then silently skipped. The field looked unthemed for no visible
            // reason, and nothing reported it.
            //
            // Requiring a non-`undefined` value aligns this with how Vue's own
            // `withDefaults()` already behaves (an `undefined` prop falls back
            // to the default). Distinct from the `?? {}` guard above, which is
            // about a key ABSENT from `vnode.props` entirely.
            if (k === key || camelize(k) === key) return vnodeProps[k] !== undefined
        }
        return false
    }
}
