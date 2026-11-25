import { useToggleScope } from './toggleScope.composable'
import { GLOBAL_STACK, KEYDOWN_STACK_TOP, ORIGAM_STACK_KEY, STACK_Z_INDEX_STEP } from '../../consts/Commons/stack.const'
import type { IStackProvide } from '../../interfaces/Commons/stack.interface'

import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

import { computed, inject, onScopeDispose, provide, reactive, Ref, shallowRef, toRaw } from 'vue'

/*********************************************************
 * useStack
 *
 * @description
 * ⛔ ADR-005 — `disableGlobalStack` used to arrive as a plain `boolean`
 * (`props.disableGlobalStack`, read once by the caller's setup() body). A
 * value set via `theme.components['origam-overlay'].disableGlobalStack`
 * is only patched onto `instance.props` in the `beforeCreate` hook the
 * theme-props-resolver installs — a read taken before that hook runs (a
 * plain top-level `const`) can never see it.
 *
 * @description
 * Accepting a `Ref` and re-reading `.value` only inside the reactive
 * scopes below (the toggle-scope callback, the watchEffect) defers every
 * read to render time — same fix shape as `useLink`/`useVModel` under the
 * same issue. `createStackEntry` is a `computed` for the same reason: it
 * must not snapshot `disableGlobalStack` either.
 ********************************************************/
export function useStack (
    isActive: Readonly<Ref<boolean>>,
    zIndex: Readonly<Ref<string | number>>,
    disableGlobalStack: Readonly<Ref<boolean>>
) {
    const vm = getCurrentInstance('useStack')
    const createStackEntry = computed(() => !disableGlobalStack.value)

    const parent = inject(ORIGAM_STACK_KEY, undefined)
    const stack: IStackProvide = reactive({
        activeChildren: new Set<number>()
    })
    provide(ORIGAM_STACK_KEY, stack)

    const _zIndex = shallowRef(+zIndex.value)
    useToggleScope(isActive, () => {
        const lastZIndex = GLOBAL_STACK.at(-1)?.[1]
        _zIndex.value = lastZIndex ? lastZIndex + STACK_Z_INDEX_STEP : +zIndex.value

        if (createStackEntry.value) {
            GLOBAL_STACK.push([vm.uid, _zIndex.value])
        }

        parent?.activeChildren.add(vm.uid)

        onScopeDispose(() => {
            if (createStackEntry.value) {
                const idx = toRaw(GLOBAL_STACK).findIndex(v => v[0] === vm.uid)
                GLOBAL_STACK.splice(idx, 1)
            }

            parent?.activeChildren.delete(vm.uid)
        })
    })

    /*********************************************************
     * globalTop (#1357)
     *
     * @description
     * Synchrone : un setTimeout ici laissait Echap ignore 2 a 55 ms apres
     * l'ouverture. GLOBAL_STACK est reactive, le computed se recalcule donc
     * a chaque push/splice.
     ********************************************************/
    const globalTop = computed(() => !createStackEntry.value || GLOBAL_STACK.at(-1)?.[0] === vm.uid)

    /*********************************************************
     * Sommet de pile au debut d'un evenement (#1492)
     *
     * @description
     * `globalTop` est lu en direct : si un handler intermediaire ferme un
     * overlay pendant le MEME evenement (le scope est arrete au microtask
     * qui suit chaque handler natif), le suivant se croit au sommet.
     * `snapshotTop` (capture, a brancher avant tout autre handler) fige le
     * sommet une fois par evenement ; `wasTopAt` le relit.
     ********************************************************/
    const snapshotTop = (e: Event) => {
        if (!KEYDOWN_STACK_TOP.has(e)) KEYDOWN_STACK_TOP.set(e, GLOBAL_STACK.at(-1)?.[0])
    }

    const wasTopAt = (e: Event) => !createStackEntry.value ||
        (KEYDOWN_STACK_TOP.has(e) ? KEYDOWN_STACK_TOP.get(e) === vm.uid : globalTop.value)

    const localTop = computed(() => !stack.activeChildren.size)

    return {
        globalTop,
        snapshotTop,
        wasTopAt,
        localTop,
        stackStyles: computed(() => ({zIndex: _zIndex.value}))
    }
}
