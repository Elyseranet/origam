/*********************************************************
 * Découverte des self-tests des gardes (#964)
 *
 * @description
 * ⛔ POURQUOI CE FICHIER EXISTE. `run-all-selftests.mjs` ne lisait qu'un seul
 * répertoire — `const LIB = path.join(HERE, 'lib')`. Cinq self-tests vivent au
 * niveau `guards/` et n'étaient donc invoqués par RIEN : ni le runner, ni la
 * CI, ni un script npm. Leurs seules « références » dans le dépôt étaient les
 * lignes `Run: node …` de leurs propres en-têtes, c'est-à-dire des
 * commentaires expliquant comment les lancer à la main.
 *
 *     guards/comment-format.selftest.mjs
 *     guards/layer-folders.selftest.mjs
 *     guards/no-usedefaults-in-components.selftest.mjs
 *     guards/pnpm-tree-integrity.selftest.mjs
 *     guards/token-var-channels.selftest.mjs
 *
 * @description
 * ⛔ CE QUE ÇA COÛTAIT, ET POURQUOI CE N'EST PAS COSMÉTIQUE. `CLAUDE.md`
 * énonce la garantie ainsi : « une garde dont l'extracteur a régressé devient
 * MUETTE, et un détecteur silencieux et un dépôt propre produisent le même
 * vert — donc un `guards` vert ne veut rien dire sans `guards:self` ». Pour
 * ces cinq-là, la garantie annoncée n'existait pas. Et l'ironie était
 * structurelle : `token-var-channels` est le garde le plus sollicité du dépôt
 * — celui que `CLAUDE.md` désigne dès qu'on touche aux feuilles de tokens — et
 * son self-test était parmi les orphelins.
 *
 * @description
 * ROUTE RETENUE : élargir la découverte, ne déplacer aucun fichier. Les deux
 * routes que le ticket ouvrait se valaient sur le fond ; celle-ci ne casse ni
 * les chemins documentés dans les en-têtes des cinq fichiers, ni ceux du
 * `README.md` des gardes, ni les commandes que quelqu'un a pu mettre dans un
 * alias. Les self-tests sont lancés comme des PROGRAMMES (`spawnSync`), pas
 * importés : un éventuel effet de bord au chargement est donc sans objet — ils
 * sont faits pour s'exécuter, et les cinq le font proprement.
 *
 * @description
 * ⛔ ET LA RÉCIDIVE EST FERMÉE. `findOrphanSelftests` balaie TOUT
 * `scripts/` et signale n'importe quel `*.selftest.mjs` que la découverte ne
 * ramènerait pas — un fichier rangé à un troisième niveau, par exemple. Sans
 * ce contrôle, le prochain self-test écrit au mauvais endroit serait orphelin
 * exactement de la même façon, et personne ne le saurait : c'est très
 * précisément le mode de défaillance de #964.
 ********************************************************/

import { readdirSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'

/** Suffixe qui fait d'un fichier un self-test. */
export const SELFTEST_SUFFIX = '.selftest.mjs'

/*********************************************************
 * Les niveaux que la découverte ramène, relatifs à `scripts/guards`
 *
 * @description
 * `guards/` et `guards/lib/` existent pour des raisons historiques — le
 * self-test d'un garde a été rangé à côté du garde, celui d'un scanner à côté
 * du scanner — et aucune des deux conventions n'est fautive. Ce qui était
 * fautif, c'est qu'une seule des deux était lue.
 *
 * @description
 * ⛔ `../analysis` EST UN SIXIÈME ORPHELIN, QUE #964 N'AVAIT PAS RECENSÉ.
 * Le contrôle anti-récidive écrit pour ce ticket l'a trouvé tout seul :
 * `scripts/analysis/inspection-harness.selftest.mjs` — 28 cas C8, précision et
 * rappel épinglés des deux côtés — n'était lui non plus invoqué par rien.
 * Lancé à froid, il passe.
 *
 * @description
 * ⚠️ C'est une DÉCISION DE PÉRIMÈTRE, pas une évidence, et elle est signalée
 * comme telle : `analysis/` n'est pas une garde mais un scanner de campagne,
 * donc l'inclure élargit ce que `guards:self` veut dire — « les détecteurs du
 * DS mesurent encore » plutôt que « les gardes mesurent encore ». Elle a été
 * prise parce que l'alternative — exempter `analysis/` du contrôle — consiste
 * à reproduire exactement le défaut que #964 existe pour fermer, sur un
 * détecteur dont personne ne saurait qu'il a cessé de mesurer. Elle se
 * renverse en retirant cette ligne.
 ********************************************************/
export const DISCOVERED_LEVELS = [ '.', 'lib', '../analysis' ]

/*********************************************************
 * discoverSelftests — la liste, découverte et jamais écrite
 *
 * @description
 * Une liste tenue à la main est précisément le mécanisme par lequel un
 * détecteur finit orphelin — c'est l'argument que portait déjà l'en-tête du
 * runner, et #964 est ce qui arrive quand la découverte, elle, est trop
 * étroite.
 *
 * @param guardsRoot  répertoire `scripts/guards`
 * @returns string[] chemins RELATIFS à `guardsRoot`, triés (ex. `lib/emits.selftest.mjs`)
 ********************************************************/
export function discoverSelftests (guardsRoot) {
    const found = []

    for (const level of DISCOVERED_LEVELS) {
        const dir = path.join(guardsRoot, level)
        if (!existsSync(dir)) continue

        for (const entry of readdirSync(dir)) {
            if (!entry.endsWith(SELFTEST_SUFFIX)) continue
            if (!statSync(path.join(dir, entry)).isFile()) continue
            found.push(level === '.' ? entry : path.join(level, entry))
        }
    }

    return found.sort()
}

/*********************************************************
 * findOrphanSelftests — les self-tests que la découverte RATERAIT
 *
 * @description
 * Le contrôle anti-récidive. Il descend tout `scriptsRoot` et rend tout
 * `*.selftest.mjs` absent de la liste découverte. Un résultat non vide est un
 * échec du runner, pas un avertissement : un self-test que rien n'exécute est
 * une garantie affichée qui n'existe pas.
 *
 * @param scriptsRoot  répertoire `scripts` (on remonte au-dessus de `guards`)
 * @param guardsRoot   répertoire `scripts/guards`
 * @returns string[] chemins relatifs à `scriptsRoot`, triés
 ********************************************************/
export function findOrphanSelftests (scriptsRoot, guardsRoot) {
    const discovered = new Set(
        discoverSelftests(guardsRoot).map((rel) => path.resolve(guardsRoot, rel))
    )

    const orphans = []

    const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
            if (entry === 'node_modules') continue
            const full = path.join(dir, entry)
            if (statSync(full).isDirectory()) walk(full)
            else if (entry.endsWith(SELFTEST_SUFFIX) && !discovered.has(full)) {
                orphans.push(path.relative(scriptsRoot, full))
            }
        }
    }

    if (existsSync(scriptsRoot)) walk(scriptsRoot)

    return orphans.sort()
}
