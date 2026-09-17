#!/usr/bin/env node
/*
 * Auto-test du detecteur `spec-coverage` (#824).
 *
 * ⛔ POURQUOI IL EST SUR LE CHEMIN BLOQUANT DU GARDE
 * L'etat nominal de ce garde est « 0 nouvelle violation ». Un detecteur
 * devenu aveugle — extraction du rapport Playwright cassee, liste de
 * fichiers vide, comparaison inversee — imprimerait EXACTEMENT le meme
 * `PASS`. C'est le motif de #567 (self-test present, jamais execute) et de
 * #575 (porte a11y verte seize mois sur une page d'erreur). Les fixtures
 * tournent donc AVANT le balayage, comme dans `class-fallthrough` (#620) et
 * `id-forwarding` (#633), et un echec de fixture ABORTE le balayage au lieu
 * de le laisser rendre un verdict.
 *
 * Usage :
 *   node packages/tests/e2e/_support/lib/spec-coverage.selftest.mjs
 *   (ou `pnpm -F @origam/tests run test:e2e:audit:self`, qui l'appelle)
 */

import { blindnessCheck, classifySpecs, isScratchSpecPath, specFilesFromListReport } from './spec-coverage.mjs'

const CASES = []
const push = (name, fn) => CASES.push({ name, fn })

const eq = (actual, expected, what) => {
    const a = JSON.stringify(actual)
    const e = JSON.stringify(expected)
    if (a !== e) throw new Error(`${what} : attendu ${e}, obtenu ${a}`)
}

/* ─── Extraction du rapport `playwright test --list --reporter=json` ─── */

push('rapport plat — un `file` par suite racine', () => {
    const report = { suites: [{ file: 'btn.spec.ts' }, { file: 'card.spec.ts' }] }
    eq([...specFilesFromListReport(report)].sort(), ['btn.spec.ts', 'card.spec.ts'], 'fichiers extraits')
})

push('rapport IMBRIQUE — un `test.describe` interne ne doit pas etre perdu', () => {
    // ⛔ La forme reelle : Playwright niche une sous-suite par `describe`.
    // Une lecture a plat (`suites.map(s => s.file)`) marche ici par hasard ;
    // la fixture suivante est celle qui la ferait tomber.
    const report = {
        suites: [{
            file: 'counter.spec.ts',
            suites: [{ file: 'counter.spec.ts', suites: [{ file: 'counter.spec.ts' }] }]
        }]
    }
    eq([...specFilesFromListReport(report)], ['counter.spec.ts'], 'dedoublonnage sur 3 niveaux')
})

push('rapport ou le `file` n\'existe QUE sur une sous-suite', () => {
    const report = { suites: [{ title: 'chromium', suites: [{ file: 'menu.spec.ts' }] }] }
    eq([...specFilesFromListReport(report)], ['menu.spec.ts'], 'descente dans une suite sans `file`')
})

push('rapport vide → ensemble VIDE, jamais une invention', () => {
    eq([...specFilesFromListReport({ suites: [] })], [], 'suites vides')
    eq([...specFilesFromListReport({})], [], 'objet sans suites')
    eq([...specFilesFromListReport(null)], [], 'rapport nul')
})

/* ─── Classement ─── */

push('spec gardee par la CI → aucune violation', () => {
    const r = classifySpecs(['btn.spec.ts'], ['btn.spec.ts'], new Set())
    eq(r.newUngated, [], 'nouvelles non-gardees')
    eq(r.gated, ['btn.spec.ts'], 'gardees')
})

push('⛔ LE CAS #824 — spec neuve, hors liste blanche, hors baseline → VIOLATION', () => {
    // `rating-field-a11y.spec.ts` livree par #810, jamais executee par la CI.
    const r = classifySpecs(
        ['btn.spec.ts', 'rating-field-a11y.spec.ts'],
        ['btn.spec.ts'],
        new Set()
    )
    eq(r.newUngated, ['rating-field-a11y.spec.ts'], 'la spec oubliee doit ressortir')
})

push('spec non gardee mais ENREGISTREE dans la baseline → connue, pas nouvelle', () => {
    const r = classifySpecs(['a.spec.ts', 'b.spec.ts'], ['a.spec.ts'], new Set(['b.spec.ts']))
    eq(r.newUngated, [], 'aucune nouvelle')
    eq(r.known, ['b.spec.ts'], 'connue')
})

push('spec de la baseline DEVENUE gardee → ne compte plus comme non-gardee (entree perimee en aval)', () => {
    const r = classifySpecs(['b.spec.ts'], ['b.spec.ts'], new Set(['b.spec.ts']))
    eq(r.ungated, [], 'plus aucune non-gardee')
    // `diffAgainstBaseline` transformera l'entree restante en STALE → rouge.
})

push('spec gardee par la config MARKETING seulement → couverte', () => {
    const r = classifySpecs(['nav-link-availability.spec.ts'], ['nav-link-availability.spec.ts'], new Set())
    eq(r.newUngated, [], 'la seconde config compte autant que la premiere')
})

push('une meme spec gardee par les DEUX configs n\'est comptee qu\'une fois', () => {
    const r = classifySpecs(['x.spec.ts', 'x.spec.ts'], ['x.spec.ts'], new Set())
    eq(r.gated, ['x.spec.ts'], 'dedoublonnage du disque')
})

push('le classement est stable et trie — un diff de baseline reste lisible', () => {
    const r = classifySpecs(['z.spec.ts', 'a.spec.ts', 'm.spec.ts'], [], new Set())
    eq(r.newUngated, ['a.spec.ts', 'm.spec.ts', 'z.spec.ts'], 'ordre alphabetique')
})

/* ─── Aires de brouillon : le garde et Playwright doivent dire la meme chose ─── */

push('spec a plat → jamais un brouillon', () => {
    eq(isScratchSpecPath('counter.spec.ts'), false, 'fichier a la racine du testDir')
})

push('⛔ spec sous un repertoire-point → brouillon, comme `scratchDirPatterns()`', () => {
    // `.probe/` (sondes jetables), `.results/` et `.report/` (sorties Playwright).
    eq(isScratchSpecPath('.probe/oneoff.spec.ts'), true, 'sonde jetable')
    eq(isScratchSpecPath('.results/x.spec.ts'), true, 'sortie de runner')
    eq(isScratchSpecPath('a/.report/x.spec.ts'), true, 'repertoire-point imbrique')
})

push('spec dans un sous-repertoire ORDINAIRE → PAS un brouillon (elle doit etre jugee)', () => {
    // ⛔ Le faux negatif a eviter : si ce cas rendait `true`, une vraie spec
    // rangee dans un sous-dossier sortirait du balayage sans un mot — le
    // defaut #824 lui-meme, reintroduit dans le garde.
    eq(isScratchSpecPath('a11y/rating.spec.ts'), false, 'sous-repertoire ordinaire')
    eq(isScratchSpecPath('a/b/c/deep.spec.ts'), false, 'trois niveaux')
})

push('un FICHIER commencant par un point n\'est pas un repertoire de brouillon', () => {
    // Seuls les segments de REPERTOIRE comptent — c'est la regle de la regex
    // de `scratchDirPatterns`, qui exige un `/` apres le segment pointe.
    eq(isScratchSpecPath('.hidden.spec.ts'), false, 'le fichier lui-meme est juge, pas ecarte')
})

push('le classement travaille sur des CHEMINS, pas des basenames', () => {
    // Deux specs de meme nom dans deux repertoires restent deux entrees.
    const r = classifySpecs(['a/x.spec.ts', 'b/x.spec.ts'], ['a/x.spec.ts'], new Set())
    eq(r.newUngated, ['b/x.spec.ts'], 'la seconde ne doit pas etre absorbee par la premiere')
})

/* ─── Non-vacuite : un balayage vide DOIT etre bloquant ─── */

push('⛔ ZERO fichier lu sur le disque → BLOQUANT, jamais un PASS', () => {
    const msg = blindnessCheck({ allSpecs: [], histoireGated: new Set(['a']), marketingGated: new Set(['b']) })
    if (!msg) throw new Error('un balayage vide a ete accepte — c\'est exactement le defaut a empecher')
})

push('⛔ liste blanche Histoire vide → BLOQUANT (la CI n\'executerait plus rien)', () => {
    const msg = blindnessCheck({ allSpecs: ['a.spec.ts'], histoireGated: new Set(), marketingGated: new Set(['b']) })
    if (!msg) throw new Error('une liste blanche vide a ete acceptee')
})

push('⛔ liste blanche marketing vide → BLOQUANT', () => {
    const msg = blindnessCheck({ allSpecs: ['a.spec.ts'], histoireGated: new Set(['a.spec.ts']), marketingGated: new Set() })
    if (!msg) throw new Error('une liste blanche marketing vide a ete acceptee')
})

push('balayage plein → aucun message de cecite', () => {
    const msg = blindnessCheck({ allSpecs: ['a.spec.ts'], histoireGated: new Set(['a.spec.ts']), marketingGated: new Set(['b.spec.ts']) })
    if (msg) throw new Error(`faux positif de cecite : ${msg}`)
})

/* ─── Runner ─── */

export function runFixtures ({ silent = false } = {}) {
    let failures = 0
    for (const c of CASES) {
        try {
            c.fn()
            if (!silent) console.log(`  ✓ ${c.name}`)
        } catch (e) {
            failures++
            console.log(`  ✗ ${c.name}\n      ${e.message}`)
        }
    }
    return { total: CASES.length, failures }
}

const isDirect = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())
if (isDirect) {
    console.log(`\n═══ spec-coverage — auto-test du detecteur (${CASES.length} fixtures) ═══\n`)
    const { total, failures } = runFixtures()
    console.log(`\n${failures ? '✗' : '✓'} ${total - failures}/${total} fixtures vertes\n`)
    process.exit(failures ? 1 : 0)
}
