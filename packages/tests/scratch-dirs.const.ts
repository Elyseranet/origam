import { resolve } from 'node:path'

/*********************************************************
 * scratchDirPatterns — ce que git ignore, le runner doit l'ignorer
 *
 * @description
 * Les repertoires commencant par un point servent d'aire de brouillon dans
 * ce paquet : `.probe/` pour les sondes de diagnostic jetables, `.report/`
 * et `.results/` pour les sorties de Playwright. Tous sont gitignores.
 *
 * @description
 * ⛔ Gitignore ne veut PAS dire ignore par le runner, et c'est le piege.
 * `vitest.config.ts` n'excluait pas `.probe/` : vitest y ramassait 12
 * fichiers NON SUIVIS apportant 28 tests a chaque execution locale. CI clone
 * a froid, donc ces 28 tests n'y ont jamais tourne — la porte locale et la
 * porte CI n'etaient pas la meme porte (issue #516).
 *
 * @description
 * ⛔⛔ POURQUOI CECI EST UNE FONCTION ET NON UNE CONSTANTE — regression reelle,
 * pas une precaution theorique. La premiere version exportait le motif nu
 * `'**\/.*\/**'`. Playwright fait correspondre `testIgnore` au chemin
 * **ABSOLU** du fichier. Or les worktrees d'agents vivent sous
 * `.claude/worktrees/<nom>/` — un repertoire-point. Le motif matchait donc
 * ce segment du chemin absolu et **excluait la TOTALITE des specs e2e dans
 * tout worktree** : `Total: 0 tests in 0 files`, la ou le worktree principal
 * en collectait 7734. Un agent lancant l'e2e depuis son worktree recevait
 * un vert vide, indistinguable d'un vert reel.
 *
 * @description
 * ⛔ Et le controle negatif d'origine n'avait rien vu parce qu'il n'a tourne
 * QUE dans le worktree principal — le seul endroit ou le chemin absolu ne
 * contient aucun repertoire-point, donc le seul endroit ou le defaut ne peut
 * pas se manifester. Un controle qui ferme sur une population ne prouve rien
 * sur les autres.
 *
 * @description
 * La parade est d'ancrer sur le `testDir` ABSOLU : le prefixe litteral
 * consomme les repertoires-points du chemin d'accueil, et seul un
 * repertoire-point situe SOUS le `testDir` declenche l'exclusion.
 *
 * @description
 * ⛔ ET C'EST UNE EXPRESSION REGULIERE, PAS UN GLOB — mesure, pas preference.
 * La variante glob ancree (`<abs>/**\/.*\/**`) corrige bien le sur-matching,
 * mais **cesse d'exclure quoi que ce soit** : un temoin depose dans
 * `e2e/.probe/` etait de nouveau collecte (7734 -> 7737 tests, 154 fichiers).
 * Le `**` de minimatch ne traverse pas les segments commencant par un point
 * sans l'option `dot`, que Playwright n'expose pas. `testIgnore` accepte des
 * `RegExp` appliquees au chemin absolu : la forme reguliere dit exactement ce
 * qu'on veut, sans dependre d'une option de glob qu'on ne controle pas.
 *
 * @description
 * Les deux controles qui doivent passer ENSEMBLE, et qu'il faut rejouer a
 * toute modification de cette fonction :
 *   - NEGATIF — depuis un worktree sous `.claude/worktrees/`, la collecte
 *     doit rester pleine (153 fichiers e2e), pas `0 tests in 0 files`.
 *   - POSITIF — une spec deposee dans `<testDir>/.probe/` doit rester
 *     ABSENTE de la collecte.
 * Le premier seul avait laisse passer la regression ; le second seul aurait
 * laisse passer la sur-exclusion.
 *
 * @param testDir Chemin du repertoire de tests, tel que passe a `testDir`.
 * @returns Les motifs a passer a `testIgnore`, ancres sur le chemin absolu.
 ********************************************************/
export function scratchDirPatterns (testDir: string): RegExp[] {
    const root = resolve(testDir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    return [new RegExp(`^${root}/(?:.*/)?\\.[^/]+/`)]
}
