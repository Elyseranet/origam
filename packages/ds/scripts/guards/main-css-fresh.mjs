#!/usr/bin/env node
/*********************************************************
 * Guard — main-css-fresh
 *
 * @description
 * `src/assets/css/main.css` est GENERE depuis `main.scss` (`styles:build`) mais
 * COMMITE. Rien ne verifiait que la copie commitee suivait le SCSS : #1342 a
 * mesure 5 jetons absents (btn__content, table__header-cell, tabs__item), dans
 * 3 blocs chacun, sans qu'aucun garde ne rougisse. Ce garde recompile le SCSS
 * avec les memes options que `styles:build` et exige l'identite octet pour octet.
 *
 * @description
 * Le dist publie n'est pas concerne (regenere au build) ; ce sont les
 * consommateurs de la copie commitee qui lisent un fichier perime.
 *
 * Run: `node packages/ds/scripts/guards/main-css-fresh.mjs`
 ********************************************************/
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DS = path.resolve(HERE, '../..')
const SCSS = path.join(DS, 'src/assets/scss/main.scss')
const CSS = path.join(DS, 'src/assets/css/main.css')
const BAR = '─'.repeat(70)

console.log(BAR)
console.log('Guard: main-css-fresh (main.css commite == sortie de `styles:build`)')
console.log(BAR)

const sass = createRequire(path.join(DS, 'package.json'))('sass')
// Meme options que `styles:build`; la CLI ajoute un `\n` final.
const expected = sass.compile(SCSS, { style: 'compressed', sourceMap: false }).css + '\n'
const committed = readFileSync(CSS, 'utf8')

if (expected === committed) {
    console.log(`PASS — ${path.relative(process.cwd(), CSS)} identique a la sortie de styles:build (${committed.length} octets).`)
    console.log(BAR)
    process.exit(0)
}

let i = 0
while (i < expected.length && expected[i] === committed[i]) i++

console.log(`  main.css commite : ${committed.length} octets ; styles:build : ${expected.length} octets`)
console.log(`  premiere divergence a l'octet ${i}`)
console.log(`    commite : …${JSON.stringify(committed.slice(Math.max(0, i - 40), i + 80))}`)
console.log(`    attendu : …${JSON.stringify(expected.slice(Math.max(0, i - 40), i + 80))}`)
console.log('')
console.log('FAIL — main.css est en retard sur main.scss.')
console.log('       Regenerer puis committer : `pnpm -F origam run styles:build`.')
console.log('       ⛔ Ne PAS editer main.css a la main — il est genere depuis main.scss.')
console.log(BAR)
process.exit(1)
