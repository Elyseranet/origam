// Utilities
import { computed, onMounted, readonly, shallowRef } from 'vue'

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

    onMounted(() => {
        window.requestAnimationFrame(() => {
            isBooted.value = true
        })
    })

    const ssrBootStyles = computed(() => !isBooted.value ? ({
        transition: 'none !important'
    }) : [])

    return {ssrBootStyles, isBooted: readonly(isBooted)}
}
