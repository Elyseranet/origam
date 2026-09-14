#!/usr/bin/env node
/*********************************************************
 * Valeurs en dur ecrivant par-dessus un token qui existe
 *
 * @description
 * Cherche les declarations litterales — `padding: 6px`, `letter-spacing:
 * 0.009375em` — posees la ou un token `--origam-…` est pourtant DECLARE et
 * pourrait etre lu. C'est un defaut silencieux : le theme surcharge le token,
 * le composant ne le lit pas, la surcharge ne produit rien, et rien ne le
 * signale.
 *
 * @description
 * ⛔ **Ce script ne mesure PAS la colonne C2 du classeur, malgre son sujet
 * voisin.** Je l'ai ecrit en croyant le contraire. C2 demande combien de
 * tokens d'un composant sont DECLARES MAIS JAMAIS LUS — des canaux dormants —
 * et cette mesure-la est celle de la baseline du garde `token-var-channels`,
 * pas celle-ci. Les notes du classeur le disent d'ailleurs noir sur blanc :
 * « N declares, M jamais lus ».
 *
 * Les deux questions sont symetriques et complementaires : ce script trouve la
 * valeur en dur qui EMPECHE de lire un token, le garde trouve le token que
 * PERSONNE ne lit. Un meme composant peut echouer a l'une et reussir l'autre.
 *
 * @description
 * ⛔ Ce script MESURE, il ne garde pas. Il est range dans `analysis/` et pas
 * dans `guards/` a dessein : sa sortie sert a decider, elle ne bloque aucun
 * commit. Un garde exige un taux de faux positifs nul ; ici on accepte de
 * signaler pour que quelqu'un tranche — et sur les 10 candidats de la premiere
 * passe, environ quatre demandaient un jugement humain (un `border-radius: 50%`
 * qui fait un cercle n'est pas un canal de theme rate).
 *
 * ## Comment un candidat est reconnu
 *
 * Pour chaque regle CSS d'un `<style>` de composant, on prend les classes du
 * selecteur, on en derive le prefixe de token que la grammaire du DS
 * produirait, et pour chaque declaration `propriete: litteral` on demande :
 * ce token existe-t-il dans `light.css` ? Si oui, la valeur en dur ecrase un
 * canal reel.
 *
 * ## Ce qui est explicitement EXCLU, et pourquoi
 *
 * - **Le fallback d'un `var()`** — `var(--x, 4px)` : le litteral est la valeur
 *   de secours, c'est le fonctionnement normal, pas un ecrasement.
 * - **Les proprietes sans token possible** — `display`, `position`, `overflow`,
 *   `flex-direction`… Elles n'ont pas de canal de theme et n'en auront pas.
 * - **Les valeurs non litterales** — mots-cles (`auto`, `none`, `inherit`),
 *   fonctions autres que couleurs.
 *
 * ⛔ **Les deux grammaires ne coincident pas, et c'est le coeur du probleme.**
 * Une classe `.origam-date-picker-controls` et un token
 * `--origam-date-picker__controls---padding` designent le meme element mais ne
 * s'ecrivent pas pareil : l'un aplatit ce que l'autre separe en bloc BEM.
 * Comparer les chaines telles quelles ne trouve rien. On compare donc des
 * formes CANONIQUES — segments alphanumeriques, separateurs effaces — ce qui
 * fait coincider `date-picker-controls` et `date-picker__controls`.
 *
 * C'est le meme motif que celui qui a produit 86 tokens morts sur `list` et le
 * `--v-body-scroll-y` de `useSticky` : un nom ecrit sous deux grammaires qui ne
 * se rencontrent jamais.
 ********************************************************/

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(HERE, '../../src')

/*********************************************************
 * NO_TOKEN_PROPERTIES
 *
 * @description
 * Proprietes structurelles : elles decrivent la mise en page, pas l'apparence
 * themable. Aucun token ne les vise et aucun ne devrait. Les inclure noierait
 * le signal sous des `display: flex`.
 ********************************************************/
const NO_TOKEN_PROPERTIES = new Set([
    'display', 'position', 'overflow', 'overflow-x', 'overflow-y',
    'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
    'align-items', 'align-self', 'align-content', 'justify-content', 'justify-items', 'justify-self',
    'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-area',
    'grid-column', 'grid-row', 'grid-auto-flow', 'grid-auto-rows', 'grid-auto-columns',
    'box-sizing', 'content', 'cursor', 'pointer-events', 'user-select', 'visibility',
    'white-space', 'word-break', 'overflow-wrap', 'text-overflow', 'list-style',
    'appearance', '-webkit-appearance', 'isolation', 'will-change', 'contain',
    'container-type', 'container-name', 'touch-action', 'scroll-behavior',
    'scroll-snap-type', 'scroll-snap-align', 'backface-visibility', 'transform-style'
])

/** Une valeur litterale : longueur, couleur, nombre nu, pourcentage. */
const LITERAL = /^(-?\d*\.?\d+(px|rem|em|%|vh|vw|vmin|vmax|ch|s|ms|deg)?|#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))$/

/**
 * Forme canonique d'un nom : on ne garde que la suite des segments
 * alphanumeriques. `date-picker-controls` et `date-picker__controls` donnent
 * tous deux `datepickercontrols`.
 */
const canon = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Tous les fichiers correspondant a une extension, en profondeur. */
const walk = (dir, ext, out = []) => {
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)

        if (statSync(full).isDirectory()) walk(full, ext, out)
        else if (entry.endsWith(ext)) out.push(full)
    }

    return out
}

/*********************************************************
 * declaredTokens
 *
 * @description
 * Les tokens que le theme declare reellement, lus dans les feuilles
 * committees. Depuis la suppression du pipeline Style Dictionary le
 * 2026-08-31, ces fichiers SONT la source de verite — il n'y a plus rien en
 * amont dont ils seraient derives.
 ********************************************************/
const declaredTokens = () => {
    const set = new Set()

    for (const file of [ 'tokens/light.css', 'tokens/dark.css', 'tokens/primitive.css' ]) {
        const full = path.join(SRC, 'assets/css', file)

        try {
            for (const m of readFileSync(full, 'utf8').matchAll(/(--origam-[A-Za-z0-9_-]+)\s*:/g)) set.add(m[1])
        } catch { /* fichier absent : on continue avec les autres */ }
    }

    return set
}

/** Index des tokens par (bloc canonique, propriete canonique). */
const indexTokens = (tokens) => {
    const index = new Map()

    for (const token of tokens) {
        // --origam-{bloc}---{propriete}, ou {bloc} peut porter --{etat} ou __{enfant}
        const m = token.match(/^--origam-(.+?)---(.+)$/)

        if (!m) continue

        const bloc = m[1].replace(/--[a-z0-9-]+$/, '')
        const key = canon(bloc) + '|' + canon(m[2])

        if (!index.has(key)) index.set(key, [])
        index.get(key).push(token)
    }

    return index
}

/** Retire commentaires et fallbacks de `var()` pour ne pas les prendre pour des littéraux. */
const scrub = (css) => css
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/var\(\s*--[A-Za-z0-9_-]+\s*,[^()]*\)/g, 'VAR')
    .replace(/var\(\s*--[A-Za-z0-9_-]+\s*\)/g, 'VAR')

/*********************************************************
 * findings
 *
 * @description
 * Parcourt les regles d'un `<style>` et retient les declarations litterales
 * dont le token correspondant existe.
 *
 * @description
 * ⛔ Le suivi de l'IMBRICATION est la partie qui compte, et la premiere
 * version de ce script s'en passait — elle gardait un seul « dernier selecteur
 * vu », sans jamais le depiler a l'accolade fermante. Sur `OrigamBtn` elle
 * attribuait donc a `.origam-btn` un `height: 100%` ecrit soixante lignes plus
 * bas dans un bloc imbrique, et concluait a un ecrasement — alors que
 * `.origam-btn` lit correctement `var(--origam-btn---height)` a la ligne 527.
 * 23 signalements sur ce seul composant, tous faux.
 *
 * @description
 * D'ou la pile : chaque `{` empile le selecteur courant, chaque `}` le
 * depile, et le chemin complet sert a deriver le prefixe. C'est aussi ce qui
 * permet de resoudre `&__enfant` par rapport a son parent reel plutot que par
 * rapport au fichier.
 ********************************************************/
const findings = (file, index) => {
    const raw = readFileSync(file, 'utf8')
    const style = raw.match(/<style[^>]*>([\s\S]*?)<\/style>/g)

    if (!style) return []

    const out = []
    const base = path.basename(file, '.vue').replace(/^Origam/, '')

    for (const block of style) {
        /*
         * ⛔ L'offset n'est pas cosmetique : sans lui, `line` compte les lignes du
         * bloc `<style>` ISOLE, et la sortie renvoie le lecteur dans le
         * `<template>` — j'ai relu six extraits de markup avant de m'en rendre
         * compte. Un numero de ligne faux vaut moins que pas de numero du tout.
         */
        const offset = raw.slice(0, raw.indexOf(block)).split('\n').length - 1
        const lines = scrub(block).split('\n')
        const stack = []
        let pending = ''

        lines.forEach((line, i) => {
            const open = (line.match(/\{/g) || []).length
            const close = (line.match(/\}/g) || []).length

            if (open) {
                // Tout ce qui precede l'accolade est le selecteur de ce niveau.
                const sel = (pending + ' ' + line.slice(0, line.indexOf('{'))).trim()

                stack.push(sel)
                pending = ''
            } else if (close === 0 && /[.&#[]/.test(line) && !line.includes(':') && line.trim()) {
                // Selecteur multi-ligne : on accumule jusqu'a l'accolade.
                pending += ' ' + line.trim()
            }

            const decl = line.match(/^\s*([a-z-]+)\s*:\s*([^;]+);/)

            if (decl && stack.length) {
                const prop = decl[1]
                const value = decl[2].trim()

                if (!NO_TOKEN_PROPERTIES.has(prop) && LITERAL.test(value)) {
                    const chemin = stack.join(' ')

                    /*
                     * ⛔ Une declaration DANS un bloc `@media`, `&:hover`, `&--variant`
                     * ou un `:deep(...)` ne vise pas le meme canal que la regle de base.
                     * On ne retient que les chemins dont le dernier niveau nomme un
                     * bloc ou un enfant BEM — le seul cas ou la correspondance avec un
                     * token est defendable sans deviner.
                     */
                    const dernier = stack[stack.length - 1].trim()

                    /*
                     * ⛔ Un MODIFICATEUR (`--variant-minimal`, `--fullscreen`) n'ecrase
                     * pas le canal de base : c'est une variante, et sa valeur en dur y
                     * est souvent le propos meme de la variante — `border-radius: 0` sur
                     * `--fullscreen` dit « plein ecran, donc pas de rayon ». Le canal
                     * correspondant serait `--origam-{cmp}--{etat}---{prop}`, pas celui
                     * de base. On les ecarte.
                     */
                    const estCible = /^(&__[A-Za-z0-9-]+|\.origam-[A-Za-z0-9-]+(__[A-Za-z0-9-]+)?)$/.test(dernier)

                    if (estCible && !chemin.includes(':deep') && !chemin.includes('@media')) {
                        /*
                         * ⛔ Le bloc se lit dans le SELECTEUR, pas dans le nom du fichier.
                         * `OrigamProgressLinear.vue` contient des regles qui visent
                         * `.origam-progress` — le parent. Deriver le bloc du fichier les
                         * faisait pointer vers `--origam-progress-linear---width`, un
                         * token que cette regle-la ne pretend pas servir.
                         */
                        const explicite = dernier.match(/^\.origam-([a-z0-9-]+?)(?:__([A-Za-z0-9-]+))?$/)
                        const bloc = explicite ? explicite[1] : canon(base)
                        const child = explicite ? explicite[2] : (dernier.match(/&__([A-Za-z0-9-]+)/) || [])[1]
                        const key = canon(bloc + (child || '')) + '|' + canon(prop)
                        const hit = index.get(key)

                        if (hit) out.push({ file, line: offset + i + 1, selector: dernier, prop, value, tokens: hit })
                    }
                }
            }

            for (let k = 0; k < close; k++) stack.pop()
        })
    }

    return out
}

const tokens = declaredTokens()
const index = indexTokens(tokens)
const files = walk(path.join(SRC, 'components'), '.vue')
const byComponent = new Map()

for (const file of files) {
    const found = findings(file, index)

    if (found.length) byComponent.set(path.basename(file, '.vue'), found)
}

const asJson = process.argv.includes('--json')

if (asJson) {
    console.log(JSON.stringify(Object.fromEntries(byComponent), null, 1))
} else {
    console.log(`${ tokens.size } tokens declares · ${ files.length } composants analyses`)
    console.log(`${ byComponent.size } composants avec au moins une valeur en dur sur un canal existant\n`)

    for (const [ name, list ] of [ ...byComponent ].sort((a, b) => b[1].length - a[1].length)) {
        console.log(`${ name } (${ list.length })`)
        for (const f of list.slice(0, 4)) {
            console.log(`   ${ f.selector } { ${ f.prop }: ${ f.value } }  ->  ${ f.tokens[0] }`)
        }
        if (list.length > 4) console.log(`   … ${ list.length - 4 } autres`)
    }
}
