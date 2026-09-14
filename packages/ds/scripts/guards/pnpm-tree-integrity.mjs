#!/usr/bin/env node
/*********************************************************
 * Garde — integrite de l'arbre node_modules (pnpm)
 *
 * @description
 * Verifie qu'aucun `node_modules/` du depot ne contient de paquet installe
 * AUTREMENT que par pnpm. En disposition isolee — celle de ce depot — chaque
 * entree de `node_modules/` est un lien symbolique vers le magasin
 * `node_modules/.pnpm/`, ou vers un package du workspace. Un VRAI dossier a
 * cet endroit est le residu d'un `npm install` / `yarn install` : pnpm ne le
 * supprime pas, il pose ses liens A COTE.
 *
 * @description
 * ⛔ POURQUOI CE GARDE EXISTE — issue #382, la panne la plus trompeuse
 * rencontree jusqu'ici. Un `npm install` lance a la racine le 17 mai y avait
 * laisse 676 vrais dossiers, dont `node_modules/playwright`. Le shim
 * `node_modules/.bin/playwright` pointait dessus. Resultat : DEUX copies
 * physiques de playwright 1.59.1 — meme numero de version, deux instances de
 * module distinctes, donc deux registres `test.describe` distincts.
 *
 * @description
 * La panne se presentait ainsi :
 *
 *     Error: Playwright Test did not expect test.describe() to be called here.
 *     - You have two different versions of @playwright/test.
 *
 * Le message accuse un conflit de VERSIONS. Il n'y en avait aucun : `pnpm ls`
 * et le lockfile s'accordaient sur 1.59.1 partout. Ce que Node distingue
 * n'est pas le numero de version mais le REALPATH — deux copies identiques au
 * bit pres restent deux modules.
 *
 * @description
 * Le piege supplementaire, celui qui a fait perdre le plus de temps : la
 * panne dependait du BINAIRE choisi, pas du repertoire courant. Le test
 * croise le prouve —
 *
 *     bin de packages/tests + cwd racine        -> 102 tests listes
 *     bin racine           + cwd packages/tests -> erreur ci-dessus
 *
 * Comme la CI et les scripts du projet passent tous par
 * `pnpm -F @origam/tests exec playwright`, ils resolvaient le bon binaire et
 * n'ont JAMAIS ete touches. Seule une invocation depuis la racine
 * (`npx playwright`, un agent qui oublie le `-F`) tombait dedans. Un defaut
 * qui n'existe que hors des chemins outilles est indetectable par la CI :
 * d'ou ce garde, qui regarde l'arbre lui-meme et non une commande.
 *
 * @description
 * LIMITE ASSUMEE. Ce garde suppose la disposition ISOLEE de pnpm. Si le
 * depot passait un jour a `node-linker=hoisted` (vrais dossiers a la racine
 * par conception), il faudrait le retirer plutot que l'assouplir : un garde
 * tolerant sur ce point ne distingue plus rien.
 *
 * Usage : node packages/ds/scripts/guards/pnpm-tree-integrity.mjs
 ********************************************************/

import { lstatSync, readdirSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { report } from './lib/baseline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/pnpm-tree-integrity.json')

const PNPM_STORE = `${path.sep}node_modules${path.sep}.pnpm${path.sep}`
const NODE_MODULES = `${path.sep}node_modules${path.sep}`

/*********************************************************
 * classifyEntry
 *
 * @description
 * Coeur du garde, isole de toute IO pour que le self-test puisse le pincer
 * sans fabriquer d'arborescence sur le disque.
 *
 * @description
 * Trois formes seulement sont legitimes dans un `node_modules/` pnpm isole :
 *   1. un lien vers le magasin `.pnpm/` — le cas courant ;
 *   2. un lien vers un package du workspace (`packages/ds` <- `origam`) ;
 *   3. rien d'autre.
 * Le cas 2 se reconnait a ceci que la cible est SOUS `packages/` du depot et
 * hors de tout `node_modules/` — un lien vers un dossier du depot situe DANS
 * un node_modules serait, lui, une anomalie.
 *
 * @returns {string|null} motif du rejet, ou null si l'entree est saine
 ********************************************************/
export function classifyEntry ({ isSymlink, realPath, repoRoot = REPO_ROOT }) {
    if (!isSymlink) return 'copie physique (residu npm/yarn) au lieu d\'un lien pnpm'

    const target = `${realPath}${path.sep}`

    if (target.includes(PNPM_STORE)) return null

    const insidePackages = target.startsWith(path.join(repoRoot, 'packages') + path.sep)

    if (insidePackages && !target.includes(NODE_MODULES)) return null

    return `lien hors magasin pnpm -> ${realPath}`
}

/*********************************************************
 * listPackageEntries
 *
 * @description
 * Enumere les entrees de paquet d'un `node_modules/`, en descendant d'un
 * cran dans les dossiers de scope (`@origam/`, `@playwright/`) puisque c'est
 * la que vit le vrai paquet. Les entrees pointees (`.pnpm`, `.bin`,
 * `.modules.yaml`, `.cache`, `.vite`) sont ignorees : ce sont des organes de
 * l'outillage, pas des paquets.
 ********************************************************/
function listPackageEntries (nodeModulesDir) {
    const out = []

    let names
    try {
        names = readdirSync(nodeModulesDir)
    } catch {
        return out
    }

    for (const name of names) {
        if (name.startsWith('.')) continue

        const full = path.join(nodeModulesDir, name)

        if (name.startsWith('@') && !lstatSync(full).isSymbolicLink()) {
            for (const scoped of readdirSync(full)) {
                out.push({ id: `${name}/${scoped}`, full: path.join(full, scoped) })
            }
            continue
        }

        out.push({ id: name, full })
    }

    return out
}

function scanTree (nodeModulesDir, label, violations, detailsById) {
    for (const { id, full } of listPackageEntries(nodeModulesDir)) {
        const isSymlink = lstatSync(full).isSymbolicLink()

        let realPath = full
        try {
            realPath = realpathSync(full)
        } catch { /* lien casse : classifyEntry le rejettera de toute facon */ }

        const reason = classifyEntry({ isSymlink, realPath })

        if (!reason) continue

        const key = `${label}:${id}`

        violations.add(key)
        detailsById.set(key, `${label}/node_modules/${id} — ${reason}`)
    }
}

function run () {
    const violations = new Set()
    const detailsById = new Map()

    scanTree(path.join(REPO_ROOT, 'node_modules'), '.', violations, detailsById)

    for (const pkg of readdirSync(path.join(REPO_ROOT, 'packages'))) {
        const dir = path.join(REPO_ROOT, 'packages', pkg, 'node_modules')

        scanTree(dir, `packages/${pkg}`, violations, detailsById)
    }

    const exitCode = report({
        guardName: 'pnpm-tree-integrity (aucun paquet installe hors de pnpm)',
        baselinePath: BASELINE_PATH,
        currentIds: violations,
        detailsById,
        fixHint: 'Un vrai dossier dans node_modules/ vient d\'un `npm install` ou `yarn install` lance dans le depot. Il SHADOWE le lien pnpm sans conflit de version visible : deux copies de la meme version restent deux modules pour Node, ce qui casse tout paquet a singleton (playwright, vitest, vue, react). Correctif : `rm -rf <ce node_modules> && pnpm install --frozen-lockfile`. Ne jamais ajouter d\'entree a la baseline de ce garde.'
    })

    process.exit(exitCode)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    run()
}
