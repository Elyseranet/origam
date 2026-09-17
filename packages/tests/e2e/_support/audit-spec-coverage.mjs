#!/usr/bin/env node
/*
 * Garde `spec-coverage` (#824) — une spec e2e est executee par la CI, ou
 * elle est ENREGISTREE comme ne l'etant pas. Jamais ni l'un ni l'autre.
 *
 * ─── LE DEFAUT ───────────────────────────────────────────────────────────
 * `E2E_GREEN_ONLY=1` (`ci.yml`) restreint la suite e2e a la liste blanche
 * `GREEN_SPECS` (`playwright.config.ts`). Une spec absente de cette liste ne
 * tourne JAMAIS en CI — et AUCUN signal ne le dit. Mesure : la spec
 * `rating-field-a11y.spec.ts`, livree par #810 et mergee dans `d4de5ca8`,
 * n'a jamais ete executee par la CI depuis son ajout. Elle a ete trouvee par
 * hasard, par un agent qui verifiait si SA propre spec tournerait — elle non
 * plus n'y etait pas.
 *
 * ⛔ Une spec ecrite, relue, mergee et jamais lancee est PIRE qu'une spec
 * absente : elle inscrit au depot une garantie qui n'existe pas. Le prochain
 * lecteur voit un fichier de test a cote du composant et en conclut qu'il
 * est couvert.
 *
 * ─── CE QUE CE GARDE NE FAIT PAS ─────────────────────────────────────────
 * Il ne juge PAS qu'une spec devrait etre gardee. La liste blanche a une
 * raison d'etre : la migration vague par vague documentee dans ROADMAP.md,
 * et l'ecartement de specs connues instables. Reintegrer en masse rendrait
 * la CI rouge en permanence — c'est le defaut d'a cote (#771 : Quality Gate
 * rouge sur 59 runs sur 59, que plus personne ne regardait).
 *
 * Il exige seulement que le choix soit EXPLICITE. Une spec neuve qui n'est
 * ni dans une liste blanche ni dans la baseline fait rougir la CI, avec le
 * message qui dit quoi trancher.
 *
 * ─── L'INSTRUMENT ────────────────────────────────────────────────────────
 * ⛔ Le garde ne re-implemente PAS le filtrage de Playwright. Il le lui
 * DEMANDE : `playwright test --list --reporter=json`, une fois par config,
 * avec exactement les variables d'environnement des deux jobs de CI. C'est
 * la seule facon d'avoir le meme verdict que la CI plutot qu'une deuxieme
 * opinion. Rejouer `minimatch` a la main aurait rate, entre autres, la regle
 * « un motif `testMatch` sans `** /` prefixe est prefixe par Playwright » —
 * une subtilite dont depend tout le classement.
 *
 * `--list` n'amorce PAS le `webServer` : aucune instance de Histoire ni de
 * Nuxt n'est requise (verifie — les deux invocations sortent en quelques
 * secondes sur un port ou rien n'ecoute).
 *
 * ─── LE CRITERE VOULU / OUBLI ────────────────────────────────────────────
 * Consigne dans `baseline/spec-coverage.md`, a cote de la baseline. Resume :
 * la liste blanche est nee le 2026-06-22 (`bfefb6124`). Une spec anterieure
 * appartient au retard de migration documente ; une spec posterieure a ete
 * ecrite alors que le mecanisme existait, donc son auteur devait s'y
 * inscrire. La mesure qui tranche ensuite est « cette spec est-elle verte
 * aujourd'hui ? » — une spec verte et non gardee est un filet perdu, une
 * spec rouge est une sonde ou un defaut ouvert, pas un candidat au gate.
 *
 * Run : node packages/tests/e2e/_support/audit-spec-coverage.mjs
 *       node packages/tests/e2e/_support/audit-spec-coverage.mjs --self-test
 *       node packages/tests/e2e/_support/audit-spec-coverage.mjs --update-baseline
 */

import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { report, writeBaseline } from '../../../ds/scripts/guards/lib/baseline.mjs'
import { blindnessCheck, classifySpecs, specFilesFromListReport } from './lib/spec-coverage.mjs'
import { runFixtures } from './lib/spec-coverage.selftest.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const E2E_DIR = path.resolve(HERE, '..')
const TESTS_PKG = path.resolve(E2E_DIR, '..')
const BASELINE_PATH = path.join(HERE, 'baseline/spec-coverage.json')

const argv = process.argv.slice(2)

/* ─────────────────────────────────────────────────────────────────────────
 * --self-test : les fixtures seules, pour `test:e2e:audit:self`.
 * ───────────────────────────────────────────────────────────────────────── */
if (argv.includes('--self-test')) {
    console.log(`\n═══ spec-coverage — auto-test du detecteur ═══\n`)
    const { total, failures } = runFixtures()
    console.log(`\n${failures ? '✗' : '✓'} ${total - failures}/${total} fixtures vertes\n`)
    process.exit(failures ? 1 : 0)
}

/* ─────────────────────────────────────────────────────────────────────────
 * ⛔ AUTO-TEST D'ABORD, sur le chemin BLOQUANT — motif de `class-fallthrough`
 * (#620) repris par `id-forwarding` (#633). L'etat nominal de ce garde est
 * « 0 nouvelle violation » : un detecteur aveugle imprimerait le meme PASS.
 * ───────────────────────────────────────────────────────────────────────── */
const self = runFixtures({ silent: true })
if (self.failures) {
    console.log('─'.repeat(70))
    console.log('Guard: spec-coverage — AUTO-TEST EN ECHEC, balayage non effectue')
    console.log('─'.repeat(70))
    console.log(`⛔ ${self.failures}/${self.total} fixture(s) du detecteur echouent.`)
    console.log('   Son verdict sur la suite ne vaut rien tant que ces temoins ne')
    console.log('   repassent pas.')
    console.log('   Detail : node packages/tests/e2e/_support/lib/spec-coverage.selftest.mjs')
    console.log('─'.repeat(70))
    process.exit(1)
}

/* ─────────────────────────────────────────────────────────────────────────
 * Interrogation de Playwright — une fois par job de CI.
 * ───────────────────────────────────────────────────────────────────────── */

const require_ = createRequire(import.meta.url)
let PW_CLI
try {
    PW_CLI = require_.resolve('@playwright/test/cli')
} catch {
    console.log('⛔ @playwright/test introuvable. `pnpm install` d\'abord — le garde ne peut pas')
    console.log('   mesurer ce que la CI executera sans demander a Playwright lui-meme.')
    process.exit(1)
}

/**
 * Demande a Playwright la liste EXACTE des fichiers qu'une config executera
 * sous un environnement donne.
 *
 * ⛔ Le status est capture et verifie. Un `--list` qui echoue et dont on
 * lirait quand meme le stdout vide rendrait un ensemble vide — soit, pour un
 * garde naif, « tout est non garde » ou « tout est couvert » selon le sens
 * de la comparaison. Les deux sont faux et aucun n'est distinguable d'une
 * mesure reelle.
 */
function listSpecFiles ({ label, configArgs, env }) {
    const r = spawnSync(process.execPath, [PW_CLI, 'test', ...configArgs, '--project=chromium', '--list', '--reporter=json'], {
        cwd: TESTS_PKG,
        env: { ...process.env, ...env },
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024
    })

    if (r.status !== 0 || r.signal) {
        console.log(`⛔ playwright --list a echoue pour « ${label} » (status ${r.status}, signal ${r.signal ?? 'aucun'}).`)
        console.log('   Une liste blanche qui ne designe plus aucun fichier existant tombe ici :')
        console.log('   Playwright sort en erreur sur « no tests found », et le garde s\'arrete BRUYAMMENT')
        console.log('   au lieu de rendre un ensemble vide qu\'il prendrait pour une mesure.')
        // Le rapport JSON d'un echec commence par un dump complet de la config :
        // n'en imprimer que la partie utile, sinon le diagnostic se noie.
        let detail = (r.stderr ?? '').trim()
        if (!detail) {
            try {
                const j = JSON.parse(r.stdout)
                detail = (j.errors ?? []).map((e) => e.message ?? JSON.stringify(e)).join('\n')
            } catch { detail = (r.stdout ?? '').slice(0, 400) }
        }
        console.log(detail.slice(0, 1500))
        process.exit(1)
    }

    let parsed
    try {
        parsed = JSON.parse(r.stdout)
    } catch (e) {
        console.log(`⛔ rapport JSON illisible pour « ${label} » : ${e.message}`)
        process.exit(1)
    }

    return new Set([...specFilesFromListReport(parsed)].map((f) => path.basename(f)))
}

const histoireGated = listSpecFiles({
    label: 'test-e2e (Histoire, E2E_GREEN_ONLY=1)',
    configArgs: [],
    // Un port ou rien n'ecoute : `--list` n'amorce pas le webServer, et si un
    // jour il le faisait, l'echec serait BRUYANT au lieu de brancher le garde
    // sur le serveur d'un worktree voisin (le piege :6006 de CLAUDE.md).
    env: { E2E_GREEN_ONLY: '1', E2E_HISTOIRE_PORT: '6199' }
})

const marketingGated = listSpecFiles({
    label: 'test-e2e-marketing (Nuxt, MARKETING_GREEN_ONLY=1)',
    configArgs: ['--config=playwright.marketing.config.ts'],
    env: { MARKETING_GREEN_ONLY: '1' }
})

const allSpecs = readdirSync(E2E_DIR).filter((f) => f.endsWith('.spec.ts')).sort()

/* ⛔ Un balayage vide est BLOQUANT — un garde livre dans ce depot a deja
 * annonce `PASS` apres avoir lu zero fichier. */
const blind = blindnessCheck({ allSpecs, histoireGated, marketingGated })
if (blind) {
    console.log('─'.repeat(70))
    console.log('Guard: spec-coverage — BALAYAGE NON EXPLOITABLE')
    console.log('─'.repeat(70))
    console.log(`⛔ ${blind}`)
    console.log('─'.repeat(70))
    process.exit(1)
}

const gated = new Set([...histoireGated, ...marketingGated])
const { ungated, newUngated } = classifySpecs(allSpecs, gated, new Set())

if (argv.includes('--update-baseline')) {
    const written = writeBaseline(BASELINE_PATH, ungated)
    console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
    process.exit(0)
}

const details = new Map(
    newUngated.map((f) => [f, `packages/tests/e2e/${f} — AUCUN job de CI ne l'execute. Ce qu'elle epingle n'est garde par rien.`])
)

const exitCode = report({
    guardName: 'spec-coverage (#824) — une spec e2e est executee par la CI, ou enregistree comme ne l\'etant pas',
    baselinePath: BASELINE_PATH,
    currentIds: ungated,
    detailsById: details,
    coverageNote: `${allSpecs.length} spec(s) sur le disque · ${histoireGated.size} executee(s) par le job test-e2e `
        + `(E2E_GREEN_ONLY=1) · ${marketingGated.size} par test-e2e-marketing (MARKETING_GREEN_ONLY=1) · `
        + `${ungated.length} executee(s) par AUCUN job. Mesure en interrogeant Playwright lui-meme (--list), pas en `
        + `rejouant son filtrage. Ce garde ne dit rien de ce que ces specs VALENT : il dit seulement qu'aucune ne peut `
        + `desormais etre oubliee en silence.`,
    fixHint: 'Une spec neuve n\'a que deux fins legitimes, et il faut en choisir une :\n'
        + '  A — ELLE DOIT GARDER. L\'ajouter a `GREEN_SPECS` (packages/tests/playwright.config.ts), ou a\n'
        + '      `MARKETING_GREEN_SPECS` (playwright.marketing.config.ts) si elle vise le serveur Nuxt.\n'
        + '      ⚠️ Ne l\'y mettre qu\'apres l\'avoir verifiee verte ET stable : `pnpm -F @origam/stories build`\n'
        + '      puis `E2E_STATIC=1 E2E_HISTOIRE_PORT=<libre> pnpm -F @origam/tests exec playwright test <spec>\n'
        + '      --project=chromium --repeat-each=5`. Une spec instable rendrait la CI rouge en permanence,\n'
        + '      ce qui est le defaut d\'a cote (#771).\n'
        + '  B — ELLE NE DOIT PAS GARDER (sonde de diagnostic, defaut encore ouvert, instabilite connue).\n'
        + '      L\'ajouter a packages/tests/e2e/_support/baseline/spec-coverage.json ET ecrire POURQUOI dans\n'
        + '      la PR. La baseline n\'est pas un silencieux : elle ne peut que RETRECIR, et une entree qui\n'
        + '      devient gardee ou dont le fichier disparait fait rougir le garde a son tour.\n'
        + '  Le critere de classement et le recensement sont dans baseline/spec-coverage.md.'
})

process.exit(exitCode)
