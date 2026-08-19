#!/usr/bin/env node
/*********************************************************
 * Guard 11 — format de commentaire (#367)
 *
 * @description
 * Le dépôt a UN format de commentaire : un bloc encadré, un titre, puis
 * `@description` avec une ligne par idée. Le principe est de REGROUPER ce
 * qui décrit une section, au lieu de semer des `//` et des `/** *​/` au fil
 * du code et dans les interfaces.
 *
 * @description
 * CE N'EST PAS UNE PRÉFÉRENCE D'ÉCRITURE. Un format unique rend les
 * commentaires grepables — même raisonnement que les clés i18n en
 * `snake_case` : réserver une forme à un usage permet à une recherche
 * d'isoler cet usage sans bruit. Des `/** *​/` dispersés ne se distinguent
 * ni d'un en-tête de licence, ni d'un TODO, ni d'une note de type.
 *
 * @description
 * CE QUE CE GARDE FAIT, ET SURTOUT CE QU'IL NE FAIT PAS. Il empêche le
 * compteur de REMONTER. Il ne convertit rien et n'exige aucune conversion :
 * la baseline part de l'état mesuré et ne peut que descendre. C'est
 * délibéré — l'issue #367 insiste sur le fait qu'une conversion mécanique
 * (un `//` devenu un bloc d'une ligne) serait PIRE que l'existant, plus
 * verbeuse et toujours dispersée. Le regroupement demande du jugement, donc
 * des lots humains ; le garde ne fait que tenir la porte pendant ce temps.
 *
 * @description
 * POURQUOI IL EXISTE MAINTENANT plutôt qu'à la fin. Le format est ancien et
 * n'a jamais tenu : 19 % de conformité dans son propre dépôt. Le jour où
 * #367 a été ouverte, 6 blocs non conformes ont été ajoutés — dont 2 par
 * l'agent qui rédigeait l'issue. Convertir sans garde, c'est vider une
 * baignoire dont le robinet coule.
 *
 * @description
 * FORMAT DE BASELINE — un objet `{ chemin: nombre }`, et non le tableau de
 * chaînes des dix autres gardes. Un identifiant ancré sur un numéro de
 * ligne bougerait à chaque édition et produirait un diff illisible à
 * chaque commit. Compter par fichier est stable sous édition, détecte la
 * régression là où elle se produit, et décroît naturellement à mesure que
 * les lots de conversion avancent.
 *
 * @description
 * PÉRIMÈTRE. `packages/ds/src` uniquement, blocs `<script>` des `.vue`
 * inclus. Les commentaires HTML et CSS relèvent d'une autre règle du dépôt.
 * `packages/tests` et `scripts/` sont HORS périmètre tant que le mainteneur
 * ne l'a pas tranché — l'issue #367 pose explicitement la question et y
 * répondre à sa place serait une invention.
 *
 * Usage : node packages/ds/scripts/guards/comment-format.mjs [--update-baseline]
 ********************************************************/

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { isToolDirective, scanComments, scriptOf } from './lib/comment-scan.mjs'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const SRC = resolve(REPO, 'packages/ds/src')
const BASELINE = resolve(REPO, 'packages/ds/scripts/guards/baseline/comment-format.json')

function walk (dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)

        if (statSync(full).isDirectory()) walk(full, out)
        else if (full.endsWith('.ts') || full.endsWith('.vue')) out.push(full)
    }

    return out
}

const current = {}

for (const file of walk(SRC)) {
    const comments = scanComments(scriptOf(file, readFileSync(file, 'utf8')))
    const offenders = comments.filter((c) => (c.kind === 'jsdoc' || c.kind === 'block')
        || (c.kind === 'line' && !isToolDirective(c.text)))

    if (offenders.length) current[relative(REPO, file)] = offenders.length
}

if (process.argv.includes('--update-baseline')) {
    writeFileSync(BASELINE, `${JSON.stringify(current, null, 4)}\n`)
    console.log(`baseline écrite : ${Object.keys(current).length} fichiers, ${Object.values(current).reduce((a, b) => a + b, 0)} blocs.`)
    process.exit(0)
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {}
const regressions = []
const improvements = []

for (const [file, count] of Object.entries(current)) {
    const allowed = baseline[file] ?? 0

    if (count > allowed) regressions.push({ file, count, allowed })
    else if (count < allowed) improvements.push({ file, count, allowed })
}

for (const file of Object.keys(baseline)) {
    if (!(file in current)) improvements.push({ file, count: 0, allowed: baseline[file] })
}

const line = '─'.repeat(70)
const total = Object.values(current).reduce((a, b) => a + b, 0)

console.log(line)
console.log('Guard: comment-format (le format bloc du dépôt — le compteur ne remonte pas)')
console.log(line)

if (regressions.length === 0) {
    console.log(`PASS — ${total} bloc(s) non conforme(s) connu(s), 0 nouveau.`)

    if (improvements.length) {
        const gained = improvements.reduce((n, i) => n + (i.allowed - i.count), 0)

        console.log(`\n${improvements.length} fichier(s) se sont AMÉLIORÉS (${gained} blocs convertis).`)
        console.log('Baisser la baseline pour verrouiller le gain :')
        console.log('  node packages/ds/scripts/guards/comment-format.mjs --update-baseline')
    }

    console.log(line)
    process.exit(0)
}

console.log(`\nFAIL — ${regressions.length} fichier(s) ont PLUS de blocs non conformes qu'autorisé :\n`)

for (const { file, count, allowed } of regressions.sort((a, b) => (b.count - b.allowed) - (a.count - a.allowed))) {
    console.log(`  ✗ ${file}`)
    console.log(`      ${allowed} autorisé(s) → ${count} trouvé(s)  (+${count - allowed})`)
}

console.log('\nLe format attendu regroupe les commentaires d\'une section en UN bloc :')
console.log('  /*********************************************************')
console.log('   * TITRE')
console.log('   *')
console.log('   * @description')
console.log('   * Une idée par ligne @description.')
console.log('   ********************************************************/')
console.log('\nUne directive d\'outil (eslint-disable, @ts-expect-error, /// <reference>)')
console.log('reste en // et n\'est pas comptée — elle doit rester lisible par l\'outil.')
console.log(line)

process.exit(1)
