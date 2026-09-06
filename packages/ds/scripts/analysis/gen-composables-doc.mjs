#!/usr/bin/env node
/*********************************************************
 * Genere la reference des composables (#545)
 *
 * @description
 * 178 symboles exportes, UNE page de doc. Le critere C7 du classeur echoue a
 * 94 % — un critere qui echoue a 94 % ne discrimine plus rien.
 *
 * @description
 * ⛔ Le ticket met en garde contre le remede evident : ecrire 166 entrees a
 * la chaine sans relire le code produirait exactement la doc mensongere qu'on
 * cherche a corriger. Precedents mesures dans ce depot : un guide qui listait
 * 2 directives sur 6 en affirmant etre genere, trois composables nommes qui
 * n'existaient pas (#493), et `useCountdown` decrit comme la primitive de
 * `OrigamSnackbar` — lequel implemente son propre timer.
 *
 * @description
 * Ce generateur ne redige RIEN. Il extrait : la signature reelle lue dans le
 * source, la description que la banniere du symbole porte deja (83 % en ont
 * une), et les consommateurs reels trouves par recherche. Tout ce qu'il
 * publie est verifiable dans le code, et le garde `composables-doc-sync`
 * echoue si la page s'ecarte de la source.
 *
 * Usage : node packages/ds/scripts/analysis/gen-composables-doc.mjs [--write]
 ********************************************************/
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '../../../..')
const SRC = path.join(REPO, 'packages/ds/src')
const COMPOSABLES = path.join(SRC, 'composables')
const OUT = path.join(REPO, 'packages/docs/composables')

const walk = (dir, filter, acc = []) => {
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        if (statSync(full).isDirectory()) walk(full, filter, acc)
        else if (filter(full)) acc.push(full)
    }

    return acc
}

/** Les lignes `@description` de la banniere qui precede immediatement le symbole. */
const descriptionAbove = (source, index) => {
    const before = source.slice(0, index)
    const open = before.lastIndexOf('/*****')
    const close = before.lastIndexOf('***/')
    if (open === -1 || close < open) return null
    // Rien d'autre que du blanc entre la banniere et le symbole.
    if (before.slice(close + 4).trim().length) return null

    const body = before.slice(open, close)

    const clean = (chunk) => chunk
        .split('\n')
        .map((l) => l.replace(/^\s*\*+\s?/, '').trimEnd())
        .filter((l) => l && !/^\*+$/.test(l))
        .join(' ')
        .trim()

    // Forme canonique du depot : des paragraphes `@description`.
    if (body.includes('@description')) {
        return body.split('@description').slice(1).map(clean).filter(Boolean)
    }

    // ⛔ Toutes les bannieres ne suivent pas cette forme — beaucoup ecrivent
    // en prose sous un titre. On prend alors le corps SANS sa premiere ligne
    // (le titre, qui repete le nom du symbole), plutot que de laisser le
    // symbole sans description alors que le code en porte une.
    const lines = body.split('\n').slice(1)
    const firstMeaningful = lines.findIndex((l) => clean(l))
    if (firstMeaningful === -1) return null

    const withoutTitle = lines.slice(firstMeaningful + 1)
    const prose = clean(withoutTitle.join('\n'))

    return prose ? [ prose ] : null
}

/** La signature, telle qu'elle est ecrite — jamais reconstruite. */
const signatureAt = (source, index) => {
    const rest = source.slice(index)
    const arrow = rest.indexOf('=>')
    const brace = rest.indexOf('{')
    const end = arrow > -1 && (brace === -1 || arrow < brace) ? arrow : brace
    return rest.slice(0, end === -1 ? 200 : end).replace(/\s+/g, ' ').trim()
}

const files = walk(COMPOSABLES, (f) => f.endsWith('.composable.ts'))
const consumersRoot = walk(SRC, (f) => /\.(vue|ts)$/.test(f) && !f.includes('/composables/'))
const consumerBlobs = consumersRoot.map((f) => [ path.relative(SRC, f), readFileSync(f, 'utf8') ])

const byDomain = new Map()

for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const domain = path.relative(COMPOSABLES, file).split(path.sep)[0]

    for (const m of source.matchAll(/^export (?:function|const) ([A-Za-z0-9_]+)/gm)) {
        const name = m[1]
        const consumers = consumerBlobs
            .filter(([ , blob ]) => new RegExp(`\\b${ name }\\b`).test(blob))
            .map(([ rel ]) => rel)

        if (!byDomain.has(domain)) byDomain.set(domain, [])
        byDomain.get(domain).push({
            name,
            file: path.relative(REPO, file),
            signature: signatureAt(source, m.index),
            descriptions: descriptionAbove(source, m.index),
            consumers
        })
    }
}

const write = process.argv.includes('--write')
let undocumented = 0
let total = 0

if (write && !existsSync(OUT)) mkdirSync(OUT, { recursive: true })

for (const [ domain, symbols ] of [ ...byDomain ].sort() ) {
    symbols.sort((a, b) => a.name.localeCompare(b.name))

    let md = `# Composables — ${ domain }\n\n`
    md += `> ⛔ Page **generee** depuis les sources par `
    md += `\`packages/ds/scripts/analysis/gen-composables-doc.mjs\`, et **verifiee** par le garde\n`
    md += `> \`composables-doc-sync\`. Signature, description et consommateurs sont lus dans le code :\n`
    md += `> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,\n`
    md += `> puis en regenerant. Issue #545.\n\n`
    md += `${ symbols.length } symbole(s) exporte(s).\n\n`

    for (const s of symbols) {
        total++
        md += `## \`${ s.name }\`\n\n`
        md += `\`\`\`ts\n${ s.signature }\n\`\`\`\n\n`

        if (s.descriptions?.length) {
            md += s.descriptions.map((d) => `${ d }\n`).join('\n') + '\n'
        } else {
            undocumented++
            md += `> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere\n`
            md += `> \`@description\` au-dessus de sa declaration. Le generateur ne l'invente pas :\n`
            md += `> ecrire la banniere dans \`${ s.file }\`, puis regenerer.\n\n`
        }

        md += `**Source** : \`${ s.file }\`\n\n`

        if (s.consumers.length) {
            const shown = s.consumers.slice(0, 8)
            md += `**Consommateurs** (${ s.consumers.length }) : `
            md += shown.map((c) => `\`${ c }\``).join(', ')
            md += s.consumers.length > shown.length ? `, …\n\n` : `\n\n`
        } else {
            md += `**Consommateurs** : aucun dans \`packages/ds/src\` — symbole exporte pour les consommateurs externes.\n\n`
        }
    }

    if (write) writeFileSync(path.join(OUT, `${ domain }.md`), md)
}

console.log(`${ total } symboles sur ${ byDomain.size } domaines`)
console.log(`sans description dans le code : ${ undocumented }`)
if (write) console.log(`ecrit dans ${ path.relative(REPO, OUT) }/`)
