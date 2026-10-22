/**
 * doc-meta.entity.ts — a tiny key/value table (doc_meta) holding operational
 * bookkeeping for the API-Reference store. Currently a single row:
 * `seed_fixture_hash` (DOC_META_KEYS), the content hash of the bundled
 * server/db/seed/*.json last applied by the boot-time sync. Standalone.
 */

import { Column, Entity } from 'typeorm'

import { DB_TABLES } from '../../../consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_META)
export class DocMeta extends DocRowBase {
    @Column({ type: 'text', unique: true })
    key!: string

    @Column({ type: 'text', nullable: true })
    value!: string | null
}
