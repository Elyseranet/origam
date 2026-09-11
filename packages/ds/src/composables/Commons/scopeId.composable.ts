import { getCurrentInstance } from '../../utils'

/*********************************************************
 * useScopeId
 ********************************************************/
export function useScopeId () {
    const vm = getCurrentInstance('useScopeId')

    const scopeId = vm.vnode.scopeId

    return {scopeId: scopeId ? {[scopeId]: ''} : undefined}
}
