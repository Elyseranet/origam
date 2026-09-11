import OrigamDataTableRows from '../../components/DataTable/OrigamDataTableRows.vue'

export type TOrigamDataTableRows = InstanceType<typeof OrigamDataTableRows>

/*********************************************************
 * Noms de slots recus par `<OrigamDataTableRows>`
 *
 * @description
 * Un nom de slot dynamique (`<slot :name="name">`) doit rester un type
 * LITTERAL, jamais `string` : c'est ce qui permet a TypeScript d'indexer
 * l'interface de slots du composant cible. Un `Array<string>` sortant d'un
 * `filter()` produit `TS7053` sur chaque relais.
 *
 * @description
 * Ces types sont le contrat de sortie des helpers de
 * `utils/DataTable/slot-name.util.ts`.
 *
 * @description
 * `TDataTableHeaderColumnSlotName` designe un slot `header.{cle}` et
 * `TDataTableItemColumnSlotName` un slot `item.{cle}`, tous deux pilotes par
 * une colonne. Leur union, `TDataTableRowSlotName`, couvre tout ce que
 * `<OrigamDataTableRows>` peut recevoir de son parent.
 ********************************************************/
export type TDataTableHeaderColumnSlotName = `header.${string}`

export type TDataTableItemColumnSlotName = `item.${string}`

export type TDataTableRowSlotName = TDataTableItemColumnSlotName | TDataTableHeaderColumnSlotName
