/**
 * AddDocMeta — adds the tiny key/value `doc_meta` table used by the boot-time
 * fixture sync (see server/plugins/00.db-bootstrap.ts). Holds the
 * `seed_fixture_hash` row so the bootstrap can fast-path when the bundled
 * server/db/seed/*.json is unchanged since the last applied sync.
 *
 * Reuses the shared `doc_set_updated_at` trigger function created by
 * InitDocReference (never dropped unless that migration is reverted).
 *
 * Rollback (`down`) drops the table (its trigger is dropped with it via CASCADE)
 * — fully reversible. The shared function is intentionally left in place because
 * every other table still depends on it.
 */

import type { MigrationInterface, QueryRunner } from 'typeorm'

import { DB_TABLES } from '../../../consts/db.const'
import { DOC_SET_UPDATED_AT_FN } from '../../../consts/db-migrations.const'

export class AddDocMeta1782000000001 implements MigrationInterface {
    name = 'AddDocMeta1782000000001'

    public async up (q: QueryRunner): Promise<void> {
        await q.query(`CREATE TABLE IF NOT EXISTS ${DB_TABLES.DOC_META} (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            key text NOT NULL,
            value text,
            CONSTRAINT doc_meta_key_uq UNIQUE (key));`)

        await q.query(`CREATE TRIGGER ${DB_TABLES.DOC_META}_set_updated_at
            BEFORE UPDATE ON ${DB_TABLES.DOC_META}
            FOR EACH ROW EXECUTE FUNCTION ${DOC_SET_UPDATED_AT_FN}();`)
    }

    public async down (q: QueryRunner): Promise<void> {
        await q.query(`DROP TABLE IF EXISTS ${DB_TABLES.DOC_META} CASCADE;`)
    }
}
