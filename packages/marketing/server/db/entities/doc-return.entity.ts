/**
 * doc-return.entity.ts — a return-value row of a util or composable
 * (doc_return). The per-entry uniqueness is enforced by a FUNCTIONAL index
 * `(entry_id, coalesce(name, ''))` owned by the migration, so no `@Unique` here.
 */

import { Column, Entity, Index } from 'typeorm'

import { DB_TABLES } from '../../../src/consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_RETURN)
@Index('doc_return_entry_idx', ['entry_id'])
export class DocReturn extends DocRowBase {
    @Column({ type: 'uuid' })
    entry_id!: string

    @Column({ type: 'text', nullable: true })
    name!: string | null

    @Column({ type: 'text', nullable: true })
    type!: string | null

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
