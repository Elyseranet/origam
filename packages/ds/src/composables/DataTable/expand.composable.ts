import { inject, provide, toRef } from 'vue'
import { useVModel } from '../Commons/vModel.composable'

import { ORIGAM_DATA_TABLE_EXPAND_KEY } from '../../consts/DataTable/data-table.const'

import type { IDataTableExpandProps, IDataTableProvideExpanded } from '../../interfaces/DataTable/expand.interface'
import type { IDataTableItem } from '../../interfaces/DataTable/items.interface'

/*********************************************************
 * provideExpanded
 ********************************************************/
export function provideExpanded (props: IDataTableExpandProps): IDataTableProvideExpanded {
    const expandOnClick = toRef(props, 'expandOnClick')
    /*********************************************************
     * expanded
     *
     * @description
     * ⛔ PAS de `props.expanded` en 3e argument (#504). Il était évalué à
     * l'appel, donc pendant le `setup()` de l'appelant — avant que le
     * résolveur ADR-005 n'écrive — et c'était la seule chose qui rendait ce
     * composable « lecture précoce ».
     *
     * @description
     * Il ne servait à rien : `useVModel` amorce avec
     * `props[prop] !== undefined ? props[prop] : defaultValue`, si bien que
     * l'argument n'est consulté QUE quand la prop vaut `undefined` — cas où
     * il valait lui-même `undefined`, puisqu'il l'avait lue au setup.
     *
     * @description
     * Mesuré, cas du thème compris : `vmodel-default-value.spec.ts`.
     ********************************************************/
    const expanded = useVModel(props, 'expanded', undefined, v => {
        return new Set(v)
    }, v => {
        return [...v.values()]
    })

    const expand = (item: IDataTableItem, value: boolean) => {
        const newExpanded = new Set(expanded.value)

        if (!value) {
            newExpanded.delete(item.value)
        } else {
            newExpanded.add(item.value)
        }

        expanded.value = newExpanded
    }
    const isExpanded = (item: IDataTableItem) => {
        return expanded.value.has(item.value)
    }
    const toggleExpand = (item: IDataTableItem) => {
        expand(item, !isExpanded(item))
    }

    const data = {expand, expanded, expandOnClick, isExpanded, toggleExpand}

    provide(ORIGAM_DATA_TABLE_EXPAND_KEY, data)

    return data
}

/*********************************************************
 * useExpanded
 ********************************************************/
export function useExpanded () {
    const data = inject(ORIGAM_DATA_TABLE_EXPAND_KEY)

    if (!data) throw new Error('Missing expand!')

    return data
}
