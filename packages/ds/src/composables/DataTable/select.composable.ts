import { useVModel } from '../Commons/vModel.composable'

import { allSelectStrategy, ORIGAM_DATA_TABLE_SELECT_KEY, pageSelectStrategy, singleSelectStrategy } from '../../consts/DataTable/data-table.const'

import { DATATABLE_SELECT_STRATEGY } from '../../enums'

import type { IDataTableProvideSelection, IDataTableSelectableItem, IDataTableSelectProps } from '../../interfaces/DataTable/select.interface'

import { deepEqual, wrapInArray } from '../../utils/Commons/commons.util'

import { computed, inject, provide, Ref } from 'vue'

/*********************************************************
 * provideSelection
 *
 * @description
 * Cree l'etat de selection d'un `<origam-data-table>` et le `provide` sous
 * `ORIGAM_DATA_TABLE_SELECT_KEY`. Prend en second argument `allItems` et
 * `currentPage` : la selection a besoin des deux, puisque « tout selectionner »
 * ne veut pas dire la meme chose selon la strategie.
 *
 * @description
 * La strategie vient de `props.selectStrategy` : `single`, `all`, ou `page`
 * (le defaut). Un OBJET peut aussi etre passe a la place d'un mot-cle, auquel
 * cas il est utilise tel quel — c'est le point d'extension pour une regle de
 * selection maison.
 *
 * @description
 * Seuls les elements dont `selectable` est vrai entrent dans les calculs :
 * `allSelectable` et `currentPageSelectable` filtrent en amont, donc une ligne
 * non selectionnable ne fausse jamais l'etat « tout est selectionne ».
 *
 * @description
 * La comparaison des valeurs passe par `props.valueComparator`, avec
 * `deepEqual` par defaut — necessaire des que la valeur d'une ligne est un
 * objet plutot qu'une cle primitive.
 ********************************************************/
export function provideSelection (
    props: IDataTableSelectProps,
    {allItems, currentPage}: {
        allItems: Ref<Array<IDataTableSelectableItem>>,
        currentPage: Ref<Array<IDataTableSelectableItem>>
    }
): IDataTableProvideSelection {
    const valueComparator = computed(() => {
        return props.valueComparator ?? deepEqual
    })
    const allSelectable = computed(() => allItems.value.filter(item => item.selectable))
    const currentPageSelectable = computed(() => currentPage.value.filter(item => item.selectable))
    const selectStrategy = computed(() => {
        if (typeof props.selectStrategy === 'object') return props.selectStrategy

        switch (props.selectStrategy) {
            case DATATABLE_SELECT_STRATEGY.SINGLE:
                return singleSelectStrategy
            case DATATABLE_SELECT_STRATEGY.ALL:
                return allSelectStrategy
            case DATATABLE_SELECT_STRATEGY.PAGE:
            default:
                return pageSelectStrategy
        }
    })

    /*********************************************************
     * selected
     *
     * @description
     * ⛔ Pas de `props.modelValue` en 3e argument — voir `provideExpanded`
     * dans `expand.composable.ts` : l'argument était mort et forçait une
     * lecture pendant le `setup()` de l'appelant (#504).
     ********************************************************/
    const selected = useVModel(props, 'modelValue', undefined, (v) => {
        return new Set(wrapInArray(v).map(v => {
            return allItems.value.find((item) => valueComparator.value(v, item.value))?.value ?? v
        }))
    }, (v) => {
        return [...v.values()]
    })

    const isSelected = (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>): boolean => {
        return wrapInArray(items).every(item => selected.value.has(item.value))
    }
    const isSomeSelected = (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>): boolean => {
        return wrapInArray(items).some(item => selected.value.has(item.value))
    }
    const select = (items: Array<IDataTableSelectableItem>, value: boolean) => {
        const newSelected = selectStrategy.value.select({
            items,
            value,
            selected: new Set(selected.value)
        })

        selected.value = newSelected
    }
    const toggleSelect = (item: IDataTableSelectableItem) => {
        select([item], !isSelected([item]))
    }
    const selectAll = (value: boolean) => {
        const newSelected = selectStrategy.value.selectAll({
            value,
            allItems: allSelectable.value,
            currentPage: currentPageSelectable.value,
            selected: new Set(selected.value)
        })

        selected.value = newSelected
    }

    const someSelected = computed(() => {
        return selected.value.size > 0
    })
    const allSelected = computed(() => {
        const items = selectStrategy.value.allSelected({
            allItems: allSelectable.value,
            currentPage: currentPageSelectable.value
        })
        return !!items.length && isSelected(items)
    })
    const showSelectAll = computed(() => {
        return selectStrategy.value.showSelectAll
    })

    const data = {
        toggleSelect,
        select,
        selectAll,
        isSelected,
        isSomeSelected,
        someSelected,
        allSelected,
        showSelectAll
    }

    provide(ORIGAM_DATA_TABLE_SELECT_KEY, data)

    return data
}

/*********************************************************
 * useSelection
 *
 * @description
 * Cote consommateur de `provideSelection` : recupere l'etat de selection
 * fourni par le `<origam-data-table>` ancetre.
 *
 * @description
 * ⛔ LEVE si aucun ancetre ne l'a fourni, pour la meme raison que
 * `useExpanded` : une ligne montee hors de son tableau est une erreur de
 * structure, et un echec silencieux la rendrait invisible.
 ********************************************************/
export function useSelection () {
    const data = inject(ORIGAM_DATA_TABLE_SELECT_KEY)

    if (!data) throw new Error('Missing selection!')

    return data
}
