/**
 * InitDocReference — initial schema for the API-Reference store (ADR 0001 §3),
 * as a TypeORM migration. Raw DDL via `queryRunner.query` gives full control
 * over the Postgres specifics TypeORM's schema builder can't express here:
 * `gen_random_uuid()` defaults, CHECK constraints, FUNCTIONAL unique indexes
 * (md5 / coalesce) and the shared `updated_at` trigger.
 *
 * Editorial vs source boundary (ADR §3.3): [ÉDIT] columns carry a row-level
 * lock (`edited_by_user` + `editorial_locked_at`); the re-sync only writes
 * [SRC]. Items removed from the source are flagged via `orphaned_at`, never
 * deleted.
 *
 * Rollback (`down`) drops every object created here in FK-safe order
 * (children → root → standalone), including the trigger function — fully
 * reversible.
 */

import type { MigrationInterface, QueryRunner } from 'typeorm'

import { DB_TABLES, DOC_KINDS, REL_TYPES, SYNC_STATUSES } from '../../../src/consts/db.const'

const FN = 'doc_set_updated_at'
const list = (arr: readonly string[]): string => arr.map(v => `'${v}'`).join(', ')

// The exact set of tables THIS migration creates — the `updated_at` trigger is
// attached to each. Frozen here on purpose: it must NOT be derived from the live
// `Object.values(DB_TABLES)`, which drifts as later migrations add tables (e.g.
// AddDocMeta → doc_meta). Deriving it would make this already-applied migration
// try to trigger a not-yet-existing table on a FRESH database and fail (42P01).
const CREATED_TABLES = [
    DB_TABLES.DOC_ENTRY, DB_TABLES.DOC_PROP, DB_TABLES.DOC_VALUE, DB_TABLES.DOC_PARAM,
    DB_TABLES.DOC_RETURN, DB_TABLES.DOC_EMIT, DB_TABLES.DOC_SLOT, DB_TABLES.DOC_EXAMPLE,
    DB_TABLES.DOC_DIRECTIVE_ARG, DB_TABLES.DOC_DIRECTIVE_MODIFIER, DB_TABLES.DOC_RELATION,
    DB_TABLES.DOC_CATEGORY, DB_TABLES.DOC_SYNC_RUN, DB_TABLES.THEME,
]

const BASE = `
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()`
const LOCK = `
    edited_by_user boolean NOT NULL DEFAULT false,
    editorial_locked_at timestamptz`
const ORPHAN = 'orphaned_at timestamptz'
const POS = 'position integer NOT NULL DEFAULT 0'
const ENTRY_FK = `entry_id uuid NOT NULL REFERENCES ${DB_TABLES.DOC_ENTRY}(id) ON DELETE CASCADE`

export class InitDocReference1719600000001 implements MigrationInterface {
    name = 'InitDocReference1719600000001'

    public async up (q: QueryRunner): Promise<void> {
        await q.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;')
        await q.query(`
            CREATE OR REPLACE FUNCTION ${FN}() RETURNS trigger AS $$
            BEGIN NEW.updated_at = now(); RETURN NEW; END;
            $$ LANGUAGE plpgsql;`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_ENTRY} (${BASE},
            kind text NOT NULL CHECK (kind IN (${list(DOC_KINDS)})),
            slug text NOT NULL,
            name text NOT NULL,
            category text, domain text, icon text,
            description_key text, description_fallback text,
            definition text, signature text, tag text, value text,
            source_file text, package_note text, note_key text, note_fallback text,
            story_url text, doc_url text, parent_slug text,
            kind_extra jsonb,
            ${LOCK}, ${ORPHAN},
            CONSTRAINT doc_entry_kind_slug_uq UNIQUE (kind, slug));`)
        await q.query(`CREATE INDEX doc_entry_kind_idx ON ${DB_TABLES.DOC_ENTRY}(kind);`)
        await q.query(`CREATE INDEX doc_entry_category_idx ON ${DB_TABLES.DOC_ENTRY}(category);`)
        await q.query(`CREATE INDEX doc_entry_parent_slug_idx ON ${DB_TABLES.DOC_ENTRY}(parent_slug);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_PROP} (${BASE}, ${ENTRY_FK},
            name text NOT NULL, type_label text, type_slug text, type_kind text,
            optional boolean, required boolean, default_value text,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN},
            CONSTRAINT doc_prop_entry_name_uq UNIQUE (entry_id, name));`)
        await q.query(`CREATE INDEX doc_prop_entry_idx ON ${DB_TABLES.DOC_PROP}(entry_id);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_VALUE} (${BASE}, ${ENTRY_FK},
            value text NOT NULL,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN});`)
        await q.query(`CREATE INDEX doc_value_entry_idx ON ${DB_TABLES.DOC_VALUE}(entry_id);`)
        await q.query(`CREATE UNIQUE INDEX doc_value_entry_value_uq ON ${DB_TABLES.DOC_VALUE} (entry_id, md5(value));`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_PARAM} (${BASE}, ${ENTRY_FK},
            name text NOT NULL, type text, required boolean, default_value text,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN},
            CONSTRAINT doc_param_entry_name_uq UNIQUE (entry_id, name));`)
        await q.query(`CREATE INDEX doc_param_entry_idx ON ${DB_TABLES.DOC_PARAM}(entry_id);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_RETURN} (${BASE}, ${ENTRY_FK},
            name text, type text,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN});`)
        await q.query(`CREATE INDEX doc_return_entry_idx ON ${DB_TABLES.DOC_RETURN}(entry_id);`)
        await q.query(`CREATE UNIQUE INDEX doc_return_entry_name_uq ON ${DB_TABLES.DOC_RETURN} (entry_id, coalesce(name, ''));`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_EMIT} (${BASE}, ${ENTRY_FK},
            event text NOT NULL, payload_label text, payload_slug text, payload_kind text,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN},
            CONSTRAINT doc_emit_entry_event_uq UNIQUE (entry_id, event));`)
        await q.query(`CREATE INDEX doc_emit_entry_idx ON ${DB_TABLES.DOC_EMIT}(entry_id);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_SLOT} (${BASE}, ${ENTRY_FK},
            slot text NOT NULL, slot_props text,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN},
            CONSTRAINT doc_slot_entry_slot_uq UNIQUE (entry_id, slot));`)
        await q.query(`CREATE INDEX doc_slot_entry_idx ON ${DB_TABLES.DOC_SLOT}(entry_id);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_EXAMPLE} (${BASE}, ${ENTRY_FK},
            title_key text, title_fallback text, code text, lang text,
            ${POS}, ${LOCK},
            CONSTRAINT doc_example_entry_position_uq UNIQUE (entry_id, position));`)
        await q.query(`CREATE INDEX doc_example_entry_idx ON ${DB_TABLES.DOC_EXAMPLE}(entry_id);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_DIRECTIVE_ARG} (${BASE}, ${ENTRY_FK},
            name text NOT NULL, type text, required boolean,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN},
            CONSTRAINT doc_directive_arg_entry_name_uq UNIQUE (entry_id, name));`)
        await q.query(`CREATE INDEX doc_directive_arg_entry_idx ON ${DB_TABLES.DOC_DIRECTIVE_ARG}(entry_id);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_DIRECTIVE_MODIFIER} (${BASE}, ${ENTRY_FK},
            name text NOT NULL, type text, required boolean,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN},
            CONSTRAINT doc_directive_modifier_entry_name_uq UNIQUE (entry_id, name));`)
        await q.query(`CREATE INDEX doc_directive_modifier_entry_idx ON ${DB_TABLES.DOC_DIRECTIVE_MODIFIER}(entry_id);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_RELATION} (${BASE}, ${ENTRY_FK},
            rel_type text NOT NULL CHECK (rel_type IN (${list(REL_TYPES)})),
            to_kind text, to_slug text, to_name text, prop_name text,
            description_key text, description_fallback text,
            ${POS}, ${LOCK}, ${ORPHAN},
            CONSTRAINT doc_relation_edge_uq UNIQUE (entry_id, rel_type, to_kind, to_slug, to_name, prop_name));`)
        await q.query(`CREATE INDEX doc_relation_entry_idx ON ${DB_TABLES.DOC_RELATION}(entry_id);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_CATEGORY} (${BASE},
            kind text NOT NULL CHECK (kind IN (${list(DOC_KINDS)})),
            key text NOT NULL,
            label_key text, label_fallback text, icon text,
            ${POS}, ${LOCK},
            CONSTRAINT doc_category_kind_key_uq UNIQUE (kind, key));`)
        await q.query(`CREATE INDEX doc_category_kind_idx ON ${DB_TABLES.DOC_CATEGORY}(kind);`)

        await q.query(`CREATE TABLE ${DB_TABLES.DOC_SYNC_RUN} (${BASE},
            started_at timestamptz NOT NULL DEFAULT now(),
            finished_at timestamptz,
            domain text,
            created_count integer NOT NULL DEFAULT 0,
            updated_count integer NOT NULL DEFAULT 0,
            unchanged_count integer NOT NULL DEFAULT 0,
            orphaned_count integer NOT NULL DEFAULT 0,
            source_commit text,
            status text NOT NULL DEFAULT 'running' CHECK (status IN (${list(SYNC_STATUSES)})),
            error text);`)
        await q.query(`CREATE INDEX doc_sync_run_started_idx ON ${DB_TABLES.DOC_SYNC_RUN}(started_at);`)

        await q.query(`CREATE TABLE ${DB_TABLES.THEME} (${BASE},
            slug text NOT NULL, name text NOT NULL, data jsonb,
            CONSTRAINT theme_slug_uq UNIQUE (slug));`)

        for (const table of CREATED_TABLES) {
            await q.query(`CREATE TRIGGER ${table}_set_updated_at
                BEFORE UPDATE ON ${table}
                FOR EACH ROW EXECUTE FUNCTION ${FN}();`)
        }
    }

    public async down (q: QueryRunner): Promise<void> {
        const dropOrder = [
            DB_TABLES.DOC_PROP, DB_TABLES.DOC_VALUE, DB_TABLES.DOC_PARAM, DB_TABLES.DOC_RETURN,
            DB_TABLES.DOC_EMIT, DB_TABLES.DOC_SLOT, DB_TABLES.DOC_EXAMPLE,
            DB_TABLES.DOC_DIRECTIVE_ARG, DB_TABLES.DOC_DIRECTIVE_MODIFIER, DB_TABLES.DOC_RELATION,
            DB_TABLES.DOC_ENTRY, DB_TABLES.DOC_CATEGORY, DB_TABLES.DOC_SYNC_RUN, DB_TABLES.THEME,
        ]
        for (const table of dropOrder) {
            await q.query(`DROP TABLE IF EXISTS ${table} CASCADE;`)
        }
        await q.query(`DROP FUNCTION IF EXISTS ${FN}();`)
    }
}
