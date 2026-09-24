import type { Ref } from 'vue'
import { shallowRef, watch } from 'vue'
import type { TOrigamList } from '../../types/List/list.type'
import type { TOrigamTextField } from '../../types/TextField/text-field.type'
import { tryOnScopeDispose } from '../../utils/Commons/commons.util'

/*********************************************************
 * useScrolling
 *
 * @description
 * Keyboard-driven list scrolling (PageUp/PageDown/Home/End) with a
 * frame-accurate "is currently scrolling" flag used to defer focus
 * moves until the scroll settles.
 * Independent from `useScroll` / `useScrollStrategies` — no shared
 * state or call dependency.
 ********************************************************/
export function useScrolling (listRef: Ref<TOrigamList | undefined>, textFieldRef: Ref<TOrigamTextField | undefined>) {
    const isScrolling = shallowRef(false)
    let scrollTimeout: number

    const onListScroll = () => {
        cancelAnimationFrame(scrollTimeout)
        isScrolling.value = true
        scrollTimeout = requestAnimationFrame(() => {
            scrollTimeout = requestAnimationFrame(() => {
                isScrolling.value = false
            })
        })
    }

    /*********************************************************
     * Fin de vie — annuler la chaine de `onListScroll`, PAS celle de
     * `finishScrolling` (#779)
     *
     * @description
     * Le handle de `onListScroll` etait bien capture (`scrollTimeout`),
     * mais seul le DEBUT de la fonction l'annulait, jamais la sortie de
     * portee : une frame restait armee apres le demontage. Elle est
     * annulee ici.
     *
     * @description
     * ⛔ `isScrolling` est remis a `false` DANS le meme geste, et ce
     * n'est pas de la cosmetique. Un `finishScrolling` en cours peut
     * etre suspendu sur `watch(isScrolling)` ci-dessous ; c'est la frame
     * qu'on vient d'annuler qui l'aurait libere. Annuler sans remettre
     * le drapeau laisserait la promesse en suspens POUR TOUJOURS — une
     * fuite strictement pire que celle qu'on repare, puisqu'elle retient
     * la continuation entiere de `onListKeydown` au lieu d'une frame.
     * Le drapeau n'est pas retourne par le composable : personne d'autre
     * ne l'observe.
     ********************************************************/
    tryOnScopeDispose(() => {
        cancelAnimationFrame(scrollTimeout)
        isScrolling.value = false
    })

    /*********************************************************
     * finishScrolling — ⛔ ses trois rAF restent NUS, et c'est voulu
     * (#779)
     *
     * @description
     * Ici la frame n'est pas un effet differe : c'est le seul moyen
     * qu'a la promesse de se resoudre. `onListKeydown` fait
     * `await finishScrolling()` puis lit le DOM pour deplacer le focus ;
     * un `if (disposed) return` dans ces callbacks empecherait `resolve`
     * d'etre appele, et la fonction asynchrone resterait suspendue
     * indefiniment — elle retiendrait alors l'element, les enfants et
     * l'evenement, la ou l'etat actuel ne retient qu'une frame de 16 ms.
     * Le correctif « evident » remplacerait une fuite bornee par une
     * fuite permanente. Mesure dans
     * `TU/origam/raf-teardown-779.spec.ts`.
     *
     * @description
     * Ce que ces trois frames coutent reellement au demontage est borne
     * et connu : au plus UNE frame en vol a un instant donne (elles sont
     * attendues l'une apres l'autre), dont la continuation est
     * `resolve` — qui ne touche ni le DOM, ni un global, ni un `ref`.
     * Rien a neutraliser.
     ********************************************************/
    const finishScrolling = async () => {
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise<void>(resolve => {
            if (isScrolling.value) {
                const stop = watch(isScrolling, () => {
                    stop()
                    resolve()
                })
            } else resolve()
        })
    }
    /*********************************************************
     * focusFirstMatch
     *
     * @description
     * Les deux branches de `onListKeydown` faisaient la meme chose dans
     * deux sens : parcourir les enfants, focaliser le PREMIER dont le
     * rectangle franchit le bord du conteneur, puis sortir. Extrait tel
     * quel (Sonar #771 : complexite cognitive 18 > 15) — meme ordre de
     * parcours, meme `break` au premier succes, meme cast en HTMLElement.
     ********************************************************/
    const focusFirstMatch = (children: Iterable<Element>, matches: (rect: DOMRect) => boolean) => {
        for (const child of children) {
            if (matches(child.getBoundingClientRect())) {
                (child as HTMLElement).focus()
                break
            }
        }
    }

    const onListKeydown = async (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            textFieldRef.value?.focus()
        }

        if (!['PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return
        const el: HTMLElement = listRef.value?.$el
        if (!el) return

        if (e.key === 'Home' || e.key === 'End') {
            el.scrollTo({
                top: e.key === 'Home' ? 0 : el.scrollHeight,
                behavior: 'smooth'
            })
        }

        await finishScrolling()

        const children = el.querySelectorAll(':scope > :not(.origam-virtual-scroll__spacer)')

        if (e.key === 'PageDown' || e.key === 'Home') {
            const top = el.getBoundingClientRect().top

            focusFirstMatch(children, rect => rect.top >= top)
        } else {
            const bottom = el.getBoundingClientRect().bottom

            focusFirstMatch([...children].reverse(), rect => rect.bottom <= bottom)
        }
    }

    return {onListScroll, onListKeydown}
}
