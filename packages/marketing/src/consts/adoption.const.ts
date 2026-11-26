export const GITHUB_REPO_API_URL = 'https://api.github.com/repos/Elyseranet/origam'

/** Téléchargements npm des 7 derniers jours (API publique, sans authentification). */
export const NPM_DOWNLOADS_WEEK_URL = 'https://api.npmjs.org/downloads/point/last-week/origam'

/** Dist-tags npm du paquet `origam` (API publique, sans authentification). */
export const NPM_REGISTRY_DIST_TAGS_URL = 'https://registry.npmjs.org/-/package/origam/dist-tags'

/**
 * Seuils d'affichage des compteurs d'adoption (décision du propriétaire, #1543 A7) :
 * sous ces valeurs, un compteur se lit comme un manque de traction, il reste masqué.
 * Vaut pour le bouton étoiles du header et tout futur compteur de téléchargements.
 */
export const GITHUB_STARS_MIN_DISPLAY = 500

/** Téléchargements npm sur 30 jours sous lesquels aucun compteur n'est affiché. */
export const NPM_MONTHLY_DOWNLOADS_MIN_DISPLAY = 50000
