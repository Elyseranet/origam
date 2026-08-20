/*********************************************************
 * Self-test de `pnpm-tree-integrity.mjs`.
 *
 * @description
 * Un garde qui repond « lien symbolique : oui / non » a l'air trop simple
 * pour se tromper. Il a pourtant deux facons de devenir inutile, et elles
 * tirent en sens contraire — d'ou les deux listes.
 *
 * @description
 * MUST_FLAG epingle le RAPPEL. Le defaut a l'origine du garde (#382) est un
 * vrai dossier `playwright` a la racine : c'est le premier cas. Les suivants
 * sont les variantes qu'une implementation « je verifie juste que c'est un
 * lien » laisserait passer — un lien vers une copie hors magasin (npm link,
 * `file:`), un lien vers un node_modules etranger. Toutes produisent
 * exactement le meme symptome : deux realpaths pour un seul nom de paquet.
 *
 * @description
 * MUST_NOT_FLAG epingle la PRECISION, et c'est la que se joue la survie du
 * garde. Un faux positif sur le lien de workspace (`origam` -> `packages/ds`)
 * le rendrait rouge en permanence sur un depot sain, donc desactive dans la
 * semaine. Le cas `packages/marketing/node_modules/origam` est le piege
 * exact : sa cible est dans le depot, hors magasin pnpm, et parfaitement
 * legitime.
 *
 * Run: node packages/ds/scripts/guards/pnpm-tree-integrity.selftest.mjs
 ********************************************************/

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { classifyEntry } from './pnpm-tree-integrity.mjs'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
const p = (...parts) => path.join(REPO, ...parts)

const flags = (entry) => classifyEntry({ ...entry, repoRoot: REPO }) !== null

const MUST_FLAG = [
    [
        'le defaut #382 : vrai dossier playwright a la racine',
        { isSymlink: false, realPath: p('node_modules/playwright') }
    ],
    [
        'vrai dossier scope (@algolia/client-common), meme residu npm',
        { isSymlink: false, realPath: p('node_modules/@algolia/client-common') }
    ],
    [
        'lien vers une copie hors depot (npm link / file:)',
        { isSymlink: true, realPath: '/Users/qqn/dev/playwright' }
    ],
    [
        'lien vers le node_modules d\'un AUTRE depot',
        { isSymlink: true, realPath: '/Users/qqn/autre-projet/node_modules/vue' }
    ],
    [
        'lien vers un dossier du depot mais SOUS un node_modules etranger',
        { isSymlink: true, realPath: p('packages/marketing/node_modules/.cache/vue') }
    ]
]

const MUST_NOT_FLAG = [
    [
        'lien normal vers le magasin pnpm',
        { isSymlink: true, realPath: p('node_modules/.pnpm/playwright@1.59.1/node_modules/playwright') }
    ],
    [
        'lien vers le magasin depuis un package',
        { isSymlink: true, realPath: p('node_modules/.pnpm/@playwright+test@1.59.1/node_modules/@playwright/test') }
    ],
    [
        'PIEGE : lien de workspace origam -> packages/ds',
        { isSymlink: true, realPath: p('packages/ds') }
    ],
    [
        'PIEGE : lien de workspace vers un package de test',
        { isSymlink: true, realPath: p('packages/tests') }
    ]
]

let failures = 0

for (const [label, entry] of MUST_FLAG) {
    if (flags(entry)) continue

    console.error(`✘ RAPPEL manque — non signale alors qu'il devait l'etre : ${label}`)
    failures++
}

for (const [label, entry] of MUST_NOT_FLAG) {
    if (!flags(entry)) continue

    console.error(`✘ PRECISION perdue — faux positif : ${label}`)
    failures++
}

const total = MUST_FLAG.length + MUST_NOT_FLAG.length

if (failures) {
    console.error(`\npnpm-tree-integrity self-test : ${failures}/${total} cas en echec.`)
    process.exit(1)
}

console.log(`✔ pnpm-tree-integrity self-test : ${total}/${total} cas (${MUST_FLAG.length} rappel, ${MUST_NOT_FLAG.length} precision).`)
