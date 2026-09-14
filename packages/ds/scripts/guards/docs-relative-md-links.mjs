#!/usr/bin/env node
/*********************************************************
 * Guard — docs-relative-md-links
 *
 * @description
 * Interdit les liens markdown RELATIFS vers un autre `.md` dans
 * `packages/docs/components/**`. Le plugin markdown d'Histoire tente de
 * resoudre ces cibles comme des FICHIERS DE STORY, ne les trouve pas, et
 * fait echouer `histoire build` en entier :
 *
 *     [md] Cannot find story file: ../Toolbar/OrigamToolbar.md
 *          from packages/docs/components/App/OrigamAppBar.md
 *
 * @description
 * ⛔ Ce n'est pas une regle de style. Deux occurrences ont casse le build des
 * 214 stories en deux jours — la premiere venue des docs Dialog (#419), la
 * seconde des docs AppBar (#379). Les deux fois, la panne est arrivee APRES
 * un merge, et les deux fois j'ai mesure contre un build PERIME sans le voir :
 * `histoire preview` continue de servir le dernier build reussi, donc la suite
 * e2e reste verte pendant que la doc est cassee. C'est un faux vert.
 *
 * @description
 * A la place d'un lien, ecrire le nom du composant en clair (« voir la doc
 * `OrigamToolbar` ») : la doc VitePress et Histoire resolvent tous deux la
 * navigation par leur propre index, pas par ces liens.
 *
 * Run: `node packages/ds/scripts/guards/docs-relative-md-links.mjs`
 ********************************************************/
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(HERE, '../../../docs/components')

/** Un lien markdown dont la cible est un chemin relatif finissant en `.md`. */
const RELATIVE_MD_LINK = /\[[^\]]+\]\((?:\.\.?\/)[^)]*\.md(?:#[^)]*)?\)/g

function walk (dir) {
    const out = []

    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)

        if (statSync(full).isDirectory()) out.push(...walk(full))
        else if (entry.endsWith('.md')) out.push(full)
    }

    return out
}

const offenders = []

for (const file of walk(DOCS)) {
    const source = readFileSync(file, 'utf8')

    for (const line of source.split('\n').entries()) {
        const [index, text] = line
        const matches = text.match(RELATIVE_MD_LINK)

        if (matches) offenders.push({ file: path.relative(process.cwd(), file), line: index + 1, matches })
    }
}

const BAR = '─'.repeat(70)

console.log(BAR)
console.log('Guard: docs-relative-md-links (un lien .md relatif casse histoire build)')
console.log(BAR)

if (!offenders.length) {
    console.log('PASS — aucun lien markdown relatif vers un .md.')
    console.log(BAR)
    process.exit(0)
}

for (const o of offenders) {
    console.log(`  ${o.file}:${o.line}`)
    for (const m of o.matches) console.log(`      ${m}`)
}

console.log('')
console.log(`FAIL — ${offenders.length} ligne(s). Remplacer le lien par le nom du composant en clair.`)
console.log(BAR)
process.exit(1)
