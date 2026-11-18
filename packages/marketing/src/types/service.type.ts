/** Méthodes HTTP émises par les services du front. */
export type TServiceHttpMethod = 'GET' | 'POST' | 'PATCH'

/** Paramètres de query string : une valeur `undefined` est omise par `$fetch`. */
export type TServiceQuery = Record<string, string | number | boolean | undefined>
