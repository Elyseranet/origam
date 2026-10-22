/**
 * doc-sync-run.entity.ts — an audit row per ingestion run (doc_sync_run).
 * Records the drift counts and the source git sha. `status` is CHECK-constrained
 * by the migration (running / success / failed). Standalone.
 */

import { Column, Entity, Index } from 'typeorm'

import { DB_TABLES } from '../../../src/consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.DOC_SYNC_RUN)
@Index('doc_sync_run_started_idx', ['started_at'])
export class DocSyncRun extends DocRowBase {
    @Column({ type: 'timestamptz', default: () => 'now()' })
    started_at!: Date

    @Column({ type: 'timestamptz', nullable: true })
    finished_at!: Date | null

    @Column({ type: 'text', nullable: true })
    domain!: string | null

    @Column({ type: 'int', default: 0 })
    created_count!: number

    @Column({ type: 'int', default: 0 })
    updated_count!: number

    @Column({ type: 'int', default: 0 })
    unchanged_count!: number

    @Column({ type: 'int', default: 0 })
    orphaned_count!: number

    @Column({ type: 'text', nullable: true })
    source_commit!: string | null

    @Column({ type: 'text', default: 'running' })
    status!: string

    @Column({ type: 'text', nullable: true })
    error!: string | null
}
