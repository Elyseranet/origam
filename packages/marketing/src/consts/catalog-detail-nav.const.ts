/**
 * Constantes de la navigation des fiches de détail du catalogue (#1032).
 */

/**
 * Nom du slot indexé d'`OrigamBreadcrumb` qui remplace le maillon 0 (la
 * famille). Contient un point : il ne peut s'écrire qu'en slot dynamique.
 */
export const CATALOG_BREADCRUMB_FAMILY_SLOT = 'item.0'

/**
 * Encart « Same subject in the other families » (#1172) : au-delà de ce nombre
 * d'entrées, une famille se replie et propose « Show all N ». 12 = trois lignes
 * de quatre colonnes sur bureau. Les entrées repliées restent dans le DOM.
 */
export const CATALOG_RELATED_LIMIT = 12

/** Icône du bouton de repli de l'encart « même sujet » : ligne repliée, puis dépliée. */
export const CATALOG_RELATED_ICON_COLLAPSED = 'mdi-chevron-down'
export const CATALOG_RELATED_ICON_EXPANDED = 'mdi-chevron-up'

/**
 * Couleur du filet entre les lignes de l'encart « même sujet » : le jeton
 * sémantique de bordure par défaut, celui du cadre de la liste des props
 * (`RowList`). `border-block-start` seul peindrait en `currentColor`, c'est-à-dire
 * en couleur de texte. Le jeton `subtle` a été mesuré trop pâle sous le thème
 * origam du site (`rgba(0, 0, 0, 0.04)`).
 */
export const CATALOG_RELATED_RULE_COLOR = 'var(--origam-color__border---default)'
