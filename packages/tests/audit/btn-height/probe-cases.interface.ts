/*********************************************************
 * IBtnProbeCase
 *
 * @description
 * Un cas de la matrice Btn : une cle stable (elle apparie la mesure d'avant
 * et celle d'apres), les props passes au composant et la largeur du
 * conteneur — `null` pour un conteneur sans contrainte.
 ********************************************************/
export interface IBtnProbeCase {
    key: string
    props: Record<string, unknown>
    label: string | null
    containerWidth: number | null
}

/*********************************************************
 * IBtnProbeConfig
 *
 * @description
 * Ce que le pilote Playwright ecrit dans `window.__ORIGAM_BTN_PROBE__` via
 * `addInitScript`, donc AVANT le parse du document.
 ********************************************************/
export interface IBtnProbeConfig {
    identity: string
    mode: string
}
