/** Familles de pages de l'en-tête commun « Vallée » (#1584) : chacune choisit son décor, jeu fermé. */
export enum ENSO_PAGE_HEADER_FAMILY {
    CATALOG = 'catalog',
    EDITORIAL = 'editorial',
    LEGAL = 'legal',
    TOOL = 'tool'
}

/** Plan du décor : `BACK` est le plus lointain (dessiné en premier), `FRONT` le plus proche. */
export enum ENSO_PAGE_HEADER_PLANE {
    BACK = 'back',
    FRONT = 'front'
}
