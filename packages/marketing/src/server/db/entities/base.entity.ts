/**
 * base.entity.ts — shared identity columns for every API-Reference table.
 *
 * `import 'reflect-metadata'` lives here (not only in data-source.ts) so that
 * ANY import path that pulls an entity — the Nitro runtime, the migration CLI
 * OR the ingestion pipeline — loads the reflect-metadata shim BEFORE the first
 * `@Entity`/`@Column` decorator runs. TypeORM requires it whenever class
 * decorators are used.
 *
 * Property names are kept in snake_case (identical to the physical columns) so
 * the repository/EntityManager rows round-trip in snake_case across the whole
 * stack (runtime, pipeline, migrations). `SnakeNamingStrategy` maps them to the
 * same snake_case columns. Every `@Column` declares an explicit `type`, so the
 * entities never rely on `emitDecoratorMetadata` (unsupported by esbuild/Nitro).
 */

import 'reflect-metadata'

import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export abstract class DocRowBase {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date
}
