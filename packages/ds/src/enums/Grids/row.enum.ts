export enum FLEX_DIRECTION {
    ROW = 'row',
    COLUMN = 'column',
    COLUMN_REVERSE = 'column-reverse',
    ROW_REVERSE = 'row-reverse'
}

/*********************************************************
 * ROW_GUTTER
 *
 * @description
 * Echelons de gouttiere de la grille. La valeur d'un echelon est la
 * gouttiere TOTALE entre deux colonnes voisines : chaque `<origam-col>`
 * en pose la moitie en padding de chaque cote, et le `<origam-row>` en
 * retire la moitie en marge negative pour que le bord exterieur de la
 * grille affleure son conteneur.
 *
 * @description
 * Les valeurs vivent dans les feuilles de tokens
 * (`--origam-row--gutter-{echelon}---gap`), pas ici : cet enum ne nomme
 * que les echelons.
 ********************************************************/
export enum ROW_GUTTER {
    NONE = 'none',
    DENSE = 'dense',
    DEFAULT = 'default',
    COMFORTABLE = 'comfortable'
}
