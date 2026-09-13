import { MaybeRefOrGetter, onBeforeUnmount, onMounted, ref, shallowRef, toValue, watch } from 'vue'
import { SUPPORTS_INTERSECTION } from '../../consts/Commons/commons.const'

/*********************************************************
 * useIntersectionObserver
 *
 * @description
 * Expose `intersectionRef` (a poser en template ref sur l'element a
 * observer) et `isIntersecting` — un `IntersectionObserver` est cree une
 * fois, re-attache automatiquement quand `intersectionRef` change
 * d'element (desobserve l'ancien, observe le nouveau), et deconnecte a
 * `onBeforeUnmount`.
 *
 * @description
 * Si `SUPPORTS_INTERSECTION` est faux (navigateur sans l'API, ou SSR),
 * AUCUN observer n'est cree — `isIntersecting` reste fige a `false` et
 * `callback` n'est jamais appele, silencieusement. Aucun fallback
 * polyfill.
 *
 * @description
 * ⛔ issue #684 / critere C4 — `options` accepte desormais un ref/getter
 * (`MaybeRefOrGetter`), pas seulement un objet fige. `rootMargin`/`root`
 * sont des options NATIVES d'`IntersectionObserver`, figees a la creation :
 * aucune reactivite ne peut les rattraper sans RECREER l'observateur.
 *
 * @description
 * ⛔ La creation initiale de l'observateur — ET l'abonnement reactif a
 * `options` — sont deliberement DEFERES tous les deux a l'INTERIEUR du
 * callback `onMounted`, jamais au corps de `useIntersectionObserver` (donc
 * au corps de `setup()` du composant appelant). Mesure, pas suppose : un
 * appelant qui passait `options` sous forme de valeur deballee UNE FOIS
 * pendant `setup()` (l'ancien usage d'`OrigamInfiniteScrollIntersect`, via
 * `observerOptions.value`) figeait la valeur AVANT que le resolveur de
 * themes (ADR-005, hook global `beforeCreate`, qui s'execute APRES le corps
 * de `setup()`) ait pu patcher le prop — un theme visant `margin` n'atteignait
 * donc jamais l'observateur. Passer le ref/computed lui-meme (sans le
 * deballer) NE SUFFIT PAS a corriger ce point tant que la toute PREMIERE
 * lecture de `options` a encore lieu pendant `setup()` — meme via
 * `watch(() => toValue(options), …)`, dont l'evaluation initiale (pour
 * capturer `oldValue`) est SYNCHRONE au moment de l'appel : verifie
 * empiriquement, `Object.defineProperty` remplace le descripteur SANS
 * declencher `trigger()` pour les abonnements deja etablis sur l'ancien,
 * donc un `computed` (ou un watcher) dont la toute premiere evaluation a eu
 * lieu avant `beforeCreate` reste fige sur la valeur pre-theme pour
 * toujours, quel que soit le nombre de lectures ulterieures. Seul un report
 * de la PREMIERE lecture — creation ET abonnement — apres `beforeCreate`
 * referme le trou ; `onMounted` le garantit dans tous les cas.
 ********************************************************/
export function useIntersectionObserver (callback?: IntersectionObserverCallback, options?: MaybeRefOrGetter<IntersectionObserverInit | undefined>) {
    const intersectionRef = ref<HTMLElement>()
    const isIntersecting = shallowRef(false)

    if (SUPPORTS_INTERSECTION) {
        let observer: IntersectionObserver | undefined

        const createObserver = () => {
            observer?.disconnect()

            const nextObserver: IntersectionObserver = new IntersectionObserver((entries: Array<IntersectionObserverEntry>) => {
                callback?.(entries, nextObserver)

                isIntersecting.value = !!entries.find(entry => entry.isIntersecting)
            }, toValue(options))

            observer = nextObserver

            if (intersectionRef.value) observer.observe(intersectionRef.value)
        }

        onMounted(() => {
            createObserver()

            watch(() => toValue(options), () => {
                createObserver()
            })
        })

        onBeforeUnmount(() => {
            observer?.disconnect()
        })

        watch(intersectionRef, (newValue, oldValue) => {
            if (!observer) return

            if (oldValue) {
                observer.unobserve(oldValue)
                isIntersecting.value = false
            }

            if (newValue) observer.observe(newValue)
        }, {
            flush: 'post'
        })
    }

    return {intersectionRef, isIntersecting}
}
