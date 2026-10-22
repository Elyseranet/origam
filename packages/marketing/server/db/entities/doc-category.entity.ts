/**
 * doc-category.entity.ts — a category bucket per kind (doc_category), used to
 * group the index/listing pages. `kind` is CHECK-constrained by the migration.
 * Natural key: (kind, key). Standalone (no entry_id, no orphan).
 */

import { Column, Entity, Index, Unique } from 'typeorm'

import { DB_TABLES } from '../../../src/consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_CATEGORY)
@Unique('doc_category_kind_key_uq', ['kind', 'key'])
@Index('doc_category_kind_idx', ['kind'])
export class DocCategory extends DocRowBase {
    @Column({ type: 'text' })
    kind!: string

    @Column({ type: 'text' })
    key!: string

    @Column({ type: 'text', nullable: true })
    label_key!: string | null

    @Column({ type: 'text', nullable: true })
    label_fallback!: string | null

    @Column({ type: 'text', nullable: true })
    icon!: string | null

    @Column({ type: 'int', default: 0 })
    position!: number

    @Column({ type: 'boolean', default: false })
    edited_by_user!: boolean

    @Column({ type: 'timestamptz', nullable: true })
    editorial_locked_at!: Date | null
}
