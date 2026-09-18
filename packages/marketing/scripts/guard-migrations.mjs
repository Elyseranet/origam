#!/usr/bin/env node
/**
 * guard-migrations.mjs — refuses an unauthorized destructive migration (#831).
 *
 * WHAT
 *   Scans every migration under `server/db/migrations/*.ts` and fails
 *   (`exit 1`) the moment ONE of them drops a constraint or an index in its
 *   `up()` without an explicit `// origam-allow-destructive: <reason>`
 *   directive on the line immediately above the statement. See
 *   `scripts/lib/migration-guard.mjs`'s header for the full rationale (why
 *   this is the only protection that also covers the 2 functional indexes,
 *   why only `up()` is scanned, why an inline directive was chosen over a
 *   baseline file).
 *
 * WHERE THIS IS WIRED, AND WHY NOT INTO THE TWO EXISTING GUARD FAMILIES
 *   This repo already runs two "Architecture guards (DS)" jobs:
 *     - `pnpm -F origam guards` — audits `packages/ds/src` (the published
 *       Vue component library): props, emits, tokens, file layout.
 *     - `pnpm -F @origam/tests test:e2e:audit` — audits the Histoire
 *       stories/docs surface (variant drift, spec coverage) against the
 *       component catalogue.
 *   Neither one has ever looked at `packages/marketing/server/db` — that
 *   tree is not a component, not a story, not a doc page. Bolting this
 *   check onto either family would be exactly the "confused the two
 *   families" mistake #831's own ticket warns happened today. This guard
 *   is therefore its OWN thing: a script local to `@origam/marketing`
 *   (`pnpm -F @origam/marketing guard:migrations`), with its own CI job
 *   (`migrations-guard`, `.github/workflows/ci.yml`) parallel to
 *   `i18n-check` and `build-marketing` — not a member of either existing
 *   guard suite. It is also wired into `lint-staged` (root `package.json`)
 *   so a migration file can't be committed un-reviewed, and it is NOT
 *   auto-chained after `db:migrate:make` — doing so would make every
 *   freshly generated destructive migration fail immediately with no
 *   annotation possible yet, which is confusing noise, not a gate. The
 *   gate belongs at commit/CI time, after a human has had the chance to
 *   read the generated file and either fix the entities, delete the
 *   dangerous lines, or annotate them.
 *
 * SELF-TEST
 *   `node scripts/guard-migrations.mjs --self-test` — mutation-verifies the
 *   detector itself (see `runSelfTest` below): a real "normal" migration
 *   stays green, the REAL 16-statement destructive diff `db:migrate:make`
 *   produces today is caught in full and refused, the same 16 statements
 *   become green once annotated, and several detection-robustness
 *   variants (case, spacing, quoting, the QueryRunner API shape, a
 *   too-short "reason") are each checked individually. If this ever exits
 *   0 without printing "self-test PASSED", something is badly wrong —
 *   there is no code path that reaches the end silently.
 *
 * Run:
 *   node scripts/guard-migrations.mjs
 *   node scripts/guard-migrations.mjs --self-test
 */

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { scanMigrationSource } from './lib/migration-guard.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = path.join(HERE, '..', 'server', 'db', 'migrations')

function scanDirectory (dir) {
    const files = readdirSync(dir).filter((f) => f.endsWith('.ts')).sort()
    const violations = []

    for (const file of files) {
        const filePath = path.join(dir, file)
        const source = readFileSync(filePath, 'utf8')
        for (const violation of scanMigrationSource(filePath, source)) {
            violations.push({ ...violation, file })
        }
    }

    return { files, violations }
}

function printReport (violations) {
    const authorized = violations.filter((v) => v.authorized)
    const refused = violations.filter((v) => !v.authorized)

    console.log('─'.repeat(72))
    console.log('Garde : migration-guard (aucun DROP CONSTRAINT / DROP INDEX non autorisé dans up())')
    console.log('─'.repeat(72))
    console.log('')

    if (authorized.length > 0) {
        console.log(`✓ ${authorized.length} statement(s) destructif(s) explicitement autorisé(s) :`)
        for (const v of authorized) {
            console.log(`    ${v.file} :: ${v.id}`)
            console.log(`      raison : ${v.reason}`)
        }
        console.log('')
    }

    if (refused.length === 0) {
        console.log(`✓ 0 statement destructif non autorisé — ${violations.length} au total, ${authorized.length} autorisé(s).`)
        return { refused, authorized }
    }

    console.log(`✗ ${refused.length} statement(s) destructif(s) NON autorisé(s) :`)
    console.log('')

    for (const v of refused) {
        console.log(`  ✗ ${v.id}`)
        console.log(`      ${v.statementText}`)
    }

    console.log('')
    console.log(
        'Un DROP CONSTRAINT / DROP INDEX dans up() supprime une protection qui existait'
        + '\navant cette migration (integrite referentielle, contrainte CHECK, ou index'
        + '\nunique — y compris fonctionnel). Si cette suppression est VOULUE, ajoutez la'
        + '\nligne juste au-dessus du `queryRunner.query(...)` :'
        + '\n\n    // origam-allow-destructive: <raison, revue par un humain, >= 10 caracteres>'
        + '\n\nSinon, corrigez la migration (retirez les lignes en trop) ou declarez la'
        + '\nrelation / le @Check() manquant sur l\'entite, si c\'est ce type de defaut.'
    )

    return { refused, authorized }
}

/* ═══════════════════════════ Self-test ═══════════════════════════ */

function assertEqual (actual, expected, label) {
    if (actual !== expected) {
        throw new Error(`${label} : attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(actual)}`)
    }
}

function insertAuthorizationInUpBody (source) {
    const upStart = source.indexOf('public async up')
    const downStart = source.indexOf('public async down')
    if (upStart === -1 || downStart === -1) throw new Error('fixture malformee : up()/down() introuvables')

    const before = source.slice(0, upStart)
    const upBody = source.slice(upStart, downStart)
    const after = source.slice(downStart)

    const annotatedUpBody = upBody.replace(
        /( {8})(await queryRunner\.query\()/g,
        '$1// origam-allow-destructive: fixture de self-test, drop revu et approuve\n$1$2'
    )

    return before + annotatedUpBody + after
}

function runSelfTest () {
    const cases = []
    const record = (name, fn) => {
        try {
            fn()
            cases.push({ name, pass: true })
        } catch (err) {
            cases.push({ name, pass: false, error: err.message })
        }
    }

    /* 1 — the real, committed "normal" migration (add-only) must stay green. */
    record('migration normale reelle (AddDocEntrySvgKeys) -> 0 violation', () => {
        const filePath = path.join(MIGRATIONS_DIR, '1785400000001-AddDocEntrySvgKeys.ts')
        const source = readFileSync(filePath, 'utf8')
        const violations = scanMigrationSource(filePath, source)
        assertEqual(violations.length, 0, 'violations sur AddDocEntrySvgKeys')
    })

    /* 1bis — the other 2 real committed migrations, same control. */
    record('migrations normales reelles (InitDocReference + AddDocMeta) -> 0 violation', () => {
        for (const name of ['1719600000001-InitDocReference.ts', '1782000000001-AddDocMeta.ts']) {
            const filePath = path.join(MIGRATIONS_DIR, name)
            const source = readFileSync(filePath, 'utf8')
            const violations = scanMigrationSource(filePath, source)
            assertEqual(violations.length, 0, `violations sur ${name}`)
        }
    })

    /* 2 — the REAL 16-statement destructive diff `db:migrate:make` produces
     *      today (captured verbatim, see the fixture's own header), with NO
     *      directive -> all 16 caught, all unauthorized, exit-worthy. */
    const realFixturePath = path.join(HERE, 'lib', '__fixtures__', 'real-destructive-diff.fixture.ts')
    const realFixtureSource = readFileSync(realFixturePath, 'utf8')

    record('diff destructif REEL (16 statements, non autorise) -> 16 violations, toutes refusees', () => {
        const violations = scanMigrationSource(realFixturePath, realFixtureSource)
        assertEqual(violations.length, 16, 'nombre de violations')
        assertEqual(violations.every((v) => !v.authorized), true, 'toutes non autorisees')
        assertEqual(violations.filter((v) => v.kind === 'CONSTRAINT').length, 14, 'DROP CONSTRAINT (10 FK + 4 CHECK)')
        assertEqual(violations.filter((v) => v.kind === 'INDEX').length, 2, 'DROP INDEX (les 2 fonctionnels compris)')
    })

    /* 3 — the SAME 16 statements, each annotated -> 0 unauthorized left.
     *      Positive control for the escape hatch itself. */
    record('meme diff, chaque statement annote -> 0 violation non autorisee', () => {
        const annotated = insertAuthorizationInUpBody(realFixtureSource)
        const violations = scanMigrationSource(realFixturePath, annotated)
        assertEqual(violations.length, 16, 'nombre de violations (toujours detectees)')
        assertEqual(violations.every((v) => v.authorized), true, 'toutes autorisees')
    })

    /* 4 — precision/recall variants: the mutation-verification the repo's
     *      other guards require (README: "mutation-verified"). Each proves
     *      the detector does not silently stop seeing a real shape. */
    record('detection insensible a la casse et aux espaces multiples', () => {
        const src = `
import { MigrationInterface, QueryRunner } from 'typeorm'
export class M1 implements MigrationInterface {
    public async up (q: QueryRunner): Promise<void> {
        await q.query(\`alter table "t" drop   constraint "t_c_fkey"\`)
    }
    public async down (q: QueryRunner): Promise<void> {}
}`
        const violations = scanMigrationSource('m1.ts', src)
        assertEqual(violations.length, 1, 'DROP en minuscules avec espaces multiples')
        assertEqual(violations[0].authorized, false, 'non autorise par defaut')
    })

    record('un DROP present uniquement dans down() n\'est PAS signale', () => {
        const src = `
import { MigrationInterface, QueryRunner } from 'typeorm'
export class M2 implements MigrationInterface {
    public async up (q: QueryRunner): Promise<void> {
        await q.query(\`ALTER TABLE "t" ADD COLUMN "c" text\`)
    }
    public async down (q: QueryRunner): Promise<void> {
        await q.query(\`ALTER TABLE "t" DROP COLUMN "c"\`)
        await q.query(\`ALTER TABLE "t" DROP CONSTRAINT "t_c_fkey"\`)
    }
}`
        const violations = scanMigrationSource('m2.ts', src)
        assertEqual(violations.length, 0, 'down() est hors de portee par construction')
    })

    record('un DROP INDEX simple (non fonctionnel) est detecte comme les 2 fonctionnels', () => {
        const src = `
import { MigrationInterface, QueryRunner } from 'typeorm'
export class M3 implements MigrationInterface {
    public async up (q: QueryRunner): Promise<void> {
        await q.query(\`DROP INDEX "public"."some_plain_idx"\`)
    }
    public async down (q: QueryRunner): Promise<void> {}
}`
        const violations = scanMigrationSource('m3.ts', src)
        assertEqual(violations.length, 1, 'index simple detecte')
        assertEqual(violations[0].kind, 'INDEX', 'kind')
        assertEqual(violations[0].name, 'some_plain_idx', 'nom extrait')
    })

    record('API QueryRunner (dropForeignKey / dropIndex) detectee, pas seulement le SQL brut', () => {
        const src = `
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'
export class M4 implements MigrationInterface {
    public async up (q: QueryRunner): Promise<void> {
        await q.dropForeignKey('doc_prop', 'doc_prop_entry_id_fkey')
        await q.dropIndex('doc_value', 'doc_value_entry_value_uq')
    }
    public async down (q: QueryRunner): Promise<void> {}
}`
        const violations = scanMigrationSource('m4.ts', src)
        assertEqual(violations.length, 2, 'les 2 appels API detectes')
    })

    record('une raison trop courte n\'autorise rien (pas un mot magique)', () => {
        const src = `
import { MigrationInterface, QueryRunner } from 'typeorm'
export class M5 implements MigrationInterface {
    public async up (q: QueryRunner): Promise<void> {
        // origam-allow-destructive: ok
        await q.query(\`ALTER TABLE "t" DROP CONSTRAINT "t_c_fkey"\`)
    }
    public async down (q: QueryRunner): Promise<void> {}
}`
        const violations = scanMigrationSource('m5.ts', src)
        assertEqual(violations.length, 1, 'toujours signale')
        assertEqual(violations[0].authorized, false, 'raison de moins de 10 caracteres -> non autorise')
    })

    record('une raison suffisante autorise correctement le statement', () => {
        const src = `
import { MigrationInterface, QueryRunner } from 'typeorm'
export class M6 implements MigrationInterface {
    public async up (q: QueryRunner): Promise<void> {
        // origam-allow-destructive: table retiree du produit, migration de nettoyage validee en revue
        await q.query(\`ALTER TABLE "t" DROP CONSTRAINT "t_c_fkey"\`)
    }
    public async down (q: QueryRunner): Promise<void> {}
}`
        const violations = scanMigrationSource('m6.ts', src)
        assertEqual(violations.length, 1, 'toujours signale (visible, audite)')
        assertEqual(violations[0].authorized, true, 'raison suffisante -> autorise')
    })

    /* ─── Rapport ─── */
    console.log('─'.repeat(72))
    console.log('Self-test — migration-guard')
    console.log('─'.repeat(72))
    console.log('')

    for (const c of cases) {
        console.log(`  ${c.pass ? '✓' : '✗ ROUGE'}  ${c.name}${c.pass ? '' : `\n      ${c.error}`}`)
    }

    const failed = cases.filter((c) => !c.pass)
    console.log('')

    if (failed.length > 0) {
        console.log(`✗ ${failed.length}/${cases.length} self-test(s) en echec — le detecteur ne mesure plus ce qu'il pretend mesurer.`)
        process.exit(1)
    }

    console.log(`✓ ${cases.length}/${cases.length} self-test(s) verts — self-test PASSED.`)
    process.exit(0)
}

/* ═══════════════════════════════ Main ═══════════════════════════════ */

if (process.argv.includes('--self-test')) {
    runSelfTest()
} else {
    const { files, violations } = scanDirectory(MIGRATIONS_DIR)
    console.log(`Migrations auditees (${files.length}) : ${files.join(', ')}`)
    console.log('')

    const { refused } = printReport(violations)

    process.exit(refused.length > 0 ? 1 : 0)
}
