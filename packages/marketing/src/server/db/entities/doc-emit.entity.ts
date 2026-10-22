/**
 * doc-emit.entity.ts — an emitted event row of a component (doc_emit).
 * Natural key per entry: (entry_id, event).
 */

import { Column, Entity, Index, Unique } from 'typeorm'

import { DB_TABLES } from '../../../consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_EMIT)
@Unique('doc_emit_entry_event_uq', ['entry_id', 'event'])
@Index('doc_emit_entry_idx', ['entry_id'])
export class DocEmit extends DocRowBase {
    @Column({ type: 'uuid' })
    entry_id!: string

    @Column({ type: 'text' })
    event!: string

    @Column({ type: 'text', nullable: true })
    payload_label!: string | null

    @Column({ type: 'text', nullable: true })
    payload_slug!: string | null

    @Column({ type: 'text', nullable: true })
    payload_kind!: string | null

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
