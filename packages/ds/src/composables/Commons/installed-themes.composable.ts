import { inject } from 'vue'

import { ORIGAM_THEMES_KEY } from '../../consts/Commons/theme.const'

import type { TInstalledThemes } from '../../types/Commons/installed-theme.type'

/*********************************************************
 * useInstalledThemes
 *
 * @description
 * Retourne la liste des themes de marque installes via
 * `createOrigam({ themes })` — une entree par `name` de marque distincte,
 * chacune listant les modes concrets pour lesquels elle a ete installee.
 * Un consommateur (ex. un switch de theme) itere sur cette liste au lieu
 * de coder en dur les marques disponibles.
 *
 * @description
 * Retourne un tableau vide (jamais `undefined`) si aucun theme n'a ete
 * installe, ou hors d'une app qui a execute `createOrigam()` — aucun
 * garde-nul necessaire cote appelant. La liste est un instantane STATIQUE
 * pris a l'installation ; a coupler avec `useTheme()` pour lire/changer la
 * marque et le mode actifs.
 ********************************************************/
export function useInstalledThemes (): TInstalledThemes {
    return inject(ORIGAM_THEMES_KEY, [])
}
