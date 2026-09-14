import type { IInternalDataTableHeader } from '../../interfaces/DataTable/data-table-header.interface'

/*********************************************************
 * useCell
 ********************************************************/
/*********************************************************
 * useCell
 *
 * @description
 * Resout le `padding` d'une cellule de `<origam-data-table>` a partir de sa
 * colonne. Retourne `{ getPadding }`.
 *
 * @description
 * ⛔ Les deux colonnes de chrome — `data-table-select` et `data-table-expand`
 * — recoivent un padding FIXE de `'0 8'` qui prime sur `column.padding`. Ce
 * sont des colonnes de controle, pas de donnees : leur largeur doit rester
 * constante quel que soit le reglage du consommateur, sinon la case a cocher
 * et le chevron se decalent d'une ligne a l'autre.
 *
 * @description
 * Pour toute autre colonne, `column.padding` est rendu tel quel, et
 * `undefined` quand rien n'est defini — la cellule garde alors le padding de
 * la feuille de style.
 ********************************************************/
export function useCell () {
    const getPadding = (column: IInternalDataTableHeader) => {
        if (column.key === 'data-table-select' || column.key === 'data-table-expand') {
            return '0 8'
        }

        if (column.padding) {
            return column.padding
        }

        return undefined
    }


    return {
        getPadding
    }
}
