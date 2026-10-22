/**
 * dump-db-seed-sql.mjs — regenerate server/assets/db-seed.sql unconditionally.
 *
 * `docs:dump:sql`. Fix for #191: generate-playgrounds only regenerates the SQL
 * seed when NEW playgrounds are created, so drift-only re-syncs left
 * db-seed.sql lagging behind the JSON fixtures. The docs-fixtures workflow
 * calls this after the fixtures dump so both seed artifacts always match.
 */
import { regenerateDbSeedSql } from './dump-sql.mjs'

try {
    regenerateDbSeedSql()
    console.log('\nDone.')
} catch (err) {
    console.error(err.message)
    process.exit(2)
}
