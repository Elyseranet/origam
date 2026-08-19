import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useScopeId
 ********************************************************/
export function useScopeId () {
    const vm = getCurrentInstance('useScopeId')

    const scopeId = vm.vnode.scopeId

    return {scopeId: scopeId ? {[scopeId]: ''} : undefined}
}
