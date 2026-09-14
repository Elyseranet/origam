#!/usr/bin/env node
/*
 * C5 — SECONDE MOITIÉ DU CRITÈRE : « et un test le prouve-t-il ? »
 *
 * POURQUOI CE SCRIPT EXISTE
 * ---------------------------------------------------------------------
 * Le critère C5 de la grille d'inspection en pose DEUX, reliées par un
 * « et » qu'il est facile de lire trop vite :
 *
 *   « Les emits déclarés partent-ils réellement, ET UN TEST LE PROUVE-T-IL ? »
 *
 * `inspection-harness.mjs` ne mesure que la première : un `emit` déclaré
 * dans `IXxxEmits` que le composant ne peut JAMAIS émettre (verdict actuel :
 * 0 défaut sur 218). La seconde n'avait jamais été mesurée. Elle l'est ici.
 *
 * CE QUE CE SCRIPT N'EST PAS
 * ---------------------------------------------------------------------
 * PAS un garde. Aucun `process.exit(1)`, aucune baseline, ne bloque aucun
 * push. Il MESURE. Un composant en défaut ici n'a pas de bug : il a un
 * TROU DE COUVERTURE, ce qui est une information différente et se répare
 * par un test, pas par un correctif produit.
 *
 * ⛔ QUATRE PIÈGES, TOUS MESURÉS SUR PIÈCES AVANT D'ÊTRE CODÉS
 * ---------------------------------------------------------------------
 * Ils sont documentés parce que les trois premières versions de ce
 * détecteur sont tombées dedans, et qu'une colonne versée depuis l'une
 * d'elles aurait porté des dizaines de verdicts faux — dans les DEUX sens.
 *
 * 1. FAUX ROUGE — le canal e2e.
 *    Chercher `emitted('nom')` seul rate toutes les specs Playwright, qui
 *    prouvent l'emit via le journal d'événements de la story :
 *      `expect(log.filter({ hasText: 'legend-click' })).not.toHaveCount(0)`
 *    Sans ce canal : 139 emits annoncés sans preuve, dont toute la famille
 *    Chart à tort.
 *
 * 2. FAUX VERT — les commentaires.
 *    `e2e/parallax.spec.ts` cite `scroll-progress` dans un bloc qui dit
 *    exactement l'inverse : « @scroll-progress is never emitted ». Un
 *    commentaire qui DOCUMENTE L'ABSENCE serait compté comme sa preuve.
 *    D'où le décommentage préalable du corpus.
 *
 * 3. FAUX VERT — l'homonymie.
 *    `load`, `pause`, `error`, `close`, `click` sont des mots trop courants
 *    pour être cherchés dans un corpus global : n'importe quel
 *    `expect(x).toBe('load')` d'une spec sans rapport rendrait `Img.load`
 *    prouvé. Le corpus est donc indexé PAR FICHIER, et seuls les fichiers
 *    qui ciblent le composant sont interrogés.
 *
 * 4. FAUX ROUGE — l'appariement lexical.
 *    `\bChart\b` ne matche AUCUNE des trois formes réelles, faute de
 *    frontière de mot dans « OrigamChart » : `chart.spec.ts` se retrouvait
 *    attribué à zéro composant. Les trois formes nécessaires sont
 *    `OrigamChart` (import/mount TU), `origam-chart` (balise, data-cy,
 *    sélecteur e2e) et `origamchart` (slug d'URL de story Playwright,
 *    `components-stories-chart-origamchart-story-vue`). La borne droite est
 *    `(?![\w-])` et non `\b`, sans quoi `origam-chart` matcherait
 *    `origam-chart-cartesian` et la preuve du parent contaminerait les
 *    20 enfants de la famille.
 *
 * ⛔ LA PREUVE N'EST PAS TRANSMISSIBLE PAR RELAIS — mesuré, tranché
 * ---------------------------------------------------------------------
 * Une variante « preuve directe OU transmise par un parent qui rend
 * l'enfant et relaie le même emit » a été implémentée et mesurée : elle
 * requalifie 3 composants (`ChartPictorial`, `ChartPyramid`,
 * `ChartStreamgraph`) et 37 emits.
 *
 * Elle a été REJETÉE, et le motif est vérifiable. `OrigamChart` est un
 * dispatcher : il rend l'une de ses ~20 balises enfants selon `type`, et
 * relaie `@legend-click` sur chacune (`OrigamChart.vue` l.2, 7, 1006).
 * Le test qui prouve `legend-click` (`e2e/chart.spec.ts:182`) ouvre la
 * variante « Default » — dont le premier test du même fichier établit
 * qu'elle rend `[data-cy~="origam-chart--line"]`, donc `type: 'line'`,
 * donc le noyau CARTÉSIEN. L'événement traverse `OrigamChartCartesian` et
 * lui seul. Créditer les 19 autres enfants aurait fabriqué autant de faux
 * verts — la branche qui les rend n'est jamais montée par ce test.
 *
 * Le relais reste une preuve valable quand l'enfant est rendu
 * INCONDITIONNELLEMENT (`FileFieldListItem` par `FileField`). Distinguer
 * les deux cas demande de résoudre le `v-if`/`<component :is>` du parent,
 * ce que ce script ne fait pas. Il retient donc la lecture STRICTE, qui se
 * trompe dans le sens réparable : un trou de couverture signalé à tort
 * coûte un test de plus, un trou masqué coûte le défaut qu'il cachait.
 *
 * Run:
 *   node packages/ds/scripts/analysis/c5-emits-proof.mjs         # résumé
 *   node packages/ds/scripts/analysis/c5-emits-proof.mjs json    # JSON complet
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { analyseCatalogue } from './inspection-harness.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const TESTS = path.resolve(HERE, '../../../tests')

/*********************************************************
 * sansCommentaires
 *
 * @description
 * Retire commentaires de bloc et de ligne. Sans ce passage, un commentaire
 * qui documente l'ABSENCE d'un emit serait compté comme sa preuve — piège
 * n°2 du header, observé sur `e2e/parallax.spec.ts`.
 *
 * La garde `[^:]` devant `//` évite de tronquer les URLs (`https://…`).
 ********************************************************/
export function sansCommentaires (src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

/*********************************************************
 * chargerCorpus
 *
 * @description
 * Indexe les specs PAR FICHIER (jamais en blob global — piège n°3), en
 * conservant pour chacune le contenu de ses seules expressions
 * `expect(...)` / `emitted(...)`. Une occurrence hors assertion (montage,
 * fixture, titre de test) ne prouve rien.
 ********************************************************/
export function chargerCorpus (racine = TESTS) {
    const fichiers = []

    const walk = (dir) => {
        if (!existsSync(dir)) return
        for (const e of readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, e.name)
            if (e.isDirectory()) { walk(full); continue }
            if (!/\.(spec|test)\.[tj]s$/.test(e.name)) continue

            const src = sansCommentaires(readFileSync(full, 'utf8'))
            fichiers.push({
                nom: path.relative(racine, full),
                src,
                assertions: [
                    ...src.matchAll(/\bexpect\(([\s\S]{0,400}?)\)\s*(?:\.|\n)/g),
                    ...src.matchAll(/\bemitted\(([^)]{0,200})\)/g)
                ].map(m => m[1] ?? '').join('\n')
            })
        }
    }

    walk(path.join(racine, 'TU'))
    walk(path.join(racine, 'e2e'))

    return fichiers
}

const echapper = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/*********************************************************
 * fichiersCiblant
 *
 * @description
 * Les specs qui ciblent CE composant, par les trois formes réelles de son
 * nom (piège n°4). Bornes droites strictes pour qu'un parent ne capte pas
 * ses enfants.
 ********************************************************/
export function fichiersCiblant (fichiers, pascalName, kebabName) {
    const p = echapper(pascalName)
    const k = echapper(kebabName)
    const re = new RegExp(
        `Origam${p}(?![\\w])` +
        `|origam-${k}(?![\\w-])` +
        `|origam${p.toLowerCase()}(?![a-z])`
    )

    return fichiers.filter(f => re.test(f.src))
}

/*********************************************************
 * analyseC5Preuve
 *
 * @description
 * Rend, pour chacun des 218 composants du catalogue, la liste de ses emits
 * déclarés et celle de ceux qu'aucune assertion n'atteint.
 *
 * Un composant SANS emit déclaré est `conforme` : le critère est sans
 * objet, pas satisfait par défaut — la nuance est portée par `sansObjet`.
 ********************************************************/
export function analyseC5Preuve () {
    const fichiers = chargerCorpus()

    return analyseCatalogue().map((r) => {
        const declares = r.c5.declared ?? []
        const cibles = fichiersCiblant(fichiers, r.pascalName, r.kebabName)

        const sansPreuve = declares.filter((emit) => {
            const e = echapper(emit)
            const litteral = new RegExp(`['"\`]${e}['"\`]`)
            const chaine = new RegExp(`emitted\\(\\)\\s*[.\\[]\\s*['"\`]?${e}\\b`)

            return !cibles.some(f => litteral.test(f.assertions) || chaine.test(f.src))
        })

        return {
            pascalName: r.pascalName,
            kebabName: r.kebabName,
            declares,
            sansPreuve,
            fichiersCibles: cibles.map(f => f.nom),
            sansObjet: declares.length === 0,
            violation: sansPreuve.length > 0
        }
    })
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const rows = analyseC5Preuve()

    if (process.argv[2] === 'json') {
        console.log(JSON.stringify(rows, null, 2))
    } else {
        const enDefaut = rows.filter(r => r.violation)
        const sansObjet = rows.filter(r => r.sansObjet)
        const orphelins = rows.filter(r => !r.sansObjet && r.fichiersCibles.length === 0)
        const totalEmits = rows.reduce((n, r) => n + r.declares.length, 0)
        const totalNus = enDefaut.reduce((n, r) => n + r.sansPreuve.length, 0)

        const line = '─'.repeat(72)
        console.log(line)
        console.log('C5 — seconde moitié : un test prouve-t-il chaque emit déclaré ?')
        console.log(line)
        console.log(`composants analysés ......................... ${rows.length}`)
        console.log(`  sans aucun emit (critère sans objet) ...... ${sansObjet.length}`)
        console.log(`  avec au moins un emit ..................... ${rows.length - sansObjet.length}`)
        console.log(`    tous les emits assertés ................. ${rows.length - sansObjet.length - enDefaut.length}`)
        console.log(`    au moins un emit sans preuve ............ ${enDefaut.length}`)
        console.log('')
        console.log(`emits déclarés .............................. ${totalEmits}`)
        console.log(`  sans aucune assertion ..................... ${totalNus}`)
        console.log('')
        console.log(`composants sans AUCUNE spec les ciblant ..... ${orphelins.length}`)
        for (const r of orphelins) console.log(`  ${r.pascalName}`)
        console.log('')

        for (const r of enDefaut.sort((a, b) => b.sansPreuve.length - a.sansPreuve.length)) {
            const l = r.sansPreuve
            console.log(`  ${r.pascalName.padEnd(28)} ${String(l.length).padStart(2)}/${String(r.declares.length).padEnd(2)}  [${l.slice(0, 6).join(', ')}${l.length > 6 ? ', …' : ''}]`)
        }
        console.log(line)
    }
}
