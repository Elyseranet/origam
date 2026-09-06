import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useScopeId
 *
 * @description
 * Lit `vm.vnode.scopeId` (l'attribut `data-v-xxxx` que Vue attache aux
 * elements d'un `<style scoped>`) et le retourne sous forme d'un objet
 * d'attribut pret a `v-bind` (`{scopeId: ''}`), ou `undefined` si le
 * composant courant n'a pas de scope.
 *
 * @description
 * Utile pour du contenu TELEPORTE (Menu, Tooltip, Dialog…) : un noeud
 * deplace hors de l'arbre DOM du composant perd l'heritage naturel de
 * l'attribut scoped, donc le style scoped du parent ne s'appliquerait
 * plus sans le re-poser explicitement sur la racine teleportee.
 ********************************************************/
export function useScopeId () {
    const vm = getCurrentInstance('useScopeId')

    const scopeId = vm.vnode.scopeId

    return {scopeId: scopeId ? {[scopeId]: ''} : undefined}
}
