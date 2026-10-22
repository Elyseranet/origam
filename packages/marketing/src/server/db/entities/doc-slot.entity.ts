/**
 * doc-slot.entity.ts — a slot row of a component (doc_slot).
 * Natural key per entry: (entry_id, slot).
 */

import { Column, Entity, Index, Unique } from 'typeorm'

import { DB_TABLES } from '../../../consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_SLOT)
@Unique('doc_slot_entry_slot_uq', ['entry_id', 'slot'])
@Index('doc_slot_entry_idx', ['entry_id'])
export class DocSlot extends DocRowBase {
    @Column({ type: 'uuid' })
    entry_id!: string

    @Column({ type: 'text' })
    slot!: string

    @Column({ type: 'text', nullable: true })
    slot_props!: string | null

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
