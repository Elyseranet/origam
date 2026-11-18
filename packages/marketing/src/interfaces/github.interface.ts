/** Sous-ensemble de la réponse de l'API GitHub `GET /repos/:owner/:repo` lu par `/api/github-stars`. */
export interface IGithubRepoResponse {
    stargazers_count: number
}

export interface IGithubStarsData {
    /** `null` = valeur indisponible (API injoignable) : ne jamais l'afficher comme un chiffre. */
    stars: number | null
}
