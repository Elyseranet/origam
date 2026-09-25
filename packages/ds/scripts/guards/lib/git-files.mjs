/*********************************************************
 * Énumération de fichiers par l'INDEX GIT, pas par le disque (#966)
 *
 * @description
 * ⛔ POURQUOI CE FICHIER EXISTE. Un garde qui descend le disque avec
 * `readdirSync` mesure l'arbre de travail de CELUI qui le lance, pas le
 * contenu du dépôt. Les deux divergent dès qu'un build a tourné, et la
 * divergence est invisible : le garde reste vert en CI (checkout neuf) et
 * devient rouge sur les postes — c'est-à-dire exactement là où un mainteneur
 * le lance avant de committer.
 *
 * @description
 * MESURÉ, #966, garde 30 (`token-var-channels-marketing`). Le même arbre, la
 * seule variable étant la présence de `packages/marketing/public/stories/`
 * (35 Mo, ZÉRO fichier suivi, sortie d'un `pnpm -F @origam/stories build`
 * recopiée dans le `public/` du marketing) :
 *
 *     artefact présent : 29/30, exit 1, des centaines de violations, 8 périmées
 *     artefact écarté  : 30/30, exit 0, 0 violation,                0 périmée
 *
 * @description
 * ⛔ ET LA POLLUTION VA DANS LES DEUX SENS — c'est ce qui rend le symptôme
 * dangereux plutôt que simplement pénible. Le bundle DÉCLARE des milliers de
 * `--origam-*`, donc il entre aussi dans l'ensemble ÉMETTEUR du garde : des
 * lectures légitimement mortes apparaissent soudain « déclarées », donc
 * « corrigées ». Reproduit ici avec un faux fichier de TROIS lignes : une
 * seule déclaration `--origam-layout---position-top: 0px` a fait passer
 * 8 entrées de baseline en « STALE — already fixed ». Un mainteneur qui suit
 * le message du garde supprime 8 lignes décrivant de vrais défauts, en
 * croyant progresser.
 *
 * @description
 * LA CORRECTION DE FOND est de changer de source de vérité, pas d'allonger
 * une liste de noms à sauter. `IGNORED_DIRS` (`node_modules`, `.nuxt`,
 * `.output`, `dist`, `.data`) ne contenait pas `public/` — et n'aurait jamais
 * contenu le prochain nom. L'index git, lui, sait déjà ce qui appartient au
 * dépôt : `packages/marketing/.gitignore:16` porte `public/stories` depuis le
 * jour où l'embed a été mis en place.
 *
 * @description
 * ⛔ POURQUOI `--others --exclude-standard` EN PLUS DE `--cached`. Se limiter
 * aux fichiers SUIVIS introduirait un faux négatif neuf : un fichier source
 * qu'un développeur vient d'écrire et n'a pas encore `git add`é ne serait pas
 * balayé, et le garde serait vert sur du code réellement fautif — exactement
 * le faux vert que ces gardes existent pour fermer. On prend donc aussi les
 * fichiers NON suivis que `.gitignore` ne couvre pas. L'ensemble obtenu est
 * « tout ce qui appartient au dépôt ou est en route pour y entrer », et il
 * exclut par construction tout artefact de build — puisqu'un artefact de
 * build est, par définition de ce dépôt, ignoré.
 *
 * @description
 * ⛔ CE MODULE NE DOIT PAS ÊTRE UTILISÉ PAR `pnpm-tree-integrity`. Ce garde
 * scanne `node_modules/` DÉLIBÉRÉMENT — y chercher des copies physiques
 * laissées par un `npm install` est toute sa raison d'être. Un arbre ignoré
 * n'est pas toujours un artefact hors sujet ; c'est parfois le sujet.
 ********************************************************/

import { execFileSync } from 'node:child_process'
import path from 'node:path'

/*********************************************************
 * listRepoFiles — les fichiers d'un sous-arbre, vus par git
 *
 * @description
 * Rend les chemins ABSOLUS des fichiers que git reconnaît sous `root` :
 * suivis (`--cached`) plus non-suivis-non-ignorés (`--others
 * --exclude-standard`). Les artefacts de build, ignorés par `.gitignore`,
 * n'en font jamais partie.
 *
 * ⛔ Échoue FORT si git ne répond pas. Rendre une liste vide serait la pire
 * issue possible : un garde muet et un dépôt propre produisent le même vert,
 * et personne ne verrait la différence.
 *
 * @param root      racine absolue du sous-arbre à énumérer
 * @param repoRoot  racine du dépôt (cwd de l'appel git, base des chemins rendus)
 * @returns string[] chemins absolus, dédupliqués, triés
 ********************************************************/
export function listRepoFiles (root, repoRoot) {
    const pathspec = path.relative(repoRoot, root) || '.'

    let stdout
    try {
        stdout = execFileSync('git', [
            'ls-files', '-z',
            '--cached', '--others', '--exclude-standard',
            '--', pathspec
        ], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    } catch (error) {
        throw new Error(
            `listRepoFiles: git ls-files a échoué dans ${repoRoot} (pathspec « ${pathspec} »).`
            + ' Ce garde énumère les fichiers par l\'index git — sans git il ne peut pas mesurer,'
            + ' et rendre une liste vide serait un faux vert.'
            + ` Cause : ${error.message}`
        )
    }

    // `git ls-files --cached --others` peut nommer deux fois un fichier à la
    // fois indexé et présent sur le disque : on déduplique.
    const relative = new Set(stdout.split('\0').filter(Boolean))

    return [ ...relative ].sort().map((rel) => path.join(repoRoot, rel))
}
