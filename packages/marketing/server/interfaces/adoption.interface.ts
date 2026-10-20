/** Réponse de `/api/github-stars` — `null` quand GitHub est injoignable (jamais un faux 0). */
export interface IGithubStarsResponse {
    stars: number | null
}

/** Réponse de `/api/npm-downloads` — `null` quand npm est injoignable (jamais un faux 0). */
export interface INpmDownloadsResponse {
    downloads: number | null
}

export interface IGithubRepoResponse {
    stargazers_count: number
}

export interface INpmDownloadsPointResponse {
    downloads: number
}
