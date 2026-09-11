import { watchEffect } from 'vue'

import { warnUnsupportedProp } from '../../utils/Commons/color.util'

/*********************************************************
 * useUnsupportedProp
 *
 * @description
 * Avertit, une fois et en developpement seulement, qu'une prop declaree par un
 * composant n'a aucun effet sur lui. Sert tout le catalogue ; la famille Chart
 * en fut le premier consommateur.
 *
 * @description
 * ⛔ Pourquoi avertir plutot que retirer. Ces props sont exposees dans les
 * stories, parfois documentees : les supprimer casserait la story et le type
 * d'un consommateur, pour une prop qui ne faisait deja rien. Les cabler a un
 * comportement invente serait pire encore. L'avertissement dit la verite sans
 * rien casser, et il porte la RAISON — un « prop non supportee » nu obligerait
 * le lecteur a aller lire le source.
 *
 * @description
 * ⛔ Le predicat doit comparer au DEFAUT REEL de la prop, pas a `undefined`.
 * `props.x !== undefined` est toujours vrai des que `withDefaults` fixe une
 * valeur, et l'avertissement partirait a chaque montage — mesure sur la
 * famille Chart, ou `animated: false` et `animationDuration: 600` criaient
 * sans arret. Un avertissement permanent est ignore en deux jours.
 *
 * @description
 * Effet de bord utile : lire la prop dans le predicat la rend CONSOMMEE au
 * sens du garde `unconsumed-props`. La surface cesse donc d'etre comptee
 * morte, ce qui est exact — elle est desormais surveillee, pas ignoree.
 ********************************************************/
export function useUnsupportedProp (
    component: string,
    prop: string,
    reason: string,
    isPassed: () => boolean,
): void {
    watchEffect(() => {
        if (isPassed()) {
            warnUnsupportedProp(component, prop, reason)
        }
    })
}
