import { computed, Ref, shallowRef, watch } from 'vue'

/*********************************************************
 * useLazy
 *
 * @description
 * Rendu paresseux du contenu d'un composant flottant/conditionnel :
 * `hasContent` ne devient vrai qu'apres la PREMIERE activation de
 * `active` (ou immediatement si `props.eager`), et reste vrai ensuite
 * (`isBooted`) meme quand `active` repasse a `false` — le contenu n'est
 * donc monte qu'une fois, puis conserve.
 *
 * @description
 * `onAfterLeave` (a cabler sur la fin de transition de sortie) remet
 * `isBooted` a `false` pour un composant NON `eager` — c'est ce hook qui
 * demonte reellement le contenu apres la fermeture, pas le changement de
 * `active` lui-meme. Un composant `eager` ignore ce reset : son contenu
 * reste toujours monte.
 ********************************************************/
export function useLazy (props: { eager: boolean }, active: Ref<boolean>) {
    const isBooted = shallowRef(false)
    const hasContent = computed(() => isBooted.value || props.eager || active.value)

    watch(active, () => isBooted.value = true)

    const onAfterLeave = () => {
        if (!props.eager) isBooted.value = false
    }

    return {isBooted, hasContent, onAfterLeave}
}
