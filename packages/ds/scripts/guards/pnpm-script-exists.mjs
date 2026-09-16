#!/usr/bin/env node
/*********************************************************
 * Guard — pnpm-script-exists (#574)
 *
 * @description
 * Tout appel `pnpm -F <paquet> <script>` present dans une surface
 * EXECUTABLE du depot (workflows CI, scripts `package.json`, scripts
 * shell) doit viser un paquet qui existe et un script qui existe dans ce
 * paquet.
 *
 * @description
 * ⛔ POURQUOI CE GARDE EXISTE — pnpm rend `exit 0` sur un script absent
 * DES LORS QU'UN FILTRE EST PRESENT. Mesure sur ce depot, pnpm 9.15.0 :
 *
 *     pnpm -F origam script-inexistant   → « None of the selected packages
 *                                           has a "…" script »   exit 0
 *     pnpm run script-inexistant         → ERR_PNPM_NO_SCRIPT      exit 1
 *     pnpm -F paquet-inexistant build    → (silence)               exit 0
 *
 * La forme SANS filtre echoue correctement. La forme AVEC filtre — celle
 * que le CLAUDE.md de ce depot impose partout, « always go through
 * `pnpm -F <name>` » — avale l'echec.
 *
 * @description
 * ⛔ CE QUE CA COUTE, MESURE. `packages/tests/vrt/vrt-docker.sh` appelle
 * `pnpm -F origam tokens:build` : une etape SUPPRIMEE le 2026-08-31 avec
 * tout le pipeline Style Dictionary. La ligne ne fait rien, ne dit rien, et
 * le script continue — sous `set -euo pipefail`, qui aurait du l'arreter
 * net. Un `set -e` ne peut rien contre une commande qui se declare
 * satisfaite.
 *
 * @description
 * C'est la meme famille que le motif decrit par #574 : une commande qui
 * echoue en rendant `exit 0` fabrique une preuve. Elle ne coute pas un
 * echec, elle coute la confiance placee dans tous les autres verts.
 *
 * @description
 * PERIMETRE — les surfaces qu'une machine execute, et elles seules :
 * `.github/workflows/*.yml`, les `scripts` de chaque `package.json` du
 * workspace, et les `*.sh` versionnes. La documentation (`*.md`) est hors
 * perimetre : une commande citee dans une prose peut legitimement decrire
 * un etat passe ou un exemple, et la signaler produirait du bruit sans
 * rapport avec un faux vert.
 *
 * Run: `node packages/ds/scripts/guards/pnpm-script-exists.mjs`
 ********************************************************/
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseFilteredPnpmCalls, normaliseFilterTarget, isCommentLine } from './lib/pnpm-invocations.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../../../..')

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', '.nuxt', '.output', 'cache', '_'])

/*********************************************************
 * Carte du workspace — nom de paquet → scripts declares
 ********************************************************/
function readWorkspaceScripts () {
    const map = new Map()
    const manifests = [path.join(ROOT, 'package.json')]
    const packagesDir = path.join(ROOT, 'packages')

    if (existsSync(packagesDir)) {
        for (const entry of readdirSync(packagesDir)) {
            const manifest = path.join(packagesDir, entry, 'package.json')

            if (existsSync(manifest)) manifests.push(manifest)
        }
    }

    for (const manifest of manifests) {
        const parsed = JSON.parse(readFileSync(manifest, 'utf8'))

        if (!parsed.name) continue

        map.set(parsed.name, {
            scripts: new Set(Object.keys(parsed.scripts ?? {})),
            manifest: path.relative(ROOT, manifest)
        })
    }

    return map
}

/*********************************************************
 * Surfaces executables a balayer
 ********************************************************/
function collectSurfaces () {
    const files = []
    const workflows = path.join(ROOT, '.github', 'workflows')

    if (existsSync(workflows)) {
        for (const entry of readdirSync(workflows)) {
            if (entry.endsWith('.yml') || entry.endsWith('.yaml')) files.push(path.join(workflows, entry))
        }
    }

    const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
            if (IGNORED_DIRS.has(entry)) continue

            const full = path.join(dir, entry)

            if (statSync(full).isDirectory()) walk(full)
            else if (entry.endsWith('.sh') || entry === 'package.json') files.push(full)
        }
    }

    walk(ROOT)

    return [...new Set(files)]
}

const workspace = readWorkspaceScripts()
const offenders = []

let inspected = 0
let unresolved = 0

for (const file of collectSurfaces()) {
    const lines = readFileSync(file, 'utf8').split('\n')

    for (const [index, line] of lines.entries()) {
        if (isCommentLine(line)) continue

        for (const call of parseFilteredPnpmCalls(line)) {
            if (call.kind !== 'script') continue

            const { target, resolvable } = normaliseFilterTarget(call.target)

            if (!resolvable) {
                unresolved++
                continue
            }

            inspected++

            const pkg = workspace.get(target)
            const where = `${path.relative(ROOT, file)}:${index + 1}`

            if (!pkg) {
                offenders.push(`${where} — filtre \`-F ${target}\` : aucun paquet de ce nom dans le workspace (pnpm sort 0)`)
                continue
            }

            if (!pkg.scripts.has(call.script)) {
                offenders.push(`${where} — \`pnpm -F ${target} ${call.script}\` : script absent de ${pkg.manifest} (pnpm sort 0)`)
            }
        }
    }
}

console.log('──────────────────────────────────────────────────────────────────────')
console.log('Guard: pnpm-script-exists (un `pnpm -F` mort rend exit 0, donc un faux vert)')
console.log('──────────────────────────────────────────────────────────────────────')

if (offenders.length) {
    for (const offender of offenders) console.error(`  ✘ ${offender}`)

    console.error('')
    console.error(`FAIL — ${offenders.length} invocation(s) \`pnpm -F\` morte(s) sur ${inspected} verifiee(s).`)
    console.error('  Un script supprime ou renomme ne fait PAS echouer un appel filtre :')
    console.error('  la commande se tait et rend 0. Corrigez l\'appel, ou retirez-le.')
    console.error('──────────────────────────────────────────────────────────────────────')
    process.exit(1)
}

console.log(`PASS — ${inspected} invocation(s) \`pnpm -F <paquet> <script>\` verifiee(s), toutes vivantes`
    + `${unresolved ? ` (${unresolved} filtre(s) glob/chemin non resolu(s))` : ''}.`)
console.log('──────────────────────────────────────────────────────────────────────')
