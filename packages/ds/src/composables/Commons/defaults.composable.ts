import { computed, inject, provide, ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue'

import { ORIGAM_DEFAULTS_KEY } from '../../consts/Commons/defaults.const'
import type { IDefault } from '../../interfaces/DefaultsProvider/defaults-provider.interface'
import { mergeDeep } from '../../utils/Commons/commons.util'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'
import { usePassedProps } from './passedProps.composable'

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
//
// `usePassedProps` (the "was this prop explicitly passed?" primitive this
// hook depends on) lives in its own file — see `passedProps.composable.ts`.
// `camelize` (kebab→camel prop-name matching) moved to
// `utils/Commons/commons.util.ts`, shared with `theme-props-resolver`.

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
 *
 * @description
 * Resolves a component's props against the closest
 * `<OrigamDefaultsProvider>` (or global defaults), falling back to the
 * component's own `withDefaults()` value. Delegates the "was this prop
 * explicitly passed?" check to `usePassedProps`.
 ********************************************************/
export function useDefaults<T extends object> (
    props: T,
    name = getCurrentInstanceName()
): T {
    const defaults = inject(ORIGAM_DEFAULTS_KEY, ref<IDefault>({}))

    const propNames = Object.keys(props)
    if (!propNames.length) return props

    // Determine which props were explicitly passed by the parent template —
    // see `usePassedProps()` for why this can't be a plain `!== undefined`
    // check.
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

/*********************************************************
 * provideDefaults
 *
 * @description
 * Cote fournisseur : declare une map de defauts pour le sous-arbre courant,
 * injectee sous `ORIGAM_DEFAULTS_KEY` et lue par `useDefaults()` chez les
 * descendants. Utilise par `<OrigamDefaultsProvider>` mais aussi appelable
 * directement (composant renderless, cas avances). `disabled` laisse passer
 * la map parente inchangee ; `reset`/`root`/`scoped` l'ignorent entierement
 * (seuls les defauts de ce provider sont visibles) ; par defaut, fusion
 * profonde (`mergeDeep`) des defauts parents sous ceux de ce provider.
 *
 * @description
 * Chaque option accepte une valeur brute OU un `Ref`/getter
 * (`MaybeRefOrGetter`), deroule via `toValue()` a chaque re-evaluation.
 * ⛔ Un appelant dont l'option est une PROP de composant doit passer un
 * getter (`() => props.scoped`), jamais la valeur nue capturee une fois —
 * #438 : `<OrigamDefaultsProvider>` forwardait `props.scoped` comme un
 * booleen brut fige au `setup()`, donc ce `computed()` ne re-trackait
 * jamais les changements et `:scoped="uneRef"` restait sans effet apres le
 * montage initial.
 ********************************************************/
export function provideDefaults (
    defaults?: Ref<IDefault> | IDefault,
    options?: {
        scoped?: MaybeRefOrGetter<boolean | undefined>
        reset?: MaybeRefOrGetter<string | number | undefined>
        root?: MaybeRefOrGetter<string | number | undefined>
        disabled?: MaybeRefOrGetter<boolean | undefined>
    }
) {
    const parentDefaults = inject(ORIGAM_DEFAULTS_KEY, ref({}))

    const provided = computed(() => {
        if (toValue(options?.disabled)) return parentDefaults.value

        const rawDefaults = defaults && 'value' in defaults ? defaults.value : defaults

        if (!rawDefaults) return parentDefaults.value

        if (toValue(options?.reset) != null || toValue(options?.root) != null) {
            return rawDefaults
        }

        if (toValue(options?.scoped)) {
            return rawDefaults
        }

        return mergeDeep(parentDefaults.value, rawDefaults) as IDefault
    })

    provide(ORIGAM_DEFAULTS_KEY, provided)

    return provided
}

/*********************************************************
 * createDefaults
 *
 * @description
 * Fabrique installee par `createOrigam()` : seme le `Ref<IDefault>` racine
 * a partir des `options.components` fournies par l'app hote (ou un objet
 * vide) — c'est ce Ref que `provideDefaults()` recoit comme premiere
 * valeur parente au sommet de l'arbre.
 ********************************************************/
export function createDefaults (options?: IDefault): Ref<IDefault> {
    return ref(options ?? {})
}
