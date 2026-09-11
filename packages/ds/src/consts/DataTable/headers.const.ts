import type { InjectionKey, Ref } from 'vue'
import type { IInternalDataTableHeader } from '../../interfaces'

export const ORIGAM_DATA_TABLE_HEADERS_KEY: InjectionKey<{
    headers: Ref<Array<Array<IInternalDataTableHeader>>>
    columns: Ref<Array<IInternalDataTableHeader>>
}> = Symbol.for('origam:data-table-headers')

export const DEFAULT_HEADER = {title: '', sortable: false}
export const DEFAULT_ACTION_HEADER = {...DEFAULT_HEADER, width: 48}
