/**
 * doc-value.entity.ts — a value-bearing row (enum member / const value / type
 * value) of an entry (doc_value). The per-entry uniqueness is enforced by a
 * FUNCTIONAL index `(entry_id, md5(value))` owned by the migration (TypeORM
 * cannot express it as a decorator), so no `@Unique` here.
 */

import { Column, Entity, Index } from 'typeorm'

import { DB_TABLES } from '../../../src/consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_VALUE)
@Index('doc_value_entry_idx', ['entry_id'])
export class DocValue extends DocRowBase {
    @Column({ type: 'uuid' })
    entry_id!: string

    @Column({ type: 'text' })
    value!: string

    @Column({ type: 'text', nullable: true })
    description_key!: string | null

    @Column({ type: 'text', nullable: true })
    description_fallback!: string | null

    @Column({ type: 'int', default: 0 })
    position!: number

    @Column({ type: 'boolean', default: false })
    edited_by_user!: boolean

    @Column({ type: 'timestamptz', nullable: true })
    editorial_locked_at!: Date | null

    @Column({ type: 'timestamptz', nullable: true })
    orphaned_at!: Date | null
}
