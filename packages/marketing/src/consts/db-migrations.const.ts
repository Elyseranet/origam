/**
 * db-migrations.const.ts — SQL fragments and table lists shared by the TypeORM migrations
 * (server/db/migrations/*.ts). Frozen values: an already-applied migration must keep generating
 * the same SQL, so none of these may be derived from the live `DB_TABLES`.
 */

import { DB_TABLES } from './db.const'

export const DOC_SET_UPDATED_AT_FN = 'doc_set_updated_at'

// The exact set of tables THIS migration creates — the `updated_at` trigger is
// attached to each. Frozen here on purpose: it must NOT be derived from the live
// `Object.values(DB_TABLES)`, which drifts as later migrations add tables (e.g.
// AddDocMeta → doc_meta). Deriving it would make this already-applied migration
// try to trigger a not-yet-existing table on a FRESH database and fail (42P01).
export const INIT_DOC_REFERENCE_TABLES = [
    DB_TABLES.DOC_ENTRY, DB_TABLES.DOC_PROP, DB_TABLES.DOC_VALUE, DB_TABLES.DOC_PARAM,
    DB_TABLES.DOC_RETURN, DB_TABLES.DOC_EMIT, DB_TABLES.DOC_SLOT, DB_TABLES.DOC_EXAMPLE,
    DB_TABLES.DOC_DIRECTIVE_ARG, DB_TABLES.DOC_DIRECTIVE_MODIFIER, DB_TABLES.DOC_RELATION,
    DB_TABLES.DOC_CATEGORY, DB_TABLES.DOC_SYNC_RUN, DB_TABLES.THEME,
]

export const DOC_SQL_BASE_COLUMNS = `
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()`

export const DOC_SQL_LOCK_COLUMNS = `
    edited_by_user boolean NOT NULL DEFAULT false,
    editorial_locked_at timestamptz`

export const DOC_SQL_ORPHAN_COLUMN = 'orphaned_at timestamptz'

export const DOC_SQL_POSITION_COLUMN = 'position integer NOT NULL DEFAULT 0'

export const DOC_SQL_ENTRY_FK_COLUMN = `entry_id uuid NOT NULL REFERENCES ${DB_TABLES.DOC_ENTRY}(id) ON DELETE CASCADE`
