/**
 * doc-directive-modifier.entity.ts — a modifier row of a directive
 * (doc_directive_modifier). Natural key per entry: (entry_id, name).
 */

import { Column, Entity, Index, Unique } from 'typeorm'

import { DB_TABLES } from '../../../consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_DIRECTIVE_MODIFIER)
@Unique('doc_directive_modifier_entry_name_uq', ['entry_id', 'name'])
@Index('doc_directive_modifier_entry_idx', ['entry_id'])
export class DocDirectiveModifier extends DocRowBase {
    @Column({ type: 'uuid' })
    entry_id!: string

    @Column({ type: 'text' })
    name!: string

    @Column({ type: 'text', nullable: true })
    type!: string | null

    @Column({ type: 'boolean', nullable: true })
    required!: boolean | null

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
