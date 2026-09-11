import { computed, inject, provide, ref, type Ref } from 'vue'

import { ORIGAM_DEFAULTS_KEY } from '../../consts'
import type { IDefault } from '../../interfaces'
import { getCurrentInstance, getCurrentInstanceName, mergeDeep } from '../../utils'

// ────────────────────────────────────────────────────────────────────────────
// Defaults system — ported from origam(Lot 3.0)
// ────────────────────────────────────────────────────────────────────────────
//
// Lets a `<OrigamDefaultsProvider>` ancestor inject default prop values for
// every descendant of a given component name (or globally). Components opt
// in via `useDefaults(props)` which returns a Proxy that resolves each prop
// against the parent provider before falling back to `withDefaults()`.
//
// Resolution order, per prop:
//   1. Value explicitly passed by the parent in template (highest priority).
//   2. Component-specific defaults from the closest provider, e.g.
//      `defaults['origam-btn'].color`.
//   3. Global defaults from the closest provider: `defaults.global.color`.
//   4. The component's own `withDefaults()` value (lowest priority).
//
// SSR-safe: no DOM access. The injection key is a global symbol so multiple
// bundle copies of origam still cooperate.

/**
 * `kebab-case` → `camelCase`. Used to recognise prop names that were passed
 * as kebab-case attributes on the parent vnode.
 */
function camelize (str: string): string {
    return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

/**
 * Was-prop-passed factory.
 *
 * @description
 * Component-side primitive: for the CURRENT component instance, returns a
 * predicate telling whether a given prop key was explicitly written by the
 * parent template (`vnode.props`) — as opposed to resolved from a default
 * (`withDefaults()`, or Vue's own boolean-prop coercion).
 *
 * This matters beyond `useDefaults()` itself: any component that FORWARDS
 * its own props down to descendants as `<OrigamDefaultsProvider>` entries
 * (e.g. `OrigamAvatarGroup` → `origam-avatar`, `OrigamBtnGroup` → `origam-btn`)
 * must use this — not a plain `!== undefined` check — to decide whether to
 * forward a value. Reason: Vue resolves an UNSET prop whose declared type
 * *includes* `boolean` (e.g. `border?: boolean | string`, `rounded?: boolean
 * | TRounded`) to the concrete value `false`, never to `undefined`. A naive
 * `omitUndefined()` over the forwarded map therefore still ships an explicit
 * `false` for `border`/`rounded` even when the consumer never set them,
 * which then wins the `mergeDeep` against an ancestor/theme default (e.g.
 * `origam-avatar: { border: true }`) — see #263.
 *
 * MUST be re-read on every resolution (not captured once), for the same
 * reason `useDefaults()` re-reads it: a parent binding through a dynamic
 * `v-bind` whose object starts empty (`childRef?.filterProps(...)` before
 * mount) only fills `vnode.props` on a later render.
 */

/*********************************************************
 * usePassedProps
 ********************************************************/
export function usePassedProps<T extends Record<string, any>> (
    _props: T,
    instanceLabel = 'usePassedProps'
): (key: Extract<keyof T, string> | string) => boolean {
    const vm = getCurrentInstance(instanceLabel)

    return (key) => {
        const vnodeProps = vm.vnode.props || {}
        for (const k in vnodeProps) {
            if (k === key || camelize(k) === key) return true
        }
        return false
    }
}

/**
 * Component-side hook: resolve `props` against the closest DefaultsProvider.
 *
 * The returned object proxies the original props — every read goes through
 * the resolution chain above, but `Object.keys(...)`, spread, `filterProps`,
 * etc. still see the original prop names. Pass-through reads of non-prop
 * keys (Vue internals, symbols) hit the original `props` directly.
 *
 * Pass `name` if the consumer is not a component (e.g. a child composable
 * that wants to read another component's defaults). Defaults to the current
 * instance's kebab-cased name (`getCurrentInstanceName()`).
 */

/*********************************************************
 * useDefaults
 ********************************************************/
export function useDefaults<T extends Record<string, any>> (
    props: T,
    name = getCurrentInstanceName()
): T {
    const defaults = inject(ORIGAM_DEFAULTS_KEY, ref<IDefault>({}))

    const propNames = Object.keys(props)
    if (!propNames.length) return props

    // Determine which props were explicitly passed by the parent template —
    // see `usePassedProps()` above for why this can't be a plain
    // `!== undefined` check.
    const wasPropPassed = usePassedProps(props, 'useDefaults')

    const result = {} as Record<string, any>

    for (const key of propNames) {
        const c = computed(() => {
            // Read the component's own prop value EAGERLY so it is always a
            // tracked dependency of this computed. Without this, a prop that
            // starts "not passed" (resolves via the provider branch below)
            // would never re-evaluate when the parent later forwards it
            // through a dynamic `v-bind` — the computed would have tracked
            // only `defaults.value`, not `props[key]`, and stay stale.
            const ownValue = (props as any)[key]

            // Parent override always wins.
            if (wasPropPassed(key)) return ownValue

            // Otherwise, resolve from the closest DefaultsProvider.
            const componentDefs = defaults.value?.[name]
            if (componentDefs?.[key] !== undefined) return componentDefs[key]

            const globalDefs = defaults.value?.global
            if (globalDefs?.[key] !== undefined) return globalDefs[key]

            // Fall through to the value baked in by `withDefaults()`.
            return ownValue
        })

        Object.defineProperty(result, key, {
            get: () => c.value,
            enumerable: true,
            configurable: true
        })
    }

    // Forward non-prop accesses (Vue internals, symbols, etc.) to the
    // original `props` so reactive bindings keep working.
    return new Proxy(result as T, {
        get (target, prop, receiver) {
            if (typeof prop === 'symbol' || !(prop in target)) {
                return (props as any)[prop]
            }
            return Reflect.get(target, prop, receiver)
        },
        has (target, prop) {
            return prop in target || prop in props
        },
        ownKeys () {
            // `filterProps`/spread must see EVERY declared prop name, even
            // those whose effective value comes from the provider.
            const symbols = Reflect.ownKeys(props).filter(k => typeof k === 'symbol')
            return [...propNames, ...symbols]
        },
        getOwnPropertyDescriptor (target, prop) {
            if (typeof prop === 'string' && prop in target) {
                return { enumerable: true, configurable: true, get: () => (target as any)[prop] }
            }
            return Reflect.getOwnPropertyDescriptor(props, prop)
        }
    })
}

/**
 * Provider-side hook: declare a defaults map for the current component
 * subtree. Consumed by `<OrigamDefaultsProvider>` but also callable directly
 * for advanced cases (e.g. providing defaults from inside a renderless
 * component).
 *
 * Options control how this provider composes with any ancestor provider:
 *   - `disabled` — pass through the parent map unchanged.
 *   - `reset` / `root` — ignore the parent map; only this provider's
 *     defaults are visible to descendants.
 *   - `scoped` — same effect as `reset`, declarative variant.
 *   - default — deep-merge parent defaults under this provider's defaults.
 */

/*********************************************************
 * provideDefaults
 ********************************************************/
export function provideDefaults (
    defaults?: Ref<IDefault> | IDefault,
    options?: {
        scoped?: boolean
        reset?: string | number
        root?: string | number
        disabled?: boolean
    }
) {
    const parentDefaults = inject(ORIGAM_DEFAULTS_KEY, ref({}))

    const provided = computed(() => {
        if (options?.disabled) return parentDefaults.value

        const rawDefaults = defaults && 'value' in defaults ? defaults.value : defaults

        if (!rawDefaults) return parentDefaults.value

        if (options?.reset != null || options?.root != null) {
            return rawDefaults
        }

        if (options?.scoped) {
            return rawDefaults
        }

        return mergeDeep(parentDefaults.value, rawDefaults) as IDefault
    })

    provide(ORIGAM_DEFAULTS_KEY, provided)

    return provided
}

/**
 * Plugin-side factory used by `createOrigam()` to seed the root defaults
 * map from the host app's options.
 */

/*********************************************************
 * createDefaults
 ********************************************************/
export function createDefaults (options?: IDefault): Ref<IDefault> {
    return ref(options ?? {})
}
