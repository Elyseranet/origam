import {
    DATA_TABLE_HEADER_SLOT_PREFIX,
    DATA_TABLE_ITEM_SLOT_PREFIX,
    DATA_TABLE_RESERVED_HEADER_SLOT_NAMES,
    DATA_TABLE_ROWS_SLOT_NAMES
} from '../../consts/DataTable/data-table.const'

import type {
    TDataTableHeaderColumnSlotName,
    TDataTableItemColumnSlotName,
    TDataTableRowsSlotName
} from '../../types/DataTable/data-table-slot-name.type'

/*********************************************************
 * Relais de slots de la famille DataTable
 *
 * @description
 * `<OrigamDataTable>` monte `<OrigamDataTableHeaders>` et
 * `<OrigamDataTableRows>`, qui montent a leur tour `HeadersCell` /
 * `HeaderCell` et `Row` / `GroupHeaderRow`. Chaque maillon doit renvoyer
 * les slots qui ne lui appartiennent pas au maillon suivant, sinon le
 * contenu du consommateur n'atteint jamais l'element qui le rend.
 *
 * @description
 * Ces predicats sont le seul endroit ou le decoupage est decrit. Les
 * quatre composants du relais les partagent — un nom ajoute ici circule
 * dans toute la chaine, sans quoi il faudrait le repeter quatre fois.
 *
 * @description
 * Chaque fonction prend les noms de slots bruts (`Object.keys(useSlots())`)
 * et rend le sous-ensemble destine a l'enfant suivant :
 * `pickDataTableRowsSlotNames` pour `<OrigamDataTableRows>` (noms fixes +
 * les deux familles colonne), `pickDataTableHeaderColumnSlotNames` pour la
 * chaine d'en-tete (`header.{cle}` seul), `pickDataTableItemColumnSlotNames`
 * pour les valeurs de cellule (`item.{cle}` seul).
 *
 * @description
 * `header.mobile` et `header.loader` sont EXCLUS de la famille colonne :
 * ils adressent les slots propres d'`<OrigamDataTableHeaders>`, deja
 * forwardes nommement, et aucune colonne ne peut porter ces cles.
 *
 * @description
 * Les predicats sont des gardes de type. Ce n'est pas cosmetique : un nom
 * de slot dynamique typé `string` ne peut pas indexer l'interface de slots
 * de la cible, et `vue-tsc` rougit en `TS7053` sur chaque relais.
 ********************************************************/

export function isDataTableItemColumnSlot (name: string): name is TDataTableItemColumnSlotName {
    return name.startsWith(DATA_TABLE_ITEM_SLOT_PREFIX)
}

export function isDataTableHeaderColumnSlot (name: string): name is TDataTableHeaderColumnSlotName {
    return name.startsWith(DATA_TABLE_HEADER_SLOT_PREFIX)
        && !(DATA_TABLE_RESERVED_HEADER_SLOT_NAMES as ReadonlyArray<string>).includes(name)
}

export function pickDataTableRowsSlotNames (names: Array<string>): Array<TDataTableRowsSlotName> {
    return names.filter((name): name is TDataTableRowsSlotName => {
        return (DATA_TABLE_ROWS_SLOT_NAMES as ReadonlyArray<string>).includes(name)
            || isDataTableItemColumnSlot(name)
            || isDataTableHeaderColumnSlot(name)
    })
}

export function pickDataTableHeaderColumnSlotNames (names: Array<string>): Array<TDataTableHeaderColumnSlotName> {
    return names.filter(isDataTableHeaderColumnSlot)
}

export function pickDataTableItemColumnSlotNames (names: Array<string>): Array<TDataTableItemColumnSlotName> {
    return names.filter(isDataTableItemColumnSlot)
}
