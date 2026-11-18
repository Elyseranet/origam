/**
 * doc-example.entity.ts — a runnable example row of any entry (doc_example).
 * Position-addressed: natural key per entry is (entry_id, position). No
 * `orphaned_at` — examples are fully editorial and reconciled by position.
 */

import { Column, Entity, Index, Unique } from 'typeorm'

import { DB_TABLES } from '../../../consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_EXAMPLE)
@Unique('doc_example_entry_position_uq', ['entry_id', 'position'])
@Index('doc_example_entry_idx', ['entry_id'])
export class DocExample extends DocRowBase {
    @Column({ type: 'uuid' })
    entry_id!: string

    @Column({ type: 'text', nullable: true })
    title_key!: string | null

    @Column({ type: 'text', nullable: true })
    title_fallback!: string | null

    @Column({ type: 'text', nullable: true })
    code!: string | null

    @Column({ type: 'text', nullable: true })
    lang!: string | null

    @Column({ type: 'int', default: 0 })
    position!: number

    @Column({ type: 'boolean', default: false })
    edited_by_user!: boolean

    @Column({ type: 'timestamptz', nullable: true })
    editorial_locked_at!: Date | null
}
