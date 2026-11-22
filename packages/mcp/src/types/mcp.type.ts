/*********************************************************
 * Types du serveur MCP origam
 ********************************************************/

/** Environnement cible d'un appel (`local` par defaut). */
export type TEnvName = 'local' | 'dev' | 'prod'

/** Methode HTTP utilisee par le client maison. */
export type THttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

/** Valeur de query-string acceptee (les `undefined` sont omis). */
export type TQueryValue = string | number | boolean | undefined
