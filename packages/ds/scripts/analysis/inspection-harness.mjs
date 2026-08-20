#!/usr/bin/env node
/*
 * Harnais de mesure — C4 / C5 / C8 sur les 217 composants du catalogue DS.
 *
 * POURQUOI CE SCRIPT EXISTE
 * ---------------------------------------------------------------------
 * Une grille d'inspection à 8 critères (C1..C8) est appliquée aux 217
 * composants. Remplir 217 × 8 cases À LA LECTURE produit des verdicts
 * faux — mesuré sur ce dépôt : 3 verdicts erronés sur 7 composants relus
 * à l'œil, corrigés seulement en montant les composants et en lisant le
 * rendu réel. Ce fichier MÉCANISE les trois critères qui peuvent l'être
 * sans navigateur :
 *
 *   C4 — un prop lu EAGERLY dans `setup()` échappe au résolveur de thème
 *        ADR-005 (celui-ci écrit dans `beforeCreate`, APRÈS `setup()`).
 *   C5 — un `emit` DÉCLARÉ dans `IXxxEmits` que le composant ne peut
 *        JAMAIS émettre (ni littéralement, ni par un relais connu).
 *   C8 — une chaîne destinée à l'utilisateur écrite en dur au lieu de
 *        passer par `t('cle', 'fallback')`.
 *
 * CE QUE CE SCRIPT N'EST PAS
 * ---------------------------------------------------------------------
 * PAS un garde. Il ne fait JAMAIS `process.exit(1)`, n'a PAS de baseline,
 * et ne bloque aucun push. Il MESURE et rapporte — le tri entre "défaut
 * réel" et "faux positif à born" reste un jugement HUMAIN, particulièrement
 * pour C5 (voir les limites documentées dans `lib/dead-emits.mjs`) et C8
 * (voir `lib/hardcoded-strings.mjs`). Il ne modifie AUCUN composant.
 *
 * RÉUTILISATION — rien n'est réécrit ici
 * ---------------------------------------------------------------------
 *   - C4 délègue entièrement à `guards/lib/setup-reads.mjs`
 *     (`analyseSource`), le détecteur AST déjà épinglé par 20 fixtures
 *     dans `setup-reads.selftest.mjs`. Ce fichier n'y ajoute AUCUNE
 *     logique de détection, seulement le VERDICT (violation ⟺ des lectures
 *     eager existent ET `useDefaults()` n'est pas appelé — le seul
 *     correctif connu, cf. le header de `setup-reads.mjs`).
 *   - C5 délègue à `analysis/lib/dead-emits.mjs`, qui réutilise à son tour
 *     `guards/lib/emits.mjs` (partagé avec le garde CI
 *     `emits-completeness.mjs` — même index d'interfaces, même mécanique
 *     de relais `update:*`).
 *   - C8 est un détecteur neuf, `analysis/lib/hardcoded-strings.mjs`,
 *     appuyé sur le vrai parseur `vue/compiler-sfc` (pas une regex sur du
 *     HTML) et sur le compilateur TypeScript pour `withDefaults`.
 *
 * Run:
 *   node packages/ds/scripts/analysis/inspection-harness.mjs         # résumé lisible
 *   node packages/ds/scripts/analysis/inspection-harness.mjs json    # JSON complet, un objet par composant
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getRealComponents, DS_ROOT } from '../guards/lib/components.mjs'
import { analyseSource as analyseSetupReads } from '../guards/lib/setup-reads.mjs'
import { buildInterfaceIndex } from '../guards/lib/emits.mjs'
import { analyseDeadEmits } from './lib/dead-emits.mjs'
import { analyseHardcodedStrings } from './lib/hardcoded-strings.mjs'

/*********************************************************
 * analyseComponent
 *
 * @description
 * Applique les trois détecteurs à UN composant et rend un verdict par
 * critère. `emitsIndex` est construit UNE FOIS par `analyseCatalogue()`
 * (parcourir `src/interfaces/**​/*.interface.ts` pour chacun des 217
 * composants serait un travail quadratique inutile).
 ********************************************************/
function analyseComponent ({ pascalName, kebabName, file }, emitsIndex) {
    const source = readFileSync(file, 'utf8')
    const relative = path.relative(DS_ROOT, file)

    // ── C4 ───────────────────────────────────────────────────────────
    const setupReads = analyseSetupReads(source, path.basename(file))
    const eagerProps = [...new Set(setupReads.eager.map(e => e.prop))]
    const c4 = {
        eagerProps,
        callsUseDefaults: setupReads.callsUseDefaults,
        // Le SEUL correctif connu est `useDefaults()` (cf. header de
        // setup-reads.mjs) — une lecture eager SANS lui est un défaut ;
        // avec lui, le composant a déjà été mis en conformité.
        violation: !setupReads.callsUseDefaults && eagerProps.length > 0
    }

    // ── C5 ───────────────────────────────────────────────────────────
    const emits = analyseDeadEmits(source, emitsIndex)
    const c5 = {
        declared: emits.declared,
        neverEmitted: emits.neverEmitted,
        indeterminate: emits.indeterminate,
        violation: emits.neverEmitted.length > 0
    }

    // ── C8 ───────────────────────────────────────────────────────────
    const strings = analyseHardcodedStrings(source, file)
    const c8Count = strings.static.length + strings.boundLiteral.length +
        strings.templateText.length + strings.withDefaults.length
    const c8 = {
        static: strings.static,
        boundLiteral: strings.boundLiteral,
        templateText: strings.templateText,
        withDefaults: strings.withDefaults,
        count: c8Count,
        violation: c8Count > 0
    }

    return { pascalName, kebabName, relative, c4, c5, c8 }
}

/** Analyse le catalogue entier. Exporté pour le self-test et pour tout
 *  futur consommateur (remplissage de la grille C1..C8). */
export function analyseCatalogue () {
    const emitsIndex = buildInterfaceIndex()
    return getRealComponents().map(c => analyseComponent(c, emitsIndex))
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const rows = analyseCatalogue()

    if (process.argv[2] === 'json') {
        console.log(JSON.stringify(rows, null, 2))
    } else {
        const c4 = rows.filter(r => r.c4.violation)
        const c5 = rows.filter(r => r.c5.violation)
        const c5Indet = rows.filter(r => r.c5.indeterminate.length > 0)
        const c8 = rows.filter(r => r.c8.violation)

        const line = '─'.repeat(70)
        console.log(line)
        console.log('Harnais de mesure — C4 / C5 / C8 (mesure, ne bloque rien)')
        console.log(line)
        console.log(`composants analysés ......................... ${rows.length}`)
        console.log('')
        console.log(`C4 — lectures eager sans useDefaults() ...... ${c4.length} composant(s)`)
        for (const r of c4.sort((a, b) => b.c4.eagerProps.length - a.c4.eagerProps.length)) {
            console.log(`  ${r.pascalName.padEnd(28)} [${r.c4.eagerProps.join(', ')}]`)
        }
        console.log('')
        console.log(`C5 — emit déclaré jamais émis ................ ${c5.length} composant(s), ${c5Indet.length} composant(s) avec cas indéterminé(s)`)
        for (const r of c5.sort((a, b) => b.c5.neverEmitted.length - a.c5.neverEmitted.length)) {
            console.log(`  ${r.pascalName.padEnd(28)} [${r.c5.neverEmitted.join(', ')}]`)
        }
        for (const r of c5Indet) {
            console.log(`  ${r.pascalName.padEnd(28)} indéterminé: [${r.c5.indeterminate.join(', ')}]`)
        }
        console.log('')
        const c8Total = c8.reduce((acc, r) => acc + r.c8.count, 0)
        console.log(`C8 — chaînes en dur .......................... ${c8.length} composant(s), ${c8Total} occurrence(s)`)
        for (const r of c8.sort((a, b) => b.c8.count - a.c8.count)) {
            console.log(`  ${r.pascalName.padEnd(28)} ${r.c8.count} occurrence(s)`)
        }
        console.log(line)
    }
}
