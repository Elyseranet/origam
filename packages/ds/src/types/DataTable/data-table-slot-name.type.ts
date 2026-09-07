import { DATA_TABLE_ROWS_SLOT_NAMES } from '../../consts/DataTable/data-table.const'

/*********************************************************
 * Noms de slots relayes dans la famille DataTable
 *
 * @description
 * Un nom de slot dynamique (`<slot :name="name">`) doit rester un type
 * LITTERAL, jamais `string` : c'est ce qui permet a TypeScript d'indexer
 * l'interface de slots du composant cible. Un `Array<string>` sortant
 * d'un `filter()` produit `TS7053` sur chaque relais.
 *
 * @description
 * Ces trois types sont donc le contrat de sortie des helpers de
 * `utils/DataTable/slot-name.util.ts`.
 ********************************************************/

/** A column-driven `header.{key}` slot name. */
export type TDataTableHeaderColumnSlotName = `header.${string}`

/** A column-driven `item.{key}` slot name. */
export type TDataTableItemColumnSlotName = `item.${string}`

/** Every slot name `<OrigamDataTableRows>` can receive from its parent. */
export type TDataTableRowSlotName = TDataTableItemColumnSlotName | TDataTableHeaderColumnSlotName

/** Every slot name `<OrigamDataTable>` relays to `<OrigamDataTableRows>`. */
export type TDataTableRowsSlotName = typeof DATA_TABLE_ROWS_SLOT_NAMES[number] | TDataTableRowSlotName
