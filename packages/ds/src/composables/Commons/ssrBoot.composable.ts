// Utilities
import { computed, onMounted, onScopeDispose, readonly, shallowRef } from 'vue'

// Composables

/*********************************************************
 * useSsrBoot
 *
 * @description
 * Empeche un flash de transition CSS entre le rendu SSR et l'hydratation :
 * tant que `isBooted` est faux, `ssrBootStyles` force `transition: none
 * !important`. `isBooted` bascule a `true` un frame apres le montage
 * (`onMounted` + `requestAnimationFrame`), pas au montage lui-meme — le
 * temps que la mise en page initiale se stabilise avant d'autoriser les
 * transitions.
 *
 * @description
 * `ssrBootStyles` retourne un OBJET quand la transition doit etre
 * bloquee, et un TABLEAU VIDE une fois booted — deux formes differentes
 * pour la meme cle de retour, a bind sans normalisation prealable (Vue
 * accepte les deux formes dans un `:style`).
 ********************************************************/
export function useSsrBoot () {
    const isBooted = shallowRef(false)

    /*********************************************************
     * Frame bound to the owner's lifetime (#719)
     *
     * @description
     * The boot frame used to outlive the component: nothing cancelled
     * it, so an owner unmounted inside the same frame left a
     * continuation queued on an environment that may already be gone —
     * the #706 family.
     *
     * @description
     * Honest scope note: THIS callback body only writes a ref, it
     * dereferences no global, so it cannot itself throw
     * `ReferenceError: window is not defined`. What it does do is write
     * to a disposed scope's reactive state one frame after teardown.
     * Cancelling costs one line and removes the window entirely, which
     * is cheaper than arguing about whether writing a dead ref is
     * harmless today and will stay harmless tomorrow.
     ********************************************************/
    let frame = -1

    onMounted(() => {
        frame = window.requestAnimationFrame(() => {
            frame = -1
            isBooted.value = true
        })
    })

    onScopeDispose(() => {
        if (frame !== -1) {
            window.cancelAnimationFrame(frame)
            frame = -1
        }
    })

    const ssrBootStyles = computed(() => !isBooted.value ? ({
        transition: 'none !important'
    }) : [])

    return {ssrBootStyles, isBooted: readonly(isBooted)}
}
