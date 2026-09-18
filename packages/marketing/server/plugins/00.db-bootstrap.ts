// server/plugins/00.db-bootstrap.ts
//
// Auto-provisionne ET synchronise la base API-Reference au démarrage du serveur
// Nitro — donc à CHAQUE déploiement, sans aucune commande manuelle. Séquence :
//   1. applique les migrations TypeORM (crée / fait évoluer le schéma) ;
//   2. calcule le hash de contenu des fixtures embarquées (server/db/seed/*.json,
//      exposées comme asset serveur `assets:db-seed`) ;
//   3. si ce hash == dernier appliqué (doc_meta.seed_fixture_hash) → FAST PATH,
//      rien à faire (cas du boot normal, ~0 travail) ;
//   4. sinon :
//        - base VIDE → bulk-load rapide depuis server/assets/db-seed.sql ;
//        - base PEUPLÉE → sync idempotent des fixtures (syncFixtures) : crée les
//          nouveaux composants/enfants, met à jour les colonnes [SRC], LAISSE
//          INCHANGÉES les éditions `/admin` lockées ([ÉDIT] + edited_by_user),
//          orpheline (jamais delete) les disparus ;
//        - dans les deux cas on enregistre le nouveau hash.
//
// Robustesse :
//   - un VERROU D'AVIS Postgres (pg_advisory_lock) sur une connexion dédiée
//     sérialise l'opération entre instances : une seule migre+sync à la fois,
//     les autres constatent le hash à jour et passent leur tour ;
//   - idempotent : 2e boot sans changement de fixtures = fast path = 0 écriture ;
//   - self-healing : une base déjà en prod sans ligne de hash (null) déclenche un
//     sync idempotent au 1er boot post-déploiement (sûr, préserve les [ÉDIT]) ;
//   - NON-FATAL : une base non configurée ou injoignable ne fait pas planter le
//     serveur — le site tourne et /api/health reflète l'état (db.ok).

import { DOC_KINDS, DOC_META_KEYS } from '../db/db.const.mjs'
import { DocSyncRun } from '../db/entities'
import { fixtureHash, readMeta, syncFixtures, writeMeta } from '../utils/doc-fixture-sync'

const BOOTSTRAP_LOCK_KEY = 4021

/** Normalise a raw server-asset value (string | Buffer | Uint8Array) to string. */
function toText (raw: unknown): string | null {
    if (raw == null) return null
    if (typeof raw === 'string') return raw
    if (raw instanceof Uint8Array) return Buffer.from(raw).toString('utf-8')
    return String(raw)
}

/** Load every bundled fixture (raw JSON text) keyed by kind. */
async function loadFixtureTexts (): Promise<Record<string, string | null>> {
    const storage = useStorage('assets:db-seed')
    const out: Record<string, string | null> = {}
    for (const kind of DOC_KINDS) {
        out[kind] = toText(await storage.getItemRaw(`${kind}.json`))
    }
    return out
}

export default defineNitroPlugin(async () => {
    if (!isDbConfigured()) {
        console.info('[db-bootstrap] DB non configurée — skip (site OK, pages API-Reference vides tant que NUXT_DB_* absent).')
        return
    }

    let runner
    try {
        const ds = await useDb()
        runner = ds.createQueryRunner()
        await runner.connect()

        // Verrou inter-instances : bloque jusqu'à obtention (une seule bootstrap à la fois).
        await runner.query(`SELECT pg_advisory_lock(${BOOTSTRAP_LOCK_KEY})`)

        const applied = await ds.runMigrations()
        if (applied.length) {
            console.info(`[db-bootstrap] ${applied.length} migration(s) appliquée(s).`)
        }

        // Vérif d'existence NON-throwante (to_regclass renvoie NULL au lieu de
        // lever une erreur) : évite le bruit si une init concurrente n'a pas
        // encore rendu la table visible sur cette connexion.
        const reg = await runner.query("SELECT to_regclass('public.doc_entry') AS t")
        if (!reg[0].t) {
            console.info('[db-bootstrap] schéma pas encore prêt (init concurrente) — une autre instance s\'en charge.')
            return
        }

        // ── Gate par hash de contenu des fixtures embarquées ─────────────────
        const texts = await loadFixtureTexts()
        const hash = fixtureHash(texts)
        const stored = await readMeta(ds.manager, DOC_META_KEYS.SEED_FIXTURE_HASH)

        if (stored === hash) {
            console.info('[db-bootstrap] fixtures à jour (hash inchangé) — sync ignoré.')
            return
        }

        const before = await runner.query('SELECT count(*)::int AS count FROM public.doc_entry')
        const isEmpty = before[0].count === 0

        // ── Base VIDE : bulk-load rapide depuis le snapshot SQL ──────────────
        if (isEmpty) {
            const seed = toText(await useStorage('assets:server').getItem('db-seed.sql'))
            if (seed) {
                await runner.query(seed)
                const after = await runner.query('SELECT count(*)::int AS count FROM doc_entry')
                await writeMeta(ds.manager, DOC_META_KEYS.SEED_FIXTURE_HASH, hash)
                console.info(`[db-bootstrap] base vide — bulk seed SQL appliqué (${after[0].count} entrées), hash enregistré.`)
                return
            }
            console.warn('[db-bootstrap] db-seed.sql absent — bascule sur le sync des fixtures JSON (base vide).')
        }

        // ── Base PEUPLÉE (ou vide sans SQL) : sync idempotent des fixtures ───
        const records = []
        for (const kind of DOC_KINDS) {
            const text = texts[kind]
            if (!text) continue
            const fixture = JSON.parse(text)
            for (const rec of (fixture.entries ?? [])) records.push(rec)
        }

        const counts = await ds.transaction(manager => syncFixtures(manager, records))

        await ds.getRepository(DocSyncRun).insert({
            finished_at: new Date(),
            domain: null,
            created_count: counts.created,
            updated_count: counts.updated,
            unchanged_count: counts.unchanged,
            orphaned_count: counts.orphaned,
            source_commit: process.env.NUXT_DOCS_SOURCE_COMMIT ?? null,
            status: 'success',
            error: null,
        })
        await writeMeta(ds.manager, DOC_META_KEYS.SEED_FIXTURE_HASH, hash)

        console.info(
            `[db-bootstrap] sync fixtures appliqué — created=${counts.created} updated=${counts.updated} ` +
            `unchanged=${counts.unchanged} orphaned=${counts.orphaned}, hash enregistré.`
        )
    } catch (err) {
        console.error('[db-bootstrap] échec (non-fatal) :', err instanceof Error ? err.message : err)
    } finally {
        if (runner) {
            await runner.query(`SELECT pg_advisory_unlock(${BOOTSTRAP_LOCK_KEY})`).catch(() => {})
            await runner.release().catch(() => {})
        }
    }
})
