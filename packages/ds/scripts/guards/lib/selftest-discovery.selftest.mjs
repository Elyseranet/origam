/*********************************************************
 * Self-test — `lib/selftest-discovery.mjs` (#964)
 *
 * @description
 * ⛔ POURQUOI IL EXISTE, ET POURQUOI IL EST LE PLUS IMPORTANT DU LOT. Ce
 * détecteur-ci décide QUELS détecteurs sont exécutés. S'il devient aveugle,
 * il ne rend pas un rouge : il rend un récapitulatif « N/N verts » sur une
 * liste amputée. C'est le faux vert à l'étage au-dessus — un détecteur muet et
 * un dépôt propre produisent le même vert, sauf qu'ici la victime est la
 * garantie elle-même.
 *
 * @description
 * C'est exactement ce qui s'est produit : `run-all-selftests.mjs` ne lisait
 * que `lib/`, cinq self-tests vivaient au niveau `guards/`, et le
 * récapitulatif affichait fièrement « 17/17 verts » en ignorant cinq
 * détecteurs — dont celui de `token-var-channels`, le garde le plus sollicité
 * du dépôt.
 *
 * @description
 * Les trois façons dont cette découverte peut redevenir aveugle, chacune
 * épinglée ci-dessous :
 *
 *   1. **Un niveau cesse d'être lu** — la régression exacte de #964. Le cas
 *      `deux niveaux` échoue si `guards/` ou `lib/` sort de la liste.
 *   2. **Le contrôle anti-récidive cesse de voir** — un self-test rangé
 *      ailleurs redevient orphelin en silence.
 *   3. **Le contrôle devient bruyant** — il accuse un fichier que la
 *      découverte ramène pourtant, et le runner refuse de démarrer sur un
 *      dépôt sain.
 *
 * @description
 * ⛔ La dernière section mesure le DÉPÔT RÉEL, délibérément, et c'est une
 * exception assumée au principe « un self-test qui dépend de l'arbre mesure
 * l'arbre, pas le détecteur ». Ici l'arbre EST le sujet : on exige que les
 * cinq fichiers nommés par #964 soient effectivement découverts aujourd'hui.
 * Si quelqu'un les déplace un jour, ce test le dira — et c'est ce qu'on veut.
 *
 * Run: node packages/ds/scripts/guards/lib/selftest-discovery.selftest.mjs
 ********************************************************/

import path from 'node:path'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { discoverSelftests, findOrphanSelftests, DISCOVERED_LEVELS, SELFTEST_SUFFIX } from './selftest-discovery.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const GUARDS_ROOT = path.resolve(HERE, '..')
const SCRIPTS_ROOT = path.resolve(GUARDS_ROOT, '..')

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }
const ok = (msg) => console.log(`  ok    ${msg}`)

console.log('─'.repeat(70))
console.log('Self-test: selftest-discovery (#964)')
console.log('─'.repeat(70))

/*********************************************************
 * Partie 1 — la découverte ramène LES DEUX niveaux
 *
 * ⛔ C'est la régression de #964, en une assertion. Sur un arbre synthétique
 * portant un self-test à chaque niveau, en ramener un seul est l'état d'avant.
 ********************************************************/
console.log('\ndiscoverSelftests — `guards/` ET `guards/lib/` sont lus :')

{
    const tmp = mkdtempSync(path.join(tmpdir(), 'origam-std-'))
    try {
        mkdirSync(path.join(tmp, 'lib'), { recursive: true })
        writeFileSync(path.join(tmp, `au-niveau-guards${SELFTEST_SUFFIX}`), '// vide')
        writeFileSync(path.join(tmp, 'lib', `au-niveau-lib${SELFTEST_SUFFIX}`), '// vide')

        // Précision : un fichier qui n'est pas un self-test ne doit pas entrer.
        writeFileSync(path.join(tmp, 'un-garde.mjs'), '// vide')
        writeFileSync(path.join(tmp, 'lib', 'un-scanner.mjs'), '// vide')

        const found = discoverSelftests(tmp)
        const expected = [ `au-niveau-guards${SELFTEST_SUFFIX}`, path.join('lib', `au-niveau-lib${SELFTEST_SUFFIX}`) ]

        if (found.join('|') === expected.join('|')) {
            ok('les deux niveaux sont découverts, et rien d\'autre')
        } else fail(`deux niveaux — attendu [${expected.join(', ')}], obtenu [${found.join(', ')}]`)

        if (!found.some((f) => f.endsWith('un-garde.mjs') || f.endsWith('un-scanner.mjs'))) {
            ok('un `.mjs` ordinaire n\'est pas pris pour un self-test')
        } else fail('un fichier non-self-test a été découvert')
    } finally {
        rmSync(tmp, { recursive: true, force: true })
    }
}

{
    // ⛔ Preuve de CONSTANTE en plus de la preuve d'exécution : si quelqu'un
    // retire un niveau de la liste, le cas ci-dessus rougit déjà, mais ce
    // contrôle nomme la cause au lieu de laisser chercher.
    const REQUIRED_LEVELS = [ '.', 'lib', '../analysis' ]
    const missingLevels = REQUIRED_LEVELS.filter((l) => !DISCOVERED_LEVELS.includes(l))

    if (!missingLevels.length) {
        ok('DISCOVERED_LEVELS couvre `guards/`, `guards/lib/` et `analysis/` (le 6e orphelin)')
    } else fail(`DISCOVERED_LEVELS = [${DISCOVERED_LEVELS.join(', ')}] — manque [${missingLevels.join(', ')}]`)
}

/*********************************************************
 * Partie 2 — le contrôle anti-récidive voit, et ne crie pas à tort
 ********************************************************/
console.log('\nfindOrphanSelftests — un self-test rangé hors des niveaux lus est signalé :')

{
    const tmp = mkdtempSync(path.join(tmpdir(), 'origam-std-'))
    try {
        const guards = path.join(tmp, 'guards')
        mkdirSync(path.join(guards, 'lib', 'sous-niveau'), { recursive: true })
        mkdirSync(path.join(tmp, 'analysis'), { recursive: true })
        mkdirSync(path.join(tmp, 'outillage'), { recursive: true })

        /*
         * Découverts — ne doivent PAS être signalés. Les trois niveaux de
         * `DISCOVERED_LEVELS` sont représentés, `analysis/` compris : c'est ce
         * qui prouve que le 6e orphelin cesse bien d'en être un.
         */
        writeFileSync(path.join(guards, `ok-guards${SELFTEST_SUFFIX}`), '// vide')
        writeFileSync(path.join(guards, 'lib', `ok-lib${SELFTEST_SUFFIX}`), '// vide')
        writeFileSync(path.join(tmp, 'analysis', `ok-analysis${SELFTEST_SUFFIX}`), '// vide')

        /*
         * Orphelins — un niveau sous `lib/`, et un répertoire voisin qui n'est
         * dans aucun niveau lu. C'est la forme exacte du défaut #964.
         */
        writeFileSync(path.join(guards, 'lib', 'sous-niveau', `perdu${SELFTEST_SUFFIX}`), '// vide')
        writeFileSync(path.join(tmp, 'outillage', `egare${SELFTEST_SUFFIX}`), '// vide')

        const orphans = findOrphanSelftests(tmp, guards)
        const expected = [
            path.join('guards', 'lib', 'sous-niveau', `perdu${SELFTEST_SUFFIX}`),
            path.join('outillage', `egare${SELFTEST_SUFFIX}`)
        ]

        if (orphans.join('|') === expected.join('|')) {
            ok('rappel : les deux orphelins sont signalés, sous `lib/` comme dans un répertoire non lu')
        } else fail(`orphelins — attendu [${expected.join(', ')}], obtenu [${orphans.join(', ')}]`)

        if (!orphans.some((o) => o.includes('ok-guards') || o.includes('ok-lib') || o.includes('ok-analysis'))) {
            ok('précision : un self-test rangé sur l\'un des 3 niveaux lus n\'est pas accusé')
        } else fail(`faux positif — [${orphans.join(', ')}]`)
    } finally {
        rmSync(tmp, { recursive: true, force: true })
    }
}

{
    // ⛔ Le dépôt réel ne doit porter AUCUN orphelin. Si celui-ci rougit, un
    // self-test vient d'être écrit à un endroit que le runner ne lit pas.
    const orphans = findOrphanSelftests(SCRIPTS_ROOT, GUARDS_ROOT)
    if (!orphans.length) {
        ok('le dépôt réel ne porte aucun self-test orphelin')
    } else fail(`le dépôt porte ${orphans.length} orphelin(s) : ${orphans.join(', ')}`)
}

/*********************************************************
 * Partie 3 — les cinq orphelins de #964 sont bel et bien câblés
 *
 * ⛔ Mesure du dépôt réel, assumée. Ces cinq noms sont ceux que #964 a
 * recensés ; les perdre à nouveau est précisément la régression à empêcher.
 ********************************************************/
console.log('\nles cinq orphelins nommés par #964 sont découverts :')

{
    const discovered = new Set(discoverSelftests(GUARDS_ROOT))
    const FORMERLY_ORPHANED = [
        'comment-format.selftest.mjs',
        'layer-folders.selftest.mjs',
        'no-usedefaults-in-components.selftest.mjs',
        'pnpm-tree-integrity.selftest.mjs',
        'token-var-channels.selftest.mjs'
    ]

    const missing = FORMERLY_ORPHANED.filter((f) => !discovered.has(f))

    if (!missing.length) {
        ok(`les 5 self-tests du niveau guards/ sont dans la liste (total découvert : ${discovered.size})`)
    } else fail(`toujours orphelin(s) : ${missing.join(', ')}`)

    // ⛔ Le SIXIÈME, que #964 n'avait pas recensé et que le contrôle
    // anti-récidive a trouvé seul. Voir DISCOVERED_LEVELS pour la décision
    // de périmètre qu'il a imposée.
    const sixth = path.join('..', 'analysis', 'inspection-harness.selftest.mjs')
    if (discovered.has(sixth)) {
        ok('le 6e orphelin (`analysis/inspection-harness`) est câblé lui aussi')
    } else fail(`6e orphelin non découvert — attendu ${sixth}`)
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} cas de self-test en echec.`)
    process.exit(1)
}
console.log('PASS — 3 cas de decouverte, 3 cas d\'orphelins, 2 cas de depot reel.')
