/**
 * doc-relation.entity.ts — a typed edge of the documentation graph
 * (doc_relation): used_by / related / family / extends. `rel_type` is
 * CHECK-constrained by the migration. Natural key per entry:
 * (entry_id, rel_type, to_kind, to_slug, to_name, prop_name).
 */

import { Column, Entity, Index, Unique } from 'typeorm'

import { DB_TABLES } from '../../../src/consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_RELATION)
@Unique('doc_relation_edge_uq', ['entry_id', 'rel_type', 'to_kind', 'to_slug', 'to_name', 'prop_name'])
@Index('doc_relation_entry_idx', ['entry_id'])
export class DocRelation extends DocRowBase {
    @Column({ type: 'uuid' })
    entry_id!: string

    @Column({ type: 'text' })
    rel_type!: string

    @Column({ type: 'text', nullable: true })
    to_kind!: string | null

    @Column({ type: 'text', nullable: true })
    to_slug!: string | null

    @Column({ type: 'text', nullable: true })
    to_name!: string | null

    @Column({ type: 'text', nullable: true })
    prop_name!: string | null

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
