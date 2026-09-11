#!/usr/bin/env node
/*********************************************************
 * Analyse — cycles du graphe d'imports de packages/ds/src
 *
 * @description
 * Construit le graphe d'imports internes puis calcule ses composantes
 * fortement connexes (Tarjan). Répond à l'étape 1 de l'issue #366 :
 * combien de cycles existent réellement, et lesquels disparaissent si le
 * code interne cesse de passer par les barrels.
 *
 * @description
 * Ce n'est PAS un garde : il n'échoue jamais, il mesure. Il est ici pour
 * que le chiffre soit reproductible plutôt que cité de mémoire — trois
 * valeurs différentes ont déjà circulé pour cette même question.
 *
 * @description
 * LA DISTINCTION QUI PORTE TOUT — type contre valeur.
 * Un `import type` est effacé à la compilation : il ne crée aucune arête à
 * l'exécution, donc aucun cycle d'initialisation. Confondre les deux
 * surestime le problème d'un facteur trois. Le graphe « valeurs » est le
 * seul qui décrit ce qui se passe vraiment au chargement.
 *
 * @description
 * POURQUOI CES CYCLES COMPTENT. `OrigamColorPicker` a porté des mois un
 * bug où `HSVtoRGB` et consorts valaient `undefined` pour les six modes :
 * `utils/index.ts` réexporte en `export *`, une dizaine de modules `utils/*`
 * réimportent depuis le barrel `consts`, donc `consts ↔ utils` boucle. Ce
 * qu'un fichier voit — de vraies fonctions ou `undefined` — dépend alors du
 * seul ordre d'entrée dans le graphe, et rien ne le signale.
 *
 * @description
 * LIMITE ASSUMÉE №1. Appartenir au cycle n'est pas être bogué. Un binding
 * importé puis utilisé DANS un corps de fonction est sûr, l'appel ayant
 * lieu après l'initialisation complète. Le danger est la capture au
 * niveau module (`const F = imported`, littéral d'objet de haut niveau).
 * Le nombre produit ici est donc une EXPOSITION, pas un décompte de bugs.
 *
 * @description
 * ⛔ LIMITE ASSUMÉE №2 — LA COLONNE « SANS BARRELS » EST OPTIMISTE.
 * Elle SUPPRIME les arêtes vers un `index.ts` au lieu de les RÉSOUDRE. Or
 * un fichier qui cesse d'importer du barrel n'a pas zéro dépendance : il
 * acquiert une arête directe vers le fichier concret. La simulation perd
 * donc cette arête, et sous-estime le graphe résultant.
 * @description
 * Conséquence : « sans barrels : 0 cycle » se lit « aucun cycle ne passe
 * PAR les barrels », et non « le graphe après réécriture sera acyclique ».
 * Constaté sur le premier lot réel du codemod #366 : la réécriture a fait
 * apparaître des cycles `import type` entre fichiers voisins, préexistants
 * mais masqués par cette suppression d'arêtes.
 * @description
 * Répondre exactement demanderait une résolution SYMBOLE par symbole à
 * travers chaque barrel — ce que fait le codemod lui-même. Le vrai chiffre
 * s'obtient donc en relançant cet outil APRÈS chaque lot fusionné, sur la
 * colonne « avec barrels », qui elle ne simule rien.
 *
 * Usage : node packages/ds/scripts/analysis/import-cycles.mjs [--list]
 ********************************************************/

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, normalize, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const SRC = resolve(REPO, 'packages/ds/src')

const STATEMENT = /(?:import|export)\s(?:[\s\S]*?\sfrom\s)?['"]([^'"]+)['"]/g
const TYPE_ONLY = /^\s*(?:import|export)\s+type\b/
const SCRIPT_BLOCK = /<script[^>]*>([\s\S]*?)<\/script>/g
const BARREL = /[/\\]index\.ts$/

function walk (dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)

        if (statSync(full).isDirectory()) walk(full, out)
        else if (full.endsWith('.ts') || full.endsWith('.vue')) out.push(full)
    }

    return out
}

/*********************************************************
 * sourceOf
 *
 * @description
 * Pour un `.vue`, concatène TOUS les blocs `<script>`. N'en lire qu'un
 * perdrait les arêtes du second — `OrigamCard.vue` en a deux.
 ********************************************************/
function sourceOf (file) {
    const raw = readFileSync(file, 'utf8')

    if (!file.endsWith('.vue')) return raw

    return [...raw.matchAll(SCRIPT_BLOCK)].map((m) => m[1]).join('\n')
}

function resolveSpec (from, spec) {
    if (!spec.startsWith('.')) return null

    const base = normalize(join(dirname(from), spec))

    for (const candidate of [`${base}.ts`, `${base}.vue`, join(base, 'index.ts')]) {
        if (existsSync(candidate)) return candidate
    }

    return null
}

const files = walk(SRC).sort()
const all = new Map()
const values = new Map()

for (const file of files) {
    const text = sourceOf(file)
    const everything = new Set()
    const runtime = new Set()

    for (const match of text.matchAll(STATEMENT)) {
        const target = resolveSpec(file, match[1])

        if (!target) continue

        everything.add(target)

        if (!TYPE_ONLY.test(match[0].slice(0, 40))) runtime.add(target)
    }

    all.set(file, everything)
    values.set(file, runtime)
}

/*********************************************************
 * tarjan
 *
 * @description
 * Itératif, pas récursif : 1244 fichiers dépassent la pile par défaut de
 * Node sur les chaînes profondes.
 ********************************************************/
function tarjan (graph) {
    const index = new Map()
    const low = new Map()
    const onStack = new Set()
    const stack = []
    const sccs = []
    let counter = 0

    for (const root of graph.keys()) {
        if (index.has(root)) continue

        const work = [[root, (graph.get(root) ?? new Set()).values()]]

        index.set(root, counter)
        low.set(root, counter++)
        stack.push(root)
        onStack.add(root)

        while (work.length) {
            const [node, iterator] = work[work.length - 1]
            let advanced = false

            for (const next of iterator) {
                if (!index.has(next)) {
                    index.set(next, counter)
                    low.set(next, counter++)
                    stack.push(next)
                    onStack.add(next)
                    work.push([next, (graph.get(next) ?? new Set()).values()])
                    advanced = true
                    break
                }

                if (onStack.has(next)) low.set(node, Math.min(low.get(node), index.get(next)))
            }

            if (advanced) continue

            work.pop()

            if (work.length) {
                const parent = work[work.length - 1][0]

                low.set(parent, Math.min(low.get(parent), low.get(node)))
            }

            if (low.get(node) === index.get(node)) {
                const component = []

                for (;;) {
                    const popped = stack.pop()

                    onStack.delete(popped)
                    component.push(popped)

                    if (popped === node) break
                }

                if (component.length > 1) sccs.push(component)
            }
        }
    }

    return sccs.sort((a, b) => b.length - a.length)
}

function withoutBarrels (graph) {
    return new Map([...graph].map(([k, v]) => [k, new Set([...v].filter((e) => !BARREL.test(e)))]))
}

const wantList = process.argv.includes('--list')
const line = '─'.repeat(70)

for (const [label, graph] of [
    ['TOUTES les arêtes (type + valeur)', all],
    ["VALEURS seulement — ce qui existe à l'exécution", values]
]) {
    const edges = [...graph.values()].reduce((n, s) => n + s.size, 0)
    const withBarrels = tarjan(graph)
    const stripped = tarjan(withoutBarrels(graph))

    console.log(line)
    console.log(label)
    console.log(line)
    console.log(`  fichiers ${files.length}   arêtes ${edges}`)
    console.log(`  avec barrels : ${withBarrels.length} cycle(s), le plus gros = ${withBarrels[0]?.length ?? 0} fichiers`)
    console.log(`  sans barrels : ${stripped.length} cycle(s), le plus gros = ${stripped[0]?.length ?? 0} fichiers`)

    for (const component of stripped) {
        console.log(`     résiduel (${component.length}) : ${component.map((f) => relative(SRC, f)).sort().join(', ')}`)
    }

    if (wantList && withBarrels[0]) {
        console.log('\n  membres du plus gros cycle :')

        for (const f of withBarrels[0].map((f) => relative(SRC, f)).sort()) console.log(`     ${f}`)
    }

    console.log('')
}
