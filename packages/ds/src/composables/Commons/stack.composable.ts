import { useToggleScope } from './toggleScope.composable'
import { GLOBAL_STACK, ORIGAM_STACK_KEY, STACK_Z_INDEX_STEP } from '../../consts/Commons/stack.const'
import type { IStackProvide } from '../../interfaces/Commons/stack.interface'

import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'
import { tryOnScopeDispose } from '../../utils/Commons/commons.util'

import { computed, inject, onScopeDispose, provide, reactive, readonly, Ref, shallowRef, toRaw, watchEffect } from 'vue'

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

    const globalTop = shallowRef(true)

    /*********************************************************
     * Timer borne a la duree de vie du scope (#753 — hors releve)
     *
     * @description
     * Absent de la liste du ticket, trouve par mon propre balayage. Meme
     * forme que `useActivator` : le `watchEffect` s'arrete au dispose,
     * mais le timer arme au dernier tick survivait et ecrivait
     * `globalTop.value` sur un scope detruit.
     ********************************************************/
    /*********************************************************
     * ⛔ `setTimeout` NU, jamais `window.setTimeout` — casse le SSR
     *
     * @description
     * Ce `watchEffect` s'execute IMMEDIATEMENT au setup, donc aussi sur
     * le serveur, ou `window` n'existe pas. Une premiere version de ce
     * correctif ecrivait `window.clearTimeout(...)` : mesure CI, les deux
     * jobs marketing echouaient sur
     * `Timed out waiting 120000ms from config.webServer` SANS aucune
     * erreur dans le log, parce que le serveur repondait `500` et que la
     * sonde `webServer.url` de Playwright attend sur un 5xx. Cause reelle
     * lue dans le corps de la reponse :
     * `Cannot read properties of undefined (reading 'clearTimeout')`,
     * stack `stack.composable.js:39`.
     *
     * @description
     * Les globaux NUS existent dans Node ET dans le navigateur — c'est
     * pour ca que le code d'origine les utilisait, et le prefixe
     * `window.` etait un ajout gratuit de ma part. Ironie utile a garder :
     * un ticket sur du code qui explose parce qu'un global a disparu, et
     * dont le correctif a introduit un plantage en allant chercher un
     * global qui n'existe pas cote serveur.
     ********************************************************/
    let topTimer = -1

    watchEffect(() => {
        if (!createStackEntry.value) return

        const _isTop = GLOBAL_STACK.at(-1)?.[0] === vm.uid

        clearTimeout(topTimer)
        topTimer = setTimeout(() => {
            topTimer = -1
            globalTop.value = _isTop
        })
    })

    tryOnScopeDispose(() => {
        if (topTimer !== -1) {
            clearTimeout(topTimer)
            topTimer = -1
        }
    })

    const localTop = computed(() => !stack.activeChildren.size)

    return {
        globalTop: readonly(globalTop),
        localTop,
        stackStyles: computed(() => ({zIndex: _zIndex.value}))
    }
}
