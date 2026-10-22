/**
 * Fixture — REAL `db:migrate:make` output, captured verbatim (#831).
 *
 * Regenerated 2026-09-18 against a disposable Postgres 16 container (applied
 * the 3 real migrations, then ran `migration:generate` against the live
 * entities) and copied out before the throwaway file was deleted from
 * `server/db/migrations/` — it never landed there and was never committed.
 * This is the exact 16-statement `up()` the generator produces today: 10 FK
 * drops, 2 functional-index drops, 4 CHECK drops. See issue #831 and its
 * measurement comment for the full analysis.
 *
 * Used ONLY by `migration-guard.selftest.mjs` as the ground-truth "real
 * unauthorized destructive migration" fixture — never imported by
 * `data-source.ts`, never discovered by the TypeORM CLI (this file does not
 * live under `server/db/migrations/`).
 */

import { MigrationInterface, QueryRunner } from 'typeorm'

export class ProbeDestructive1789760932088 implements MigrationInterface {
    name = 'ProbeDestructive1789760932088'

    public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doc_prop" DROP CONSTRAINT "doc_prop_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_value" DROP CONSTRAINT "doc_value_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_param" DROP CONSTRAINT "doc_param_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_return" DROP CONSTRAINT "doc_return_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_emit" DROP CONSTRAINT "doc_emit_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_slot" DROP CONSTRAINT "doc_slot_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_example" DROP CONSTRAINT "doc_example_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_directive_arg" DROP CONSTRAINT "doc_directive_arg_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_directive_modifier" DROP CONSTRAINT "doc_directive_modifier_entry_id_fkey"`)
        await queryRunner.query(`ALTER TABLE "doc_relation" DROP CONSTRAINT "doc_relation_entry_id_fkey"`)
        await queryRunner.query(`DROP INDEX "public"."doc_value_entry_value_uq"`)
        await queryRunner.query(`DROP INDEX "public"."doc_return_entry_name_uq"`)
        await queryRunner.query(`ALTER TABLE "doc_entry" DROP CONSTRAINT "doc_entry_kind_check"`)
        await queryRunner.query(`ALTER TABLE "doc_relation" DROP CONSTRAINT "doc_relation_rel_type_check"`)
        await queryRunner.query(`ALTER TABLE "doc_category" DROP CONSTRAINT "doc_category_kind_check"`)
        await queryRunner.query(`ALTER TABLE "doc_sync_run" DROP CONSTRAINT "doc_sync_run_status_check"`)
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doc_sync_run" ADD CONSTRAINT "doc_sync_run_status_check" CHECK ((status = ANY (ARRAY['running'::text, 'success'::text, 'failed'::text])))`)
        await queryRunner.query(`ALTER TABLE "doc_category" ADD CONSTRAINT "doc_category_kind_check" CHECK ((kind = ANY (ARRAY['component'::text, 'composable'::text, 'const'::text, 'directive'::text, 'enum'::text, 'interface'::text, 'type'::text, 'util'::text])))`)
        await queryRunner.query(`ALTER TABLE "doc_relation" ADD CONSTRAINT "doc_relation_rel_type_check" CHECK ((rel_type = ANY (ARRAY['used_by'::text, 'related'::text, 'family'::text, 'extends'::text])))`)
        await queryRunner.query(`ALTER TABLE "doc_entry" ADD CONSTRAINT "doc_entry_kind_check" CHECK ((kind = ANY (ARRAY['component'::text, 'composable'::text, 'const'::text, 'directive'::text, 'enum'::text, 'interface'::text, 'type'::text, 'util'::text])))`)
        await queryRunner.query(`CREATE UNIQUE INDEX "doc_return_entry_name_uq" ON "doc_return" USING btree ("entry_id") `)
        await queryRunner.query(`CREATE UNIQUE INDEX "doc_value_entry_value_uq" ON "doc_value" USING btree ("entry_id") `)
        await queryRunner.query(`ALTER TABLE "doc_relation" ADD CONSTRAINT "doc_relation_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_directive_modifier" ADD CONSTRAINT "doc_directive_modifier_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_directive_arg" ADD CONSTRAINT "doc_directive_arg_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_example" ADD CONSTRAINT "doc_example_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_slot" ADD CONSTRAINT "doc_slot_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_emit" ADD CONSTRAINT "doc_emit_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_return" ADD CONSTRAINT "doc_return_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_param" ADD CONSTRAINT "doc_param_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_value" ADD CONSTRAINT "doc_value_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "doc_prop" ADD CONSTRAINT "doc_prop_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "doc_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
    }
}
