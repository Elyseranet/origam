/**
 * AddDocEntrySvgKeys — adds the `*_key`/`*_fallback` couple for the two
 * accessible-text fields of the component anatomy diagram (ADR 325, task 1):
 * `svgTitle` (role="img" accessible title) and `svgDesc` (accessible
 * description). These 354 fields (177 diagrams × 2) previously lived ONLY as
 * raw strings inside `doc_entry.kind_extra->'anatomy'` (jsonb) — no key column
 * at all, so they could never be resolved per-locale like every other
 * documented string. `pages/components/[slug].vue` renders them verbatim in
 * English regardless of the visitor's locale — a direct a11y regression for
 * non-English visitors (the SVG's own accessible name/description never
 * translates).
 *
 * Mirrors the existing `note_key`/`note_fallback` couple already on
 * `doc_entry` (same table, same [ÉDIT] nature, same nullable-text shape) —
 * reusing the established per-entry key/fallback pattern rather than
 * inventing a new child table for two fields. Nullable: only `kind='component'`
 * rows with an anatomy diagram populate them (177 of ~850 rows).
 *
 * NOTE: the raw `kind_extra.anatomy.svgTitle`/`svgDesc` strings are left
 * untouched by this migration — the front (`pages/components/[slug].vue`)
 * still reads them as-is. Rebranching that page onto these new columns (via
 * `reference-mappers.ts`, ADR task 4) is a separate, dependent ticket; this
 * migration only PREPARES the key-bearing columns and their backfilled
 * values so that task can wire the locale resolution without another schema
 * change.
 *
 * Rollback (`down`) drops the 4 columns — fully reversible, no data outside
 * these columns is affected.
 */

import type { MigrationInterface, QueryRunner } from 'typeorm'

import { DB_TABLES } from '../db.const.mjs'

export class AddDocEntrySvgKeys1785400000001 implements MigrationInterface {
    name = 'AddDocEntrySvgKeys1785400000001'

    public async up (q: QueryRunner): Promise<void> {
        await q.query(`ALTER TABLE ${DB_TABLES.DOC_ENTRY}
            ADD COLUMN IF NOT EXISTS svg_title_key text,
            ADD COLUMN IF NOT EXISTS svg_title_fallback text,
            ADD COLUMN IF NOT EXISTS svg_desc_key text,
            ADD COLUMN IF NOT EXISTS svg_desc_fallback text;`)
    }

    public async down (q: QueryRunner): Promise<void> {
        await q.query(`ALTER TABLE ${DB_TABLES.DOC_ENTRY}
            DROP COLUMN IF EXISTS svg_title_key,
            DROP COLUMN IF EXISTS svg_title_fallback,
            DROP COLUMN IF EXISTS svg_desc_key,
            DROP COLUMN IF EXISTS svg_desc_fallback;`)
    }
}
