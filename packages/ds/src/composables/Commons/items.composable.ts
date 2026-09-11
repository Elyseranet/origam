import { computed } from 'vue'
import type { IItemProps } from '../../interfaces/Commons/item.interface'
import type { IInternalListItem } from '../../interfaces/List/list-children.interface'

import { deepEqual } from '../../utils/Commons/commons.util'
import { transformListItem, transformListItems } from '../../utils/List/list-item.util'

/*********************************************************
 * useItems
 *
 * @description
 * Normalise `props.items` (formats varies : chaine, objet, `itemTitle`/
 * `itemValue` custom…) en `IInternalListItem[]` via `transformListItems`,
 * et fournit `transformIn`/`transformOut` pour convertir entre le
 * v-model brut (valeurs primitives ou objets selon `props.returnObject`)
 * et ces items internes — utilise par Select/Autocomplete/Combobox.
 *
 * @description
 * `transformIn` filtre les `null` du modele SAUF si `null` est lui-meme
 * une valeur d'item valide (`hasNullItem`) — sans cette exception, un item
 * "Aucun" dont la valeur est `null` ne pourrait jamais etre selectionne.
 * `valueComparator` (par defaut `deepEqual`) est ce qui decide si une
 * valeur du modele correspond a un item existant plutot que de creer un
 * item ad hoc.
 ********************************************************/
export function useItems (props: IItemProps & { itemType?: string }) {
    const items = computed(() => {
        if (props.items) {
            return transformListItems(props, props.items)
        }

        return []
    })
    const hasNullItem = computed(() => {
        return items.value.some((item) => {
            return item.value === null
        })
    })
    const valueComparator = computed(() => {
        return props.valueComparator ? props.valueComparator : deepEqual
    })

    const transformIn = (value: Array<unknown>): IInternalListItem[] => {
        if (!hasNullItem.value) {
            // When the model value is null, return an InternalItem
            // based on null only if null is one of the items
            value = value.filter(v => v !== null)
        }

        return value.map((v) => {
            if (props.returnObject && typeof v === 'string') {
                // String model value means value is a custom input value from combobox
                // Don't look up existing items if the model value is a string
                return transformListItem(props, v)
            }

            return items.value.find((item) => {
                return valueComparator.value(v, item.value)
            }) || transformListItem(props, v)
        }) as IInternalListItem[]
    }

    const transformOut = (value: IInternalListItem[]): Array<unknown> => {
        return props.returnObject
            ? value.map(({raw}) => raw)
            : value.map(({value}) => value)
    }

    return {items, transformIn, transformOut}
}
