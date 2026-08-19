import { inject } from 'vue'
import { ORIGAM_LIST_KEY } from '../../consts'

/*********************************************************
 * useList
 *
 * @description
 * Reads the nearest `ORIGAM_LIST_KEY` injection provided by
 * `useCreateList`, or `null` when rendered outside a list.
 * Independent from `useCreateList` at the call level (no direct
 * function dependency) — the two only share the `ORIGAM_LIST_KEY`
 * provide/inject contract.
 ********************************************************/
export function useList () {
    return inject(ORIGAM_LIST_KEY, null)
}
