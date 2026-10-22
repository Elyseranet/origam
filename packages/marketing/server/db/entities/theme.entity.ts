/**
 * theme.entity.ts — a brand/mode theme record (theme). Reserved macro slot for
 * the `IOrigamTheme` payload (ADR 0001 §1, out of the current ingestion scope);
 * `data` is jsonb. Natural key: slug.
 */

import { Column, Entity, Unique } from 'typeorm'

import { DB_TABLES } from '../../../src/consts/db.const'
import { DocRowBase } from './base.entity'

@Entity(DB_TABLES.THEME)
@Unique('theme_slug_uq', ['slug'])
export class Theme extends DocRowBase {
    @Column({ type: 'text' })
    slug!: string

    @Column({ type: 'text' })
    name!: string

    @Column({ type: 'jsonb', nullable: true })
    data!: unknown | null
}
