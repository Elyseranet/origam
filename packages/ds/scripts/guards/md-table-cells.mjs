#!/usr/bin/env node
/*********************************************************
 * Guard — md-table-cells
 *
 * @description
 * Toute ligne d'un tableau markdown de `packages/docs/**` doit avoir le
 * MEME nombre de cellules que sa ligne d'en-tete. Markdown ne signale rien
 * quand ce n'est pas le cas : il remplit de gauche a droite, puis jette ou
 * decale le surplus.
 *
 * @description
 * ⛔ #621 — 15 lignes du depot ecrivaient 3 cellules sous un en-tete a 4
 * colonnes, et c'etaient precisement celles qui AVERTISSENT qu'une prop est
 * inerte :
 *
 *     | `colorScheme` | `Array<TIntent \| string>` | ⛔ **Sans effet…** |
 *                                                   ^ rendu dans « Default »
 *
 * L'avertissement atterrissait dans la colonne « Default » et la colonne
 * « Description » restait vide. Deux autres formes de la meme classe : un
 * `|` non echappe a l'interieur d'une accolade (`{a|b|c}`) ou dans du code
 * (`` `||` ``), qui AJOUTE des cellules ; et une ligne de tableau coupee
 * sur plusieurs lignes physiques, qui termine le tableau au milieu.
 *
 * @description
 * ⛔ Piege de mesure (#621, premiere sonde, fausse d'un facteur 40) : un
 * decoupage naif sur `|` compte aussi les barres ECHAPPEES des unions de
 * types (`` `boolean \| number` ``), que markdown ne traite pas comme des
 * separateurs. Le decoupage correct les ignore — c'est ce que fait
 * `splitCells` ci-dessous, et c'est la seule subtilite de ce garde.
 *
 * Perimetre : `packages/docs/**` — le livrable publie. Les blocs de code
 * (```) sont ignores.
 *
 * Run: `node packages/ds/scripts/guards/md-table-cells.mjs`
 ********************************************************/
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(HERE, '../../../docs')

const IGNORED_DIRS = new Set(['node_modules', 'cache', 'dist', '.vitepress'])

/** Cellules d'une ligne de tableau — les `\|` echappes n'en sont pas. */
function splitCells (line) {
    return line.split(/(?<!\\)\|/).slice(1, -1)
}

const SEPARATOR_CELL = /^\s*:?-+:?\s*$/

function walk (dir) {
    const out = []

    for (const entry of readdirSync(dir)) {
        if (IGNORED_DIRS.has(entry)) continue

        const full = path.join(dir, entry)

        if (statSync(full).isDirectory()) out.push(...walk(full))
        else if (entry.endsWith('.md')) out.push(full)
    }

    return out
}

const offenders = []

for (const file of walk(DOCS)) {
    const lines = readFileSync(file, 'utf8').split('\n')

    let inFence = false
    let headerCells = null

    for (const [index, text] of lines.entries()) {
        const trimmed = text.trim()

        if (trimmed.startsWith('```')) {
            inFence = !inFence
            headerCells = null
            continue
        }

        if (inFence || !trimmed.startsWith('|')) {
            headerCells = null
            continue
        }

        const cells = splitCells(trimmed)

        // Premiere ligne du bloc : c'est l'en-tete, elle fait loi.
        if (headerCells === null) {
            headerCells = cells.length
            continue
        }

        // Ligne de separation `|---|---|` — sa forme est libre.
        if (cells.length && cells.every(cell => SEPARATOR_CELL.test(cell))) continue

        if (cells.length !== headerCells) {
            offenders.push({
                file: path.relative(process.cwd(), file),
                line: index + 1,
                expected: headerCells,
                found: cells.length,
                text: trimmed.slice(0, 110)
            })
        }
    }
}

const BAR = '─'.repeat(70)

console.log(BAR)
console.log('Guard: md-table-cells (une ligne de tableau a le compte de cellules de son en-tete)')
console.log(BAR)

if (!offenders.length) {
    console.log('PASS — aucune ligne de tableau malformee dans packages/docs/.')
    console.log(BAR)
    process.exit(0)
}

for (const o of offenders) {
    console.log(`  ${o.file}:${o.line} — en-tete ${o.expected} cellules, ligne ${o.found}`)
    console.log(`      ${o.text}`)
}

console.log('')
console.log(`FAIL — ${offenders.length} ligne(s). Ajouter la cellule manquante, echapper les \`|\` internes en \`\\|\`, ou remettre la ligne coupee sur une seule ligne.`)
console.log(BAR)
process.exit(1)
