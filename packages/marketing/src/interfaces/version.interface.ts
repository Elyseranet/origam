/** Réponse du registre npm `dist-tags` lue par `/api/npm-version`. */
export interface INpmDistTagsResponse {
    latest: string
    [key: string]: string
}

export interface INpmVersionData {
    version: string
}
