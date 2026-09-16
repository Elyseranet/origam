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

/**
 * Pose une fence ```ts autour du corps de chaque `@example`.
 *
 * ⛔ VitePress compile le markdown comme un SFC Vue. Un exemple emis EN CLAIR
 * au milieu de la prose n'est pas du texte : c'est du template. Mesure (#605,
 * defaut 2) — `useCssSupportClient` documente son usage avec
 * `<div v-else>…</div>`, que le compilateur a pris pour une VRAIE directive et
 * a rejete avec « v-else has no adjacent v-if » ; ailleurs, `ref<TOrigamChild>()`
 * a ete lu comme une balise HTML. Dans les deux cas le build entier tombait.
 *
 * ⛔ Ce defaut avait ete corrige A LA MAIN dans `Commons.md` (e7f89f0a) sans
 * toucher au generateur : toute regeneration le reintroduisait. Mesure faite
 * avant ce correctif — regenerer sur `develop` retirait la fence posee a la
 * main. C'est la raison pour laquelle le correctif vit ICI.
 */
const fenceExamples = (text) => {
    const out = []
    let buf = null

    const flush = () => {
        if (!buf) return
        while (buf.length && !buf[0].trim()) buf.shift()
        while (buf.length && !buf[buf.length - 1].trim()) buf.pop()
        if (buf.length) {
            // La banniere indente le corps de l'exemple ; le laisser tel quel
            // en ferait un bloc indente IMBRIQUE dans la fence.
            const pad = Math.min(...buf.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length))
            out.push('```ts', ...buf.map((l) => l.slice(pad)), '```')
        }
        buf = null
    }

    for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (/^@example\b/.test(trimmed)) {
            flush()
            out.push('', '**Exemple**', '')
            buf = []
            continue
        }
        // Une autre balise `@xxx` clot l'exemple en cours.
        if (buf && /^@[a-z]/i.test(trimmed)) {
            flush()
            out.push(line)
            continue
        }
        if (buf) buf.push(line)
        else out.push(line)
    }
    flush()

    return out.join('\n')
}

/**
 * Neutralise les moustaches Vue hors des blocs de code fences.
 *
 * ⛔ `{{ … }}` est une INTERPOLATION pour le compilateur VitePress, y compris
 * dans du code INLINE entre simples backticks — seules les fences sont
 * protegees par `v-pre`. Mesure (#605, defaut 1) : la description de
 * `useLoader` contient `loading={{ type: 'line', modelValue: 42 }}`, sur
 * lequel le parseur tombait avec « Error parsing JavaScript expression: Did
 * not expect a type annotation here », en pointant une position dans le SFC
 * GENERE (742:18) et non dans la source — d'ou une bisection sur 2360 lignes.
 *
 * ⛔ Corrige a la main dans `Commons.md` (e7f89f0a), pas dans le generateur :
 * regenerer reintroduisait les moustaches brutes. Mesure faite avant ce
 * correctif.
 */
const escapeMustaches = (md) => md
    .split(/(```[\s\S]*?```)/g)
    .map((chunk, i) => (i % 2 === 1
        ? chunk
        : chunk.replace(/\{\{/g, '&#123;&#123;').replace(/\}\}/g, '&#125;&#125;')))
    .join('')

/** Les lignes `@description` de la banniere qui precede immediatement le symbole. */
const descriptionAbove = (source, index) => {
    const before = source.slice(0, index)

    // ⛔ Deux styles de commentaire coexistent dans ce dossier : la banniere
    // `/***** … *****/` du depot, et le JSDoc `/** … */` classique. Ma
    // premiere version ne cherchait que la premiere et rapportait « aucune
    // description » sur des symboles PARFAITEMENT documentes — Masonry,
    // QrCode et NumberFormat ecrivent tous en JSDoc. Un generateur qui ne
    // voit qu'un style fabrique un faux manque, ce qui est exactement le
    // genre d'erreur que ce ticket cherche a eviter.
    const open = Math.max(before.lastIndexOf('/*****'), before.lastIndexOf('/**\n'), before.lastIndexOf('/** '))
    const close = Math.max(before.lastIndexOf('***/'), before.lastIndexOf('*/'))
    if (open === -1 || close < open) return null
    // Rien d'autre que du blanc entre la banniere et le symbole.
    if (before.slice(close + 4).trim().length) return null

    const body = before.slice(open, close)

    // ⛔ On PRESERVE les retours a la ligne. Ma premiere version joignait
    // tout avec des espaces : les listes numerotees et les blocs `@example`
    // se retrouvaient ecrases en un seul paragraphe illisible (mesure sur
    // `bucketFill`, dont l'algorithme en 4 etapes devenait une phrase de six
    // lignes). Markdown recolle les retours simples de toute facon ; ceux qui
    // portent une structure survivent.
    const stripStars = (chunk) => chunk
        .split('\n')
        .map((l) => l.replace(/^\s*\*+\s?/, '').trimEnd())
        .filter((l, i, arr) => !/^\*+$/.test(l) && !(l === '' && arr[i - 1] === ''))
        .join('\n')

    // Ordre impose : on fence AVANT d'echapper, sinon `escapeMustaches` ne sait
    // pas encore quelles portions sont du code protege par `v-pre`.
    const clean = (chunk) => escapeMustaches(fenceExamples(stripStars(chunk)))
        .replace(/\n{3,}/g, '\n\n')
        .trim()

    // Forme canonique du depot : des paragraphes `@description`.
    if (body.includes('@description')) {
        return body.split('@description').slice(1).map(clean).filter(Boolean)
    }

    // ⛔ Toutes les bannieres ne suivent pas cette forme — beaucoup ecrivent
    // en prose. Deux cas a distinguer :
    //
    //   - banniere du depot `/***** … *****/` : sa premiere ligne est un
    //     TITRE qui repete le nom du symbole, on la saute ;
    //   - JSDoc `/** … */` : la premiere ligne est deja de la prose, la
    //     sauter mangerait le debut de la description.
    const isRepoBanner = body.startsWith('/*****')
    const lines = body.split('\n').slice(1)
    const firstMeaningful = lines.findIndex((l) => clean(l))
    if (firstMeaningful === -1) return null

    const kept = isRepoBanner ? lines.slice(firstMeaningful + 1) : lines.slice(firstMeaningful)
    const prose = clean(kept.join('\n'))

    return prose ? [ prose ] : null
}

/**
 * Une accolade rencontree a la profondeur 0 est-elle un TYPE, ou le CORPS ?
 *
 * ⛔ C'est la seule ambiguite reelle de la lecture d'une signature. Les deux
 * formes existent dans ce depot :
 *
 *   export function useLoader (…): { loaderClasses: … } { …corps… }
 *                                  ^ type            ^ corps
 *
 * On tranche sur le dernier caractere significatif : une accolade qui suit
 * `:` `|` `&` `=` `,` `(` `<` `[` ou `=>` est en position de TYPE ; celle qui
 * suit un identifiant ou un `>` de generique ferme le prototype et ouvre le
 * corps. Mesure : sur les 179 symboles exportes du dossier, cette regle
 * classe correctement les 179 (aucune signature desequilibree en sortie).
 */
const isTypePosition = (prev, prev2) => prev === '' || ':|&=,(<['.includes(prev) || (prev2 === '=' && prev === '>')

/**
 * La signature, telle qu'elle est ecrite — jamais reconstruite.
 *
 * ⛔ La version precedente coupait au PREMIER `{` ou `=>` rencontres, sans
 * tenir compte de l'imbrication. Or les trois motifs ci-dessous placent l'un
 * ou l'autre EN PLEIN MILIEU du prototype, et produisaient 52 signatures
 * tronquees sur 179 (#605) :
 *
 *   1. parametre destructure   useSticky ({rootEl, isSticky}: ISticky)
 *                                        ^ coupe ici
 *   2. type de retour objet    useLoader (…): { loaderClasses: … }
 *                                             ^ coupe ici
 *   3. type fonction en param  useBackButton (…, cb: (n: Next) => void)
 *                                                            ^ coupe ici
 *
 * Une signature tronquee n'est pas cosmetique : le lecteur qui copie
 * `useDisplay ( props: IDisplayProps =` obtient du code qui ne compile pas,
 * et rien n'indique que la ligne est incomplete — de la doc mensongere.
 *
 * On lit donc le prototype avec un vrai suivi de profondeur `()` `[]` `{}`,
 * en sautant chaines, gabarits et commentaires (le generique de `useVModel`
 * contient un gabarit `` `onUpdate:${Prop}` `` qui porterait sinon une
 * accolade fantome). L'arret :
 *
 *   - `function` : l'accolade du corps, ou un `;` (surcharge) a la profondeur 0.
 *     On n'arrete JAMAIS sur `=>`, qui pour cette forme ne peut etre qu'un
 *     type fonction dans le retour (`(): () => void {`).
 *   - `const`    : la flêche de la fonction assignee, une fois la liste de
 *     parametres refermee — apres un eventuel type de retour objet
 *     (`useChartGauge = (o: O): { geometry: … } => {`).
 */
const signatureAt = (source, index, kind) => {
    const n = source.length
    let i = index
    let par = 0
    let sq = 0
    let cu = 0
    // La liste de parametres de tete a-t-elle ete refermee ?
    let closedParams = false
    let prev = ''
    let prev2 = ''
    // ⛔ Les commentaires INTERNES a la liste de parametres sont retires de la
    // signature publiee : `useStateEffect` documente son parametre `flat` par
    // un bloc JSDoc entre deux virgules, qui autrement se retrouvait recopie
    // tel quel au milieu du bloc ```ts. Ils ne font pas partie du contrat de
    // type — la description, elle, est publiee juste en dessous.
    const parts = []
    let segStart = index

    const bump = (c) => {
        if (!/\s/.test(c)) {
            prev2 = prev
            prev = c
        }
    }

    while (i < n) {
        const c = source[i]
        const two = source.slice(i, i + 2)

        // ⛔ Fin d'une SURCHARGE. En TypeScript une surcharge n'a pas de corps,
        // et celles de ce depot ne portent PAS de `;` final : elles s'arretent
        // sur un retour a la ligne, suivi de la banniere de la surcharge
        // suivante. Sans cette regle, la lecture traverse le commentaire et va
        // chercher l'accolade du corps de l'implementation, bien plus bas.
        // Defaut PRE-EXISTANT, absent du ticket : `useLocale` publiait deja sa
        // banniere entiere a l'interieur de son bloc ```ts (Commons.md L1194
        // et L1217 avant correctif).
        if (closedParams && par + sq + cu === 0 && (two === '//' || two === '/*')) break
        if (closedParams && par + sq + cu === 0 && source.startsWith('export', i) && source[i - 1] === '\n') break

        // Commentaires — un `{` en commentaire ne ferme pas un prototype.
        if (two === '//' || two === '/*') {
            parts.push(source.slice(segStart, i))
            if (two === '//') {
                const nl = source.indexOf('\n', i)
                i = nl === -1 ? n : nl
            } else {
                const close = source.indexOf('*/', i + 2)
                i = close === -1 ? n : close + 2
            }
            segStart = i
            continue
        }

        // Chaines et gabarits — sautes d'un bloc, `\` echappe le caractere suivant.
        if (c === '"' || c === "'" || c === '`') {
            i++
            while (i < n && source[i] !== c) {
                if (source[i] === '\\') i++
                i++
            }
            i++
            bump(c)
            continue
        }

        const depth = par + sq + cu

        if (c === '(') par++
        else if (c === ')') {
            par--
            if (par === 0 && sq === 0 && cu === 0) closedParams = true
        } else if (c === '[') sq++
        else if (c === ']') sq--
        else if (c === '{') {
            if (depth === 0 && !isTypePosition(prev, prev2)) break
            cu++
        } else if (c === '}') cu--
        else if (two === '=>' && depth === 0 && kind === 'const' && closedParams) break
        else if (c === ';' && depth === 0) break

        bump(c)
        i++
    }

    parts.push(source.slice(segStart, i))

    return parts.join(' ')
        .replace(/\s+/g, ' ')
        // Une virgule restee orpheline apres le retrait d'un commentaire.
        .replace(/,\s*\)/g, ' )')
        .trim()
}

const files = walk(COMPOSABLES, (f) => f.endsWith('.composable.ts'))
const consumersRoot = walk(SRC, (f) => /\.(vue|ts)$/.test(f) && !f.includes('/composables/'))
const consumerBlobs = consumersRoot.map((f) => [ path.relative(SRC, f), readFileSync(f, 'utf8') ])

const byDomain = new Map()

for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const domain = path.relative(COMPOSABLES, file).split(path.sep)[0]

    // ⛔ Le groupe `kind` n'est pas decoratif : `function` et `const` ne se
    // terminent pas au meme endroit (cf. `signatureAt`).
    for (const m of source.matchAll(/^export (function|const) ([A-Za-z0-9_]+)/gm)) {
        const kind = m[1]
        const name = m[2]
        const consumers = consumerBlobs
            .filter(([ , blob ]) => new RegExp(`\\b${ name }\\b`).test(blob))
            .map(([ rel ]) => rel)

        if (!byDomain.has(domain)) byDomain.set(domain, [])
        byDomain.get(domain).push({
            name,
            file: path.relative(REPO, file),
            signature: signatureAt(source, m.index, kind),
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
