/*********************************************************
 * SCRATCH_DIR_PATTERNS — ce que git ignore, le runner doit l'ignorer
 *
 * @description
 * Les repertoires commencant par un point servent d'aire de brouillon dans
 * ce paquet : `.probe/` pour les sondes de diagnostic jetables, `.report/`
 * et `.results/` pour les sorties de Playwright. Tous sont gitignores.
 *
 * @description
 * ⛔ Gitignore ne veut PAS dire ignore par le runner, et c'est la le piege.
 * `vitest.config.ts` n'excluait pas `.probe/` : vitest y ramassait 12
 * fichiers NON SUIVIS apportant 28 tests a chaque execution locale. CI clone
 * a froid, donc ces 28 tests n'y ont jamais tourne — la porte locale et la
 * porte CI n'etaient pas la meme porte, et les comptes remontes incluaient
 * du travail qu'aucun relecteur ne pouvait reproduire (issue #516).
 *
 * @description
 * Le symptome fut un rouge : une sonde perimee affirmant qu'`OrigamMenu`
 * n'emet jamais `contextmenu`, longtemps apres que cet emit eut ete
 * implemente. **Le cas symetrique est plus dangereux** : une sonde de
 * brouillon qui PASSE masque une regression reelle, et rien ne le signale.
 *
 * @description
 * Cote Playwright le trou est OUVERT mais non exploite a ce jour — aucun
 * `.spec.ts` ne vit sous un chemin gitignore (verifie par `git check-ignore`
 * sur `e2e/`, `a11y/` et `vrt/`). Cette constante le ferme par avance sur
 * les trois configs dont le `testMatch` ne restreint pas deja la collecte a
 * une liste nommee : `playwright.config.ts`, `playwright.a11y.config.ts`,
 * `playwright.vrt.config.ts`. Les configs marketing sont immunisees par
 * construction, leur `testMatch` enumere les fichiers.
 ********************************************************/
export const SCRATCH_DIR_PATTERNS = ['**/.*/**']
