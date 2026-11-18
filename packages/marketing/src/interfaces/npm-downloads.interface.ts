/** Réponse de l'API npm `downloads/point/last-week/:package` lue par `/api/npm-downloads`. */
export interface INpmDownloadsPointResponse {
    downloads: number
}

export interface INpmDownloadsData {
    /** `null` = valeur indisponible (API injoignable) : ne jamais l'afficher comme un chiffre. */
    downloads: number | null
}
