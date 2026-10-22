/**
 * migration-guard.const.ts — detection rules of the destructive-migration guard (scripts/migration-guard.mjs).
 */

/** Raw-SQL shape TypeORM's generator emits for both FK and CHECK drops
 *  (Postgres represents both as a constraint) and for index drops — one
 *  pattern covers all 16 real statements, including the 2 functional
 *  indexes, because a DROP INDEX statement is textually identical whether
 *  the index is a plain column index or a functional one. */
export const DESTRUCTIVE_SQL_RE = /\bDROP\s+(CONSTRAINT|INDEX)\b/gi

/** Extracts, per match, the kind (CONSTRAINT|INDEX) and the target name —
 *  best-effort; a statement that matches DESTRUCTIVE_SQL_RE but whose name
 *  this can't parse is still reported (kind UNKNOWN), never swallowed. */
export const DROP_NAME_RE = /DROP\s+(CONSTRAINT|INDEX)\s+(?:IF\s+EXISTS\s+)?(?:"?[\w]+"?\.)?"?([\w]+)"?/i

/** QueryRunner API equivalents of the same two operations — not what
 *  `migration:generate` emits today (it always emits raw SQL, verified by
 *  regeneration against the real entities, #831), but a hand-written or
 *  future-TypeORM migration could use them instead. Defense in depth: same
 *  gate, same directive requirement. */
export const DESTRUCTIVE_API_METHODS = new Map([
    ['dropForeignKey', 'CONSTRAINT'],
    ['dropForeignKeys', 'CONSTRAINT'],
    ['dropUniqueConstraint', 'CONSTRAINT'],
    ['dropCheckConstraint', 'CONSTRAINT'],
    ['dropIndex', 'INDEX'],
])

export const ALLOW_DIRECTIVE_RE = /origam-allow-destructive:\s*(.+)/

export const MIN_REASON_LENGTH = 10
