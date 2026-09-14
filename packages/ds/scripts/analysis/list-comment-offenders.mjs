#!/usr/bin/env node
/*********************************************************
 * Liste les blocs de commentaire non conformes d'un fichier
 *
 * @description
 * Le garde `comment-format` ne compte que les blocs, il ne dit pas OU ils
 * sont. Sur 53 blocs a convertir a la main (#540), chercher a l'oeil dans
 * des fichiers de 500 lignes est le meilleur moyen d'en manquer un.
 *
 * @description
 * ⛔ La conversion doit rester MANUELLE. Une passe mecanique qui derive le
 * titre de la premiere phrase perd du contenu des que cette phrase contient
 * un point — mesure et annule sur `audio-waveform.interface.ts`.
 *
 * Usage : node packages/ds/scripts/analysis/list-comment-offenders.mjs <fichier>
 ********************************************************/
import { readFileSync } from 'node:fs'
import { scanComments, scriptOf, isToolDirective } from '../guards/lib/comment-scan.mjs'

const file = process.argv[2]
const source = readFileSync(file, 'utf8')
const scoped = scriptOf(file, source)

// Le meme predicat que `comment-format.mjs` — un jsdoc compte aussi.
const offenders = scanComments(scoped).filter((c) => (
    c.kind === 'jsdoc' || c.kind === 'block' || (c.kind === 'line' && !isToolDirective(c.text))
))

for (const c of offenders) {
    console.log(`--- [${c.kind}] ${JSON.stringify(String(c.text ?? '').slice(0, 120))}`)
}
console.log(`total non conformes : ${offenders.length}`)
