/**
 * doc-entry.entity.ts — root, kind-discriminated row of the API-Reference graph.
 * One row per documented symbol (component / composable / const / directive /
 * enum / interface / type / util). Rich, component-only blocks ride in
 * `kind_extra` (jsonb). The FK children reference this table (ON DELETE CASCADE
 * is owned by the migration, synchronize is off).
 */

import { Column, Entity, Index, Unique } from 'typeorm'

import { DB_TABLES } from '../db.const.mjs'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_ENTRY)
@Unique('doc_entry_kind_slug_uq', ['kind', 'slug'])
@Index('doc_entry_kind_idx', ['kind'])
@Index('doc_entry_category_idx', ['category'])
@Index('doc_entry_parent_slug_idx', ['parent_slug'])
export class DocEntry extends DocRowBase {
    @Column({ type: 'text' })
    kind!: string

    @Column({ type: 'text' })
    slug!: string

    @Column({ type: 'text' })
    name!: string

    @Column({ type: 'text', nullable: true })
    category!: string | null

    @Column({ type: 'text', nullable: true })
    domain!: string | null

    @Column({ type: 'text', nullable: true })
    icon!: string | null

    @Column({ type: 'text', nullable: true })
    description_key!: string | null

    @Column({ type: 'text', nullable: true })
    description_fallback!: string | null

    @Column({ type: 'text', nullable: true })
    definition!: string | null

    @Column({ type: 'text', nullable: true })
    signature!: string | null

    @Column({ type: 'text', nullable: true })
    tag!: string | null

    @Column({ type: 'text', nullable: true })
    value!: string | null

    @Column({ type: 'text', nullable: true })
    source_file!: string | null

    @Column({ type: 'text', nullable: true })
    package_note!: string | null

    @Column({ type: 'text', nullable: true })
    note_key!: string | null

    @Column({ type: 'text', nullable: true })
    note_fallback!: string | null

    @Column({ type: 'text', nullable: true })
    story_url!: string | null

    @Column({ type: 'text', nullable: true })
    doc_url!: string | null

    @Column({ type: 'text', nullable: true })
    parent_slug!: string | null

    @Column({ type: 'jsonb', nullable: true })
    kind_extra!: unknown | null

    /**
     * Accessible title/description of the component anatomy diagram's SVG
     * (role="img"). Mirrors `note_key`/`note_fallback`: a per-entry [ÉDIT]
     * key/fallback couple, nullable — only populated for `kind='component'`
     * rows that ship an anatomy diagram (ADR 325, task 1).
     */
    @Column({ type: 'text', nullable: true })
    svg_title_key!: string | null

    @Column({ type: 'text', nullable: true })
    svg_title_fallback!: string | null

    @Column({ type: 'text', nullable: true })
    svg_desc_key!: string | null

    @Column({ type: 'text', nullable: true })
    svg_desc_fallback!: string | null

    @Column({ type: 'boolean', default: false })
    edited_by_user!: boolean

    @Column({ type: 'timestamptz', nullable: true })
    editorial_locked_at!: Date | null

    @Column({ type: 'timestamptz', nullable: true })
    orphaned_at!: Date | null
}
