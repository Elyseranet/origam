#!/usr/bin/env node
/*********************************************************
 * Convertit les blocs de commentaire au format banniere (#540)
 *
 * @description
 * ⛔ LE PIEGE QUE CE SCRIPT EVITE. Une premiere tentative de conversion
 * mecanique derivait le TITRE de la premiere phrase du bloc, puis la
 * retirait du corps. Des que cette phrase contenait un point, la coupe
 * tombait au mauvais endroit et du contenu disparaissait — mesure sur
 * `audio-waveform.interface.ts`, ou « Values outside that range are
 * clamped » a ete avale. La tentative a ete annulee et la regle posee :
 * conversion manuelle.
 *
 * @description
 * Ce script rend la conversion sure par CONSTRUCTION plutot que par
 * prudence : le titre est pris sur le SYMBOLE qui suit le bloc, jamais dans
 * le bloc ; le corps garde tous ses paragraphes, chacun prefixe d'un
 * `@description`. Rien n'est retire.
 *
 * @description
 * Et la propriete est VERIFIEE, pas supposee : le script compare le sac de
 * mots avant et apres, et refuse d'ecrire si un seul mot a disparu.
 *
 * Usage : node packages/ds/scripts/analysis/to-banner-comments.mjs <fichier> [--write]
 ********************************************************/
import { readFileSync, writeFileSync } from 'node:fs'

const file = process.argv[2]
const write = process.argv.includes('--write')
const source = readFileSync(file, 'utf8')

const BLOCK = /^([ \t]*)\/\*\*?\n((?:\1[ \t]*\*.*\n)+?)\1[ \t]*\*\/\n/gm

/*********************************************************
 * symbolAfter
 *
 * @description
 * Le titre est pris sur le CODE qui suit le bloc, jamais dans le bloc. C'est
 * ce qui rend la conversion lossless : on n'a rien a decouper dans le texte
 * pour fabriquer un titre.
 *
 * @description
 * On accepte d'abord une declaration nommee (`interface`, `const`,
 * `function`…), puis a defaut le premier identifiant de la ligne suivante —
 * un appel (`watch(`), une affectation, une propriete. Si rien ne ressemble a
 * un nom, le bloc est LAISSE TEL QUEL plutot que titre au hasard.
 ********************************************************/
const symbolAfter = (rest) => {
    const declared = rest.match(/^\s*(?:export\s+)?(?:declare\s+)?(?:abstract\s+)?(?:interface|type|enum|const|let|var|function|class)\s+([A-Za-z0-9_$]+)/)
    if (declared) return declared[1]

    const called = rest.match(/^\s*([A-Za-z_$][A-Za-z0-9_$.]*)\s*[({=:]/)
    if (called) return called[1].split('.').pop()

    return null
}

const words = (s) => (s.match(/[A-Za-zÀ-ÿ0-9_$]+/g) || []).join(' ')

/*********************************************************
 * LINE_RUN
 *
 * @description
 * Une suite de lignes `//` consecutives et de meme indentation. Le garde les
 * compte au meme titre qu'un bloc : trois `//` d'affilee sont trois blocs non
 * conformes, pas un.
 *
 * @description
 * ⛔ Une directive d'outil (`eslint-disable`, `@ts-expect-error`,
 * `/// <reference>`) doit rester en `//` — l'outil la lit. Elle est exclue.
 ********************************************************/
const LINE_RUN = /^([ \t]*)\/\/(?!\/)(?! *(?:eslint-|@ts-|prettier-|c8 |v8 ))(.*)\n(?:\1\/\/(?!\/).*\n)*/gm

let converted = 0
let out = source.replace(BLOCK, (match, indent, body, offset) => {
    if (match.includes('*****')) return match

    const title = symbolAfter(source.slice(offset + match.length))
    if (!title) return match

    const lines = body.split('\n').filter(Boolean)
        .map((l) => l.replace(/^[ \t]*\*[ \t]?/, '').trimEnd())

    // On regroupe en paragraphes, separes par les lignes vides d'origine.
    const paragraphs = []
    let current = []
    for (const line of lines) {
        if (!line.trim()) { if (current.length) { paragraphs.push(current); current = [] } }
        else current.push(line)
    }
    if (current.length) paragraphs.push(current)
    if (!paragraphs.length) return match

    const rendered = paragraphs
        .map((p) => [ `${indent} * @description`, ...p.map((l) => `${indent} * ${l}`.trimEnd()) ].join('\n'))
        .join(`\n${indent} *\n`)

    converted++

    return `${indent}/*********************************************************\n`
        + `${indent} * ${title}\n`
        + `${indent} *\n`
        + `${rendered}\n`
        + `${indent} ********************************************************/\n`
}

)

out = out.replace(LINE_RUN, (match, indent, _first, offset) => {
    const title = symbolAfter(out.slice(offset + match.length))
    if (!title) return match

    const lines = match.split('\n').filter(Boolean)
        .map((l) => l.replace(/^[ \t]*\/\/[ \t]?/, '').trimEnd())
    if (!lines.length) return match

    converted++

    return `${indent}/*********************************************************\n`
        + `${indent} * ${title}\n`
        + `${indent} *\n`
        + `${indent} * @description\n`
        + lines.map((l) => `${indent} * ${l}`.trimEnd()).join('\n') + '\n'
        + `${indent} ********************************************************/\n`
})

// ⛔ La garantie : aucun COMPTE de mot ne doit diminuer.
//
// La premiere version comparait des chaines et retirait ' description' du
// resultat pour neutraliser les marqueurs ajoutes — ce qui accusait a tort
// tout fichier dont la prose contenait deja ce mot. Un multiset repond a la
// vraie question : la conversion n'AJOUTE que des marqueurs, elle ne doit
// jamais RETIRER quoi que ce soit.
const tally = (text) => {
    const counts = new Map()
    for (const w of text.match(/[A-Za-zÀ-ÿ0-9_$]+/g) || []) counts.set(w, (counts.get(w) ?? 0) + 1)

    return counts
}

const beforeCounts = tally(source)
const afterCounts = tally(out)
const lost = []

for (const [ word, n ] of beforeCounts) {
    if ((afterCounts.get(word) ?? 0) < n) lost.push(`${word} (${n} → ${afterCounts.get(word) ?? 0})`)
}

if (lost.length) {
    console.error(`REFUS — ${lost.length} mot(s) perdu(s) : ${lost.slice(0, 8).join(', ')}`)
    process.exit(1)
}

console.log(`${file} : ${converted} bloc(s) converti(s), 0 mot perdu`)
if (write && converted) writeFileSync(file, out)
