#!/usr/bin/env node
/*********************************************************
 * Guard — token-twins
 *
 * @description
 * Chaque feuille de tokens existe en DEUX exemplaires :
 * `src/assets/css/tokens/{nom}.css` et son jumeau SCSS
 * `src/assets/scss/tokens/_{nom}.scss`. Le `CLAUDE.md` racine l'ecrit depuis
 * toujours — « The SCSS twin and the CSS file are identical in content, so a
 * change to one must be mirrored in the other » — mais RIEN ne le verifiait.
 * Ce garde le verifie : les deux fichiers doivent etre identiques OCTET POUR
 * OCTET, en-tete de commentaire compris.
 *
 * @description
 * ⛔ #794 — ce que coute l'absence de ce garde. `dark.css` portait un bloc
 * `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }` de
 * ~2730 declarations que `_dark.scss` n'avait pas. Or `main.css` — le fichier
 * que resout l'export `./styles`, donc l'entree que prend un consommateur par
 * defaut — est COMPILE depuis la SCSS (`styles:build` = `sass main.scss →
 * main.css`). Le bundle publie n'avait donc aucun mode sombre automatique,
 * pendant que le fichier CSS, le commentaire d'en-tete de `main.scss` et la
 * section Multi-theme du `CLAUDE.md` affirmaient tous les trois le contraire.
 * Mesure en navigateur : preference systeme sombre, aucun `data-theme` →
 * `rgb(255,255,255)`. Une fonctionnalite documentee que le paquet ne
 * fournissait pas, sur son entree principale.
 *
 * @description
 * ⛔ Piege de mesure, et il est la vraie raison pour laquelle ce defaut a
 * survecu a plusieurs relectures : `main.css` est minifie sur UNE SEULE
 * LIGNE. `grep -c` y compte des LIGNES, pas des occurrences — il rend `0` ou
 * `1` quelle que soit la realite. Et le minifieur retire les guillemets :
 * chercher `data-theme="dark"` rend `0`, `data-theme=dark` rend `1`. Compter
 * avec `grep -o … | wc -l`, jamais `grep -c`.
 *
 * @description
 * Pourquoi l'identite OCTET pour octet plutot qu'une comparaison
 * « declarations equivalentes » : les deux fichiers sont deja identiques
 * (verifie sur les 4 paires), un diff textuel donne un message d'erreur
 * exploitable a la ligne pres, et surtout la regle devient impossible a
 * satisfaire a moitie. Une comparaison plus tolerante aurait laisse passer
 * exactement #794, qui est une DIVERGENCE DE STRUCTURE, pas de valeurs.
 *
 * Run: `node packages/ds/scripts/guards/token-twins.mjs`
 ********************************************************/
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DS = path.resolve(HERE, '../..')
const CSS_DIR = path.join(DS, 'src/assets/css/tokens')
const SCSS_DIR = path.join(DS, 'src/assets/scss/tokens')

const BAR = '─'.repeat(70)

console.log(BAR)
console.log('Guard: token-twins (chaque feuille de tokens .css est identique a son jumeau _*.scss)')
console.log(BAR)

/** Premiere ligne divergente, pour que le message pointe quelque part. */
function firstDivergence (a, b) {
    const left = a.split('\n')
    const right = b.split('\n')

    for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (left[i] !== right[i]) {
            return {
                line: i + 1,
                css: left[i] === undefined ? '(fin de fichier)' : left[i].trim().slice(0, 90),
                scss: right[i] === undefined ? '(fin de fichier)' : right[i].trim().slice(0, 90)
            }
        }
    }

    return null
}

const offenders = []
const checked = []

const cssFiles = existsSync(CSS_DIR)
    ? readdirSync(CSS_DIR).filter(f => f.endsWith('.css')).sort()
    : []

if (!cssFiles.length) {
    // Un repertoire vide et un repertoire conforme rendent le meme vert : on
    // refuse de passer silencieusement sur zero fichier audite.
    console.log(`FAIL — aucune feuille de tokens trouvee dans ${path.relative(process.cwd(), CSS_DIR)}.`)
    console.log('       Le garde n\'a rien mesure : chemin deplace, ou audit lance depuis le mauvais arbre.')
    console.log(BAR)
    process.exit(1)
}

for (const file of cssFiles) {
    const name = file.replace(/\.css$/, '')
    const cssPath = path.join(CSS_DIR, file)
    const scssPath = path.join(SCSS_DIR, `_${name}.scss`)

    if (!existsSync(scssPath)) {
        offenders.push({ name, reason: 'jumeau SCSS absent', scssPath })
        continue
    }

    const css = readFileSync(cssPath, 'utf8')
    const scss = readFileSync(scssPath, 'utf8')

    checked.push(name)

    if (css !== scss) {
        offenders.push({ name, reason: 'contenu divergent', cssPath, scssPath, at: firstDivergence(css, scss) })
    }
}

if (!offenders.length) {
    console.log(`PASS — ${checked.length} paire(s) identiques : ${checked.join(', ')}.`)
    console.log(BAR)
    process.exit(0)
}

for (const o of offenders) {
    console.log(`  ${o.name} — ${o.reason}`)

    if (o.at) {
        console.log(`      premiere divergence ligne ${o.at.line}`)
        console.log(`        .css  : ${o.at.css}`)
        console.log(`        .scss : ${o.at.scss}`)
    } else {
        console.log(`      attendu : ${path.relative(process.cwd(), o.scssPath)}`)
    }
}

console.log('')
console.log(`FAIL — ${offenders.length} paire(s) divergente(s) sur ${cssFiles.length}.`)
console.log('       Reporter la modification dans les DEUX fichiers (ils doivent etre identiques,')
console.log('       en-tete compris), puis regenerer le bundle : `pnpm -F origam run styles:build`.')
console.log('       ⛔ Ne PAS editer main.css a la main — il est genere depuis main.scss.')
console.log(BAR)
process.exit(1)
